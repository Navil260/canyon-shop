-- Per-size stock + MyCanyon-style customisation (Aeroad CFR Di2 only)

create table public.product_sizes (
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  sort int not null,
  stock int not null default 0 check (stock >= 0),
  primary key (product_id, size)
);
alter table public.product_sizes enable row level security;
create policy "sizes readable by all" on public.product_sizes for select using (true);
create policy "admins update sizes" on public.product_sizes for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- products.stock stays as the total across sizes, kept in sync automatically
create function public.sync_product_stock() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.products p
    set stock = coalesce((select sum(stock) from public.product_sizes s where s.product_id = p.id), 0)
    where p.id = coalesce(new.product_id, old.product_id);
  return null;
end;
$$;
revoke execute on function public.sync_product_stock() from public, anon, authenticated;
create trigger product_sizes_sync after insert or update or delete on public.product_sizes
  for each row execute function public.sync_product_stock();

-- Seed sizes: split each product's current stock across its category's sizes
insert into public.product_sizes (product_id, size, sort, stock)
select p.id, s.size, s.sort,
       p.stock / s.n + case when s.sort <= p.stock % s.n then 1 else 0 end
from public.products p
cross join lateral (
  select size, ord::int as sort, count(*) over () as n
  from unnest(case when p.category_slug = 'mountain'
                   then array['XS','S','M','L','XL']
                   else array['2XS','XS','S','M','L','XL','2XL'] end)
       with ordinality as t(size, ord)
) s;

-- Customisation definition (null = not customisable)
alter table public.products add column customization jsonb;

-- Order lines now carry size + chosen build
alter table public.order_items drop constraint order_items_pkey;
alter table public.order_items add column id bigint generated always as identity primary key;
alter table public.order_items add column size text;
alter table public.order_items add column build jsonb;  -- [{step, value, price}]

-- Price a build server-side from the product's definition (never trust browser prices)
create function public.price_build(def jsonb, sel jsonb, out extra numeric, out summary jsonb)
language plpgsql immutable set search_path = ''
as $$
declare
  step jsonb;
  opt jsonb;
  picked jsonb;
  choice text;
begin
  extra := 0;
  summary := '[]'::jsonb;
  for step in select * from jsonb_array_elements(def->'steps') loop
    picked := sel->(step->>'key');
    opt := null;
    select o into opt from jsonb_array_elements(step->'options') o
      where o->>'id' = coalesce(picked->>'option', step->>'default');
    if opt is null then raise exception 'invalid option for %', step->>'title'; end if;

    choice := null;
    if opt ? 'choice' then
      choice := coalesce(picked->>'choice', opt->'choice'->>'default');
      if not (opt->'choice'->'values') ? choice then
        raise exception 'invalid % for %', opt->'choice'->>'label', step->>'title';
      end if;
    end if;

    extra := extra + (opt->>'price')::numeric;
    summary := summary || jsonb_build_object(
      'step', step->>'title',
      'value', (opt->>'name') || coalesce(' · ' || choice, ''),
      'price', (opt->>'price')::numeric);
  end loop;
end;
$$;

-- items: [{product_id, size, quantity, build?}]
drop function public.place_order(jsonb);
create function public.place_order(items jsonb) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_order uuid;
  item jsonb;
  p public.products;
  sz public.product_sizes;
  qty int;
  unit numeric;
  build_summary jsonb;
  build_extra numeric;
  total numeric := 0;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if jsonb_array_length(items) = 0 then raise exception 'cart is empty'; end if;

  insert into public.orders (user_id, total_usd) values (uid, 0) returning id into new_order;

  for item in select * from jsonb_array_elements(items) loop
    qty := (item->>'quantity')::int;
    select * into p from public.products where id = (item->>'product_id')::uuid and is_active;
    if not found then raise exception 'product not found'; end if;

    select * into sz from public.product_sizes
      where product_id = p.id and size = item->>'size' for update;
    if not found then raise exception 'กรุณาเลือกไซซ์ของ %', p.name; end if;
    if qty < 1 or sz.stock < qty then
      raise exception '% ไซซ์ % มีไม่พอ (เหลือ %)', p.name, sz.size, sz.stock;
    end if;

    unit := p.price_usd;
    build_summary := null;
    if item ? 'build' and item->'build' <> 'null'::jsonb then
      if p.customization is null then raise exception '% customise ไม่ได้', p.name; end if;
      select b.extra, b.summary into build_extra, build_summary
        from public.price_build(p.customization, item->'build') b;
      unit := unit + build_extra;
    end if;

    update public.product_sizes set stock = stock - qty where product_id = p.id and size = sz.size;
    insert into public.order_items (order_id, product_id, quantity, unit_price_usd, size, build)
      values (new_order, p.id, qty, unit, sz.size, build_summary);
    total := total + unit * qty;
  end loop;

  update public.orders set total_usd = total where id = new_order;
  return new_order;
end;
$$;
revoke execute on function public.place_order(jsonb) from public, anon;
grant execute on function public.place_order(jsonb) to authenticated;
