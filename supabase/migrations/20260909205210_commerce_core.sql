-- SPEC-WEB-03 / ADMIN-01 — núcleo transaccional Crazy Lady Seeds.
-- El checkout público crea órdenes mediante una Edge Function con service role;
-- el navegador jamás recibe una clave privilegiada ni escribe precios/stock.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'manager', 'support')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid()) and active = true
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create table public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id bigint generated always as identity primary key,
  public_id text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 180),
  description text not null default '',
  category_id bigint not null references public.categories(id) on delete restrict,
  bank text not null,
  origin text not null check (origin in ('nacional', 'importada')),
  seed_type text not null check (seed_type in ('feminizada', 'automatica', 'cbd')),
  genetics text not null check (genetics in ('indica', 'sativa', 'hibrida')),
  price numeric(12,2) not null check (price >= 0),
  promotional_price numeric(12,2) check (promotional_price is null or (promotional_price >= 0 and promotional_price < price)),
  stock integer not null default 0 check (stock >= 0),
  presentation text not null,
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  photoperiod text,
  environment text,
  difficulty text,
  cycle_weeks smallint check (cycle_weeks is null or cycle_weeks > 0),
  thc text,
  cbd text,
  inase boolean not null default false,
  visible_web boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id bigint generated always as identity primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text not null default '',
  crm_stage text not null default 'nuevo' check (crm_stage in ('nuevo', 'contactado', 'interesado', 'cliente', 'inactivo')),
  tags text[] not null default '{}',
  notes text not null default '',
  consent_marketing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index customers_email_unique_ci on public.customers (lower(email));
create index customers_crm_stage_idx on public.customers (crm_stage, updated_at desc);

create table public.orders (
  id bigint generated always as identity primary key,
  public_number text not null unique,
  customer_id bigint references public.customers(id) on delete set null,
  session_id text,
  status text not null default 'pendiente' check (status in ('pendiente', 'confirmado', 'preparando', 'enviado', 'completado', 'cancelado')),
  payment_status text not null default 'pendiente' check (payment_status in ('pendiente', 'pagado', 'fallido', 'reintegrado')),
  fulfillment_status text not null default 'pendiente' check (fulfillment_status in ('pendiente', 'preparando', 'despachado', 'entregado', 'cancelado')),
  currency text not null default 'ARS' check (currency = 'ARS'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  shipping numeric(12,2) not null default 0 check (shipping >= 0),
  total numeric(12,2) not null check (total >= 0),
  address_snapshot jsonb not null check (jsonb_typeof(address_snapshot) = 'object'),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total = subtotal - discount + shipping)
);
create index orders_customer_id_idx on public.orders (customer_id);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_open_idx on public.orders (created_at desc) where status not in ('completado', 'cancelado');

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  sku text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

create table public.payments (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete restrict,
  provider text not null check (provider in ('transferencia', 'mercado_pago')),
  external_id text,
  status text not null check (status in ('pendiente', 'pagado', 'fallido', 'reintegrado')),
  amount numeric(12,2) not null check (amount >= 0),
  raw_event_hash text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index payments_provider_external_unique on public.payments (provider, external_id) where external_id is not null;
create index payments_order_id_idx on public.payments (order_id);

create table public.inventory_movements (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete restrict,
  order_id bigint references public.orders(id) on delete set null,
  delta integer not null check (delta <> 0),
  reason text not null,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index inventory_product_created_idx on public.inventory_movements (product_id, created_at desc);
create index inventory_order_id_idx on public.inventory_movements (order_id);

create table public.conversations (
  id bigint generated always as identity primary key,
  external_id text,
  channel text not null check (channel in ('whatsapp', 'instagram', 'telegram', 'web')),
  customer_id bigint references public.customers(id) on delete set null,
  status text not null default 'bot' check (status in ('bot', 'human', 'closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index conversations_channel_external_unique on public.conversations (channel, external_id) where external_id is not null;
create index conversations_customer_id_idx on public.conversations (customer_id);
create index conversations_inbox_idx on public.conversations (status, last_message_at desc);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations(id) on delete cascade,
  external_id text,
  sender_type text not null check (sender_type in ('customer', 'bot', 'agent', 'system')),
  body text not null,
  topic text,
  delivery_status text not null default 'received' check (delivery_status in ('received', 'queued', 'sent', 'delivered', 'read', 'failed')),
  created_at timestamptz not null default now()
);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);
create unique index messages_external_unique on public.messages (conversation_id, external_id) where external_id is not null;

create table public.content_entries (
  id bigint generated always as identity primary key,
  content_type text not null check (content_type in ('faq', 'banner', 'pagina')),
  slug text not null unique,
  title text not null,
  body text not null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_published_idx on public.content_entries (content_type, published_at desc) where published = true;

create table public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.module_settings (
  module_id text primary key,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('page_view', 'search', 'filter_applied', 'product_view', 'add_to_cart', 'remove_from_cart', 'begin_checkout', 'shipping_selected', 'payment_started', 'purchase', 'newsletter_opt_in', 'bot_opened', 'bot_handoff_requested')),
  session_id text,
  customer_id bigint references public.customers(id) on delete set null,
  properties jsonb not null default '{}'::jsonb check (jsonb_typeof(properties) = 'object'),
  created_at timestamptz not null default now()
);
create index analytics_name_created_idx on public.analytics_events (event_name, created_at desc);
create index analytics_customer_id_idx on public.analytics_events (customer_id);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  entity text not null,
  entity_id text not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_entity_created_idx on public.audit_logs (entity, entity_id, created_at desc);
create index audit_actor_id_idx on public.audit_logs (actor_id);

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['admin_users','categories','products','customers','orders','conversations','content_entries'] loop
    execute format('create trigger %I before update on public.%I for each row execute function private.touch_updated_at()', table_name || '_touch_updated_at', table_name);
  end loop;
end $$;

create or replace function private.capture_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs(actor_id, entity, entity_id, action, before_data, after_data)
  values (
    (select auth.uid()),
    tg_table_name,
    coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id', to_jsonb(new)->>'key', to_jsonb(old)->>'key', to_jsonb(new)->>'module_id', to_jsonb(old)->>'module_id', 'unknown'),
    lower(tg_op),
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
revoke all on function private.capture_audit() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['categories','products','customers','orders','payments','inventory_movements','content_entries','store_settings','module_settings'] loop
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.capture_audit()', table_name || '_capture_audit', table_name);
  end loop;
end $$;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.content_entries enable row level security;
alter table public.store_settings enable row level security;
alter table public.module_settings enable row level security;
alter table public.analytics_events enable row level security;
alter table public.audit_logs enable row level security;

create policy categories_anon_read on public.categories for select to anon using (active = true);
create policy categories_authenticated_read on public.categories for select to authenticated using (active = true or (select private.is_admin()));
create policy products_anon_read on public.products for select to anon using (visible_web = true);
create policy products_authenticated_read on public.products for select to authenticated using (visible_web = true or (select private.is_admin()));
create policy content_anon_read on public.content_entries for select to anon using (published = true);
create policy content_authenticated_read on public.content_entries for select to authenticated using (published = true or (select private.is_admin()));
create policy customers_own_read on public.customers for select to authenticated using (auth_user_id = (select auth.uid()) or (select private.is_admin()));
create policy customers_own_update on public.customers for update to authenticated using (auth_user_id = (select auth.uid()) or (select private.is_admin())) with check (auth_user_id = (select auth.uid()) or (select private.is_admin()));
create policy orders_own_read on public.orders for select to authenticated using ((select private.is_admin()) or customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy order_items_own_read on public.order_items for select to authenticated using ((select private.is_admin()) or order_id in (select o.id from public.orders o join public.customers c on c.id = o.customer_id where c.auth_user_id = (select auth.uid())));

-- Administración: cada tabla operativa mantiene deny-by-default para no administradores.
do $$
declare table_name text;
begin
  foreach table_name in array array['admin_users','categories','products','customers','orders','order_items','payments','inventory_movements','conversations','messages','content_entries','store_settings','module_settings','analytics_events','audit_logs'] loop
    execute format('create policy %I on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', table_name || '_admin_all', table_name);
  end loop;
end $$;

-- La Data API exige grants explícitos; RLS sigue siendo la barrera por fila.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.categories, public.products, public.content_entries to anon, authenticated;
grant select, update on public.customers to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant select, insert, update, delete on public.admin_users, public.categories, public.products, public.customers, public.orders, public.order_items, public.payments, public.inventory_movements, public.conversations, public.messages, public.content_entries, public.store_settings, public.module_settings, public.analytics_events, public.audit_logs to authenticated;
grant usage, select on all sequences in schema public to authenticated;

comment on table public.products is 'Fuente única de catálogo público, inventario y respuestas del bot.';
comment on table public.audit_logs is 'Bitácora inmutable generada por triggers para cambios administrativos.';
