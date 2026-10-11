-- Canyon shop schema: categories, products, profiles (roles), orders

create table public.categories (
  slug text primary key,
  name text not null,
  tagline text not null default '',
  image_id text not null,
  sort int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_slug text not null references public.categories(slug),
  subcategory text not null,
  family text not null,
  price_usd numeric(10,2) not null check (price_usd >= 0),
  original_price_usd numeric(10,2),
  image_id text not null,
  stock int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_slug);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  total_usd numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id);

create table public.order_items (
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity int not null check (quantity > 0),
  unit_price_usd numeric(10,2) not null,
  primary key (order_id, product_id)
);
create index order_items_product_idx on public.order_items(product_id);

-- Role helper (security definer so it can read profiles under RLS)
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

-- Create a profile for every new auth user
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Checkout: validates stock, creates the order and decrements stock atomically
create function public.place_order(items jsonb) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_order uuid;
  item jsonb;
  p public.products;
  qty int;
  total numeric := 0;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if jsonb_array_length(items) = 0 then raise exception 'cart is empty'; end if;

  insert into public.orders (user_id, total_usd) values (uid, 0) returning id into new_order;

  for item in select * from jsonb_array_elements(items) loop
    qty := (item->>'quantity')::int;
    select * into p from public.products
      where id = (item->>'product_id')::uuid and is_active for update;
    if not found then raise exception 'product not found'; end if;
    if qty < 1 or p.stock < qty then raise exception 'สินค้า % มีไม่พอ (เหลือ %)', p.name, p.stock; end if;

    update public.products set stock = stock - qty where id = p.id;
    insert into public.order_items (order_id, product_id, quantity, unit_price_usd)
      values (new_order, p.id, qty, p.price_usd);
    total := total + p.price_usd * qty;
  end loop;

  update public.orders set total_usd = total where id = new_order;
  return new_order;
end;
$$;
revoke execute on function public.place_order(jsonb) from public, anon;
grant execute on function public.place_order(jsonb) to authenticated;

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "categories readable by all" on public.categories for select using (true);
create policy "admins manage categories" on public.categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "products readable by all" on public.products for select using (true);
create policy "admins insert products" on public.products for insert to authenticated
  with check ((select public.is_admin()));
create policy "admins update products" on public.products for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete products" on public.products for delete to authenticated
  using ((select public.is_admin()));

create policy "read own profile or admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "update own name" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- users must not be able to promote themselves
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "read own orders or admin" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "read own order items or admin" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
    and (o.user_id = (select auth.uid()) or (select public.is_admin()))));

insert into public.categories (slug, name, tagline, image_id, sort) values
  ('road', 'Road', 'Aero, Race & Endurance', '2026_FULL_aeroad_cfr-di2_4039_R108_P01_bh6wi2', 1),
  ('time-trial', 'Time Trial', 'Triathlon & TT speed', '2027_FULL_speedmax_cf-slx-8-di2_4520_R133_P02_cz4shv', 2),
  ('gravel', 'Gravel', 'Adventure & Race gravel', '2027_FULL_grizl_cf-7-axs_4554_R126_P05_guxuef', 3),
  ('mountain', 'Mountain', 'Trail, XC, Enduro & Downhill', '2027_FULL_spectral_cf-8_4381_M179_P08_P5_29_pnjmnh', 4);
