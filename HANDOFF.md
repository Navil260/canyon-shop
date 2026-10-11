# Ridelab — Project Handoff

A complete summary of how this project was built, what exists today, how it works, and what is left to do.
Written so someone new can clone the repo and keep going without the original conversation.

---

## 1. What this project is

**Ridelab** is a practice / portfolio e-commerce web app that sells **Canyon bicycles**, laid out like
[canyon.com/en-th](https://www.canyon.com/en-th/).

- **Not affiliated with Canyon.** The site is branded "Ridelab" and shows a banner + footer note saying it is a
  practice project, not Canyon's official site, and that no real payments happen. Keep it that way — using the
  Canyon name/branding on a public site with sign-up and a cart could be mistaken for the real store.
- Product names, prices (US$, as shown on Canyon TH) and images are taken from canyon.com. Images are
  **hot-linked from Canyon's CDN** (`dma.canyon.com`, `www.canyon.com/dw/image/...`), not copied into the repo.
- Purpose: learning project. No real payment, checkout only records an order and reduces stock.

### Original requirements (from the owner)

1. Customer side: see **all Canyon bikes**, grouped by category (Road / Time Trial / Gravel / Mountain …).
2. Admin side: **dashboard** with sales per day / week / month / year, and **stock per product** (what is low / out).
3. **Login, register, forgot password.**
4. Sales numbers = **mock data**. Everything else = **real data in Supabase**.
5. Look and feel similar to canyon.com, using Canyon's images.
6. Later additions (in order):
   - Cart with order placement, **no real payment**.
   - **Customisation like Canyon's "MyCanyon"** — only for **Aeroad CFR Di2**.
   - **Stock tracked per frame size** (2XS–2XL / XS–XL) for every bike.
   - Bike picture **changes colour** when choosing a colour in the configurator.
   - **Logos & bar tape** colour choice (also changes the picture), placed directly **under the selected colour collection**.
   - A **"← ย้อนกลับ" (go back)** button in the configurator.
   - **Demo pictures** (part photo + close-up view) for **cockpit**, then **wheels, saddle and seatpost**.

---

## 2. Tech stack (and why)

| Part | Choice | Why |
|---|---|---|
| Language | **TypeScript** | Catches mistakes while typing; good for a first project |
| Framework | **Next.js 16** (App Router) | Made by Vercel → easiest deploy; customer + admin in one app |
| Styling | **Tailwind CSS v4** | Fast to build Canyon-like layouts |
| DB + Auth | **Supabase** (Postgres, Row Level Security, Supabase Auth) | Owner already had it; Auth gives login/register/reset email for free |
| Charts | **Recharts** | Admin sales chart |
| Hosting | **Vercel** (planned, not deployed yet) | |

Fonts: Barlow + Barlow Condensed (Canyon-like condensed headings) + Noto Sans Thai, via `next/font/google`.
UI text is mostly **Thai**.

### Next.js 16 gotchas (important!)

This is **not** the Next.js most tutorials describe. Read `node_modules/next/dist/docs/` before changing framework-level code.

- **`middleware.ts` is now `proxy.ts`** (`src/proxy.ts`, exported function `proxy`).
- `params`, `searchParams`, `cookies()` are **async** (`await params`). Pages use the global helper types
  `PageProps<"/route">` and `LayoutProps<"/route">`.
- `create-next-app` turned on **`cacheComponents`** by default. **We turned it off** in `next.config.ts` because it
  requires `<Suspense>` around every cookie/session read and is too complex for this project. All pages render
  dynamically on each request — fine for this app.
- Turbopack is the default bundler. `next.config.ts` sets `turbopack.root` (a stray `package-lock.json` in the
  home folder confused root detection).

### Tailwind v4 gotcha

Custom classes used with `@apply` (e.g. `btn`, `btn-dark`, `input`, `label`) must be declared with **`@utility`**,
not `.class {}` — see `src/app/globals.css`. Colour tokens (`ink`, `mist`, `line`, `muted`, `accent`) are defined in `@theme`.

---

## 3. Getting it running on a new machine

```bash
git clone https://github.com/Navil260/canyon-shop.git
cd canyon-shop
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev                  # http://localhost:3000
```

`.env.local` needs:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Both are in Supabase Dashboard → Project Settings → API (use the **publishable** key, never the service-role key).
`.env.local` is git-ignored on purpose.

### Which database?

- The original Supabase project is **"Navil260's Project"** (ref `akzmumumwnqxkupagibo`, region ap-northeast-2).
  To use it, the owner must invite you to the Supabase project (or give you the publishable key).
- **That project also contains unrelated tables from a different app** (a course-booking system: `teachers`,
  `courses`, `sessions`, `bookings`, `app_users`, `auth_sessions`, `permissions`, `role_permissions`, `classes`,
  `links`). **Do not touch them.** Supabase's security advisor flags several of their SECURITY DEFINER functions
  (`login`, `save_user`, …) as callable by anonymous users — that is pre-existing and belongs to the other app.
- **Using your own Supabase project instead:** run every file in `supabase/migrations/` **in order (0001 → 0009)**
  in the SQL editor (or via the Supabase CLI). They create the schema, seed 37 bikes, seed per-size stock and the
  Aeroad customisation. `supabase/data/aeroad-cfr-di2-customization.json` is the **final** version of the
  customisation JSON for reference (migrations 0005–0009 build it up step by step).

### Supabase settings to configure (not done yet!)

1. **Authentication → URL Configuration → Redirect URLs**: add `http://localhost:3000/**` (and the Vercel URL later).
   Without this, the confirm-email and reset-password links don't work.
2. **Email sending:** Supabase's built-in email only delivers to the project's team members and only a few emails
   per hour. For practice, either turn **off "Confirm email"** (Authentication → Sign In / Providers), or set up
   custom SMTP (e.g. Resend).

### Making someone an admin

Register on the site first, then in Supabase SQL editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'their@email.com');
```

Admin pages: `/admin` (dashboard) and `/admin/inventory` (stock). An "Admin" button appears in the header for admins.

---

## 4. Features — what exists today

### Customer side
- **Home `/`** — Canyon-style: full-screen hero ("Kona, Rewritten" Speedmax), category picker, "Bike of the week",
  promo tiles, full-width "Pure Cycling" banner, in-stock product rail, "Level up your ride" tiles.
- **All bikes `/bikes`** — category tabs (`?category=road|time-trial|gravel|mountain`), sub-category chips
  (`&sub=Aero` etc.), sort (price asc/desc, name). "Sale" and "Sold out" badges.
- **Bike detail `/bikes/[slug]`** — big image, price (with strike-through original price on sale items), stock
  status, **size picker** (sold-out sizes crossed out), add to cart, related bikes from the same family.
  Aeroad CFR Di2 also has a **"✦ Customise"** button.
- **Configurator `/bikes/aeroad-cfr-di2-4480/customise`** — see section 6.
- **Cart `/cart`** — stored in the browser (`localStorage` key `cart-v2`). Shows size and (for custom builds) the full spec.
  Checkout requires login (redirects to `/login?next=/cart`), then calls the DB function `place_order`.
- **Account `/account`** — order history with size + custom build per line.
- **Auth** — `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/auth/callback` (swaps the
  email-link code for a session). `?next=` redirects are restricted to same-site paths.

### Admin side (`/admin/*`, guarded by `requireAdmin()` in the layout + RLS in the DB)
- **Dashboard `/admin`** — KPI tiles for today / this week / this month / this year (with % vs the same period
  before), a bar chart with tabs daily (30 d) / weekly (12 w) / monthly (12 m) / yearly (3 y) and a table view,
  sales by category. **All sales numbers are MOCK** (`src/lib/mockSales.ts`, deterministic so they don't jump on
  refresh, Bangkok time). The stock panel on the dashboard is **real**.
- **Inventory `/admin/inventory`** — real data. Filter by all / low / out-of-stock and by category. Edit stock **per
  size** and the "low stock" threshold per product; saved via a server action that re-checks admin.

---

## 5. Database (Supabase / Postgres)

All shop tables have **Row Level Security** on.

| Table | Purpose | Who can read / write |
|---|---|---|
| `categories` | road, time-trial, gravel, mountain | everyone reads; admins write |
| `products` | 37 bikes: name, category, subcategory, family, `price_usd`, `original_price_usd`, `image_id` (Canyon CDN id), `stock` (= total of all sizes, kept in sync by trigger), `low_stock_threshold`, `customization` (jsonb, only Aeroad CFR Di2) | everyone reads; admins write |
| `product_sizes` | stock per (product, size). Road/TT/Gravel: 2XS…2XL, Mountain: XS…XL | everyone reads; admins update |
| `profiles` | one row per auth user (auto-created by trigger), `role` = customer / admin | user reads own (admins read all); users may only update `full_name` (column grant) so nobody can make themselves admin |
| `orders` | user_id, total, status | user reads own; admins read all; insert only through `place_order` |
| `order_items` | product, size, quantity, unit price, `build` (jsonb summary of the custom spec) | same as orders |

Functions:
- `is_admin()` — used inside RLS policies.
- `handle_new_user()` — trigger on `auth.users` that creates the profile.
- `sync_product_stock()` — trigger keeping `products.stock` = sum of `product_sizes.stock`.
- `price_build(def, sel)` — validates a custom build against the product's `customization` JSON and returns the
  extra price + a readable summary. **The browser never decides the price**; the DB recalculates it.
- `place_order(items jsonb)` — `[{product_id, size, quantity, build?}]`. Checks login, locks the size row,
  checks stock, prices custom builds with `price_build`, inserts order + items, decrements size stock, all in one
  transaction. Only `authenticated` may execute it.

Migrations (in `supabase/migrations/`, already applied to the original project):
`0001` schema + RLS + categories · `0002` 37 products · `0003` function grants · `0004` sizes, customization column,
`price_build`, new `place_order` · `0005` Aeroad customisation options · `0006` colour render ids ·
`0007` logos & bar tape accents · `0008` cockpit preview · `0009` wheels / saddle / seatpost preview.

**How the DB logic was tested:** inside a transaction that is never committed — insert a fake `auth.users` row,
`set local role authenticated`, `set local request.jwt.claims = '{"sub": "...", "role":"authenticated"}'`, call
`place_order`, check stock/prices, and let the transaction roll back. Verified: profile auto-created as customer,
stock decreases per size and total stays in sync, customers cannot update products, invalid options/choices are
rejected, custom price correct (e.g. 7,999 + Felipe Pantone 700 + ZIPP 1,100 = 9,799).

---

## 6. The configurator (MyCanyon clone) — how it works

Only **Aeroad CFR Di2** (`slug = aeroad-cfr-di2-4480`) has `products.customization`. All option names and prices
were read from Canyon's real configurator.

### Steps (same order as Canyon)
1. **Colour** — 4 collections: Prima (+0: Nero, Alba, Iride), Fabrio (+200: Dark Matter, Milky Way, Gold Dust,
   Cosmic Ash), Mano (+400: Abell, Himiko, Leo, Henize, Carina, Orion), Opus Limited (+700: Felipe Pantone, Elena
   Salmistraro). Under the **selected** collection: **Logos and bar tape** (Fabrio/Mano have 2 choices, e.g. Abell =
   Green Chrome or White; Prima/Opus have one). Free.
2. **Frame size** — per-size stock.
3. **Cockpit** — CP0048 PACE T-Bar (+0, stem 70/80/90/100 mm) or CP0053 RACE Bar (+350).
4. **Drops** — Classic (+0), Compact (+100), Race (+150).
5. **Crank** — Shimano Dura-Ace R9200, 160 / 165 mm.
6. **Cassette** — Shimano CS-R9200, 11-30 / 11-34.
7. **Wheels** — DT Swiss ARC 1100 55 mm (+0), 65 mm (+150), ZIPP 454 NSW (+1,100), Scope Artech 6 (+1,600).
8. **Saddle** — Selle Italia SLR Carbon (+0), SLR 3D Carbon (+150), SLR Tekno (+150).
9. **Seatpost** — Canyon SP105 / SP093 VCLS Aero (both +0).
10. **Summary** — full spec + price lines.

Canyon's 11th step "Add ons" (accessories, name sticker) was **not** built — the shop has no accessories.

UI: big sticky preview on the left, step tabs, sticky bottom bar with live total, **← ย้อนกลับ** (back),
**ถัดไป →** (next), add to cart (asks for size first).

### JSON shape (`products.customization`)

```jsonc
{
  "preview": "pg_name:{colour};F-nondrive;{wheels};F-drive;{cockpit};{seatpost}-{saddle}/2027_4480_cfr-Di2_3D_Aeroad",
  "steps": [
    {
      "key": "colour", "title": "Colour", "heading": "...", "description": "...", "default": "nero",
      "view": "_CP_24",            // optional: close-up camera for this step
      "options": [
        {
          "id": "abell", "name": "Abell", "price": 400, "group": "Mano Collection",
          "swatch": "https://...",  // colour swatch image
          "render": "20030973",     // render layer id
          "accents": [{ "name": "Green Chrome", "render": "20030966", "swatch": "..." }, ...],
          "choice": { "label": "Logos and bar tape", "values": ["Green Chrome", "White"], "default": "Green Chrome" },
          "image": "https://...",   // part photo shown on the option card
          "choiceRenders": { "70 mm": "20026437", ... } // render layer per sub-choice (stem length)
        }
      ]
    }
  ]
}
```

A customer's selection is `{ [stepKey]: { option, choice? } }`. `src/lib/customization.ts` has
`defaultSelection`, `priceBuild` (display only, mirrors the DB) and `renderPath`.

### How the bike picture changes (reverse-engineered from canyon.com)

Canyon renders custom bikes by stacking layers on its image CDN:

```
https://dma.canyon.com/image/upload/<transform>/pg_name:<COLOUR>;F-nondrive;<WHEELS>;F-drive;<COCKPIT>;<SEATPOST>-<SADDLE>/2027_4480_cfr-Di2_3D_Aeroad<VIEW>
```

- `<COLOUR>` = the selected colour's **logos & bar tape accent** layer id (each colour+accent combination has its own id).
- `<COCKPIT>` = PACE T-Bar: `<stem id>-<drops id>` (stem 70/80/90/100 = 20026437/38/39/40; drops classic/compact/race =
  20030125/20030128/20030126). RACE Bar: a single id `20028956` (one-piece bar, no drops).
- `<WHEELS>`: 20027612 (ARC 55), 20032414 (ARC 65), 20032416 (ZIPP), 20034318 (Scope).
- `<SADDLE>`: 20027914 (SLR Carbon), 20027912 (3D), 20018092 (Tekno). `<SEATPOST>`: 20028850 (SP105), 20028846 (SP093).
- `<VIEW>`: empty = full bike; `_CP_24` cockpit close-up; `_WS_24` wheels close-up; `_S_24` saddle/seatpost close-up.
- **Transform rule:** full-bike view works with `w_<n>/f_auto/q_auto`. **Close-up views only work with exactly
  `w_1920/f_avif`** — anything else returns HTTP 423. `customRender()` in `src/lib/format.ts` handles this.
- Where the ids came from: on canyon.com each option element has `data-option-image-product-id`; the preview
  `<img>` URL contains `pg_name:...`. The configurator preloads all colour images on open and all variants of a
  close-up step when that step opens, so switching feels instant.

**Risk:** this depends on Canyon's private image URLs. If Canyon changes them, previews break (the shop keeps working).

---

## 7. Code map

```
src/
  proxy.ts                      refresh Supabase session; redirect logged-out users away from /admin, /account
  lib/
    supabase/server.ts, client.ts   Supabase clients (server components/actions vs browser)
    auth.ts                     getCurrentUser(), requireAdmin()
    types.ts                    Product, ProductSize, Customization, BuildSelection...
    format.ts                   Canyon image URL helpers (bikeImage, bannerImage, customRender), usd(), stockStatus()
    customization.ts            defaultSelection, priceBuild, renderPath
    mockSales.ts                deterministic mock sales for the dashboard
  components/                   Header, Footer, ProductCard, CartProvider (localStorage cart), CartLink, SizePicker, AuthCard
  app/
    page.tsx                    home
    bikes/page.tsx              listing + filters
    bikes/[slug]/page.tsx       detail (+ AddToCart.tsx)
    bikes/[slug]/customise/     page.tsx (server, loads product+sizes) + Configurator.tsx (client UI)
    cart/page.tsx               cart + checkout (rpc place_order)
    account/page.tsx            order history
    (auth)/                     login, register, forgot-password, reset-password, actions.ts (server actions)
    auth/callback/route.ts      email link handler
    admin/                      layout (guard), page (dashboard), SalesChart.tsx, inventory/ (page + actions)
supabase/
  migrations/                   0001–0009 SQL
  data/aeroad-cfr-di2-customization.json   final customisation JSON (reference)
```

Conventions: Server Components fetch data with the server Supabase client; client components only where
interaction is needed. Images use plain `<img>` (Canyon's CDN already resizes) with an eslint-disable comment.
Prices are US$ like Canyon TH. Check with `npm run build` and `npm run lint` (both pass at handoff).

---

## 8. Things deliberately NOT done / known limitations

- **Not deployed to Vercel yet** (owner asked to only push to GitHub). No Vercel project exists for it yet.
- **Supabase Redirect URLs and email/SMTP settings not configured** (see section 3).
- **No admin account yet** — the owner still has to register and be promoted with the SQL above.
- **Sign-up / login / reset password were not tested end-to-end in the browser** (a safety tool blocked using
  test credentials). Server code builds and the DB side was tested via SQL; do a manual test after configuring Supabase.
- **Admin dashboard UI not visually checked in a browser** (needs an admin login). It builds and the mock numbers were sanity-checked.
- **RACE Bar + Drops mismatch:** RACE Bar is one-piece (Canyon drops the dropbar parameter for it), but our Drops
  step still lets you pick Compact/Race and charges +100/+150. Open question to the owner: hide the Drops step when RACE Bar is selected?
- Crank / cassette choices don't change the picture (same on Canyon).
- Only one bike is customisable. Adding another means scraping its options + render ids into a new `customization` JSON.
- Carts saved before the size/customisation update (key `cart`) are ignored (new key `cart-v2`).
- Product descriptions/specs are minimal (category, family, subcategory) — no full component lists.

## 9. Suggested next steps

1. Configure Supabase redirect URLs + email, register, make an admin, test login / reset password / checkout / admin pages.
2. Decide the RACE Bar + Drops question.
3. Deploy: import the GitHub repo in Vercel, add the two `NEXT_PUBLIC_SUPABASE_*` env vars, add the Vercel URL to Supabase Redirect URLs.
4. Optional: admin page to view all orders; more customisable bikes; accessories / "Add ons" step; real payments (Stripe test mode) if ever needed.
