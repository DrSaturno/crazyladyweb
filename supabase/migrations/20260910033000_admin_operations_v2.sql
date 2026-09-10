-- SPEC-ADMIN-02 — operaciones, crecimiento y automatizaciones.
-- Los webhooks públicos se guardan sin secretos; credenciales y firmas viven en n8n/servidor.

alter table public.orders
  add column if not exists carrier text not null default '',
  add column if not exists tracking_code text not null default '',
  add column if not exists internal_notes text not null default '',
  add column if not exists discount_code text,
  add column if not exists promotion_discount numeric(12,2) not null default 0 check (promotion_discount >= 0),
  add column if not exists transfer_discount numeric(12,2) not null default 0 check (transfer_discount >= 0);

create table public.discounts (
  id bigint generated always as identity primary key,
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,39}$'),
  discount_type text not null check (discount_type in ('percentage', 'fixed', 'free_shipping')),
  value numeric(12,2) not null default 0 check (value >= 0),
  minimum_amount numeric(12,2) not null default 0 check (minimum_amount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'expired')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at),
  check (discount_type <> 'percentage' or value between 1 and 100)
);
create unique index discounts_code_unique_ci on public.discounts (upper(code));
create index discounts_active_window_idx on public.discounts (starts_at, ends_at) where status = 'active';

create table public.marketing_campaigns (
  id bigint generated always as identity primary key,
  name text not null,
  channel text not null check (channel in ('email', 'whatsapp', 'instagram', 'telegram')),
  objective text not null check (objective in ('conversion', 'retention', 'launch', 'education')),
  audience text not null,
  budget numeric(12,2) not null default 0 check (budget >= 0),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'active', 'completed', 'paused')),
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index marketing_campaigns_status_schedule_idx on public.marketing_campaigns (status, scheduled_at);

create table public.abandoned_carts (
  id bigint generated always as identity primary key,
  session_id text,
  customer_id bigint references public.customers(id) on delete set null,
  customer_name text not null default '',
  email text not null,
  phone text not null default '',
  item_count integer not null check (item_count > 0),
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'open' check (status in ('open', 'contacted', 'recovered', 'dismissed')),
  recovery_code text not null,
  last_activity_at timestamptz not null,
  recovered_order_id bigint references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index abandoned_carts_recovery_queue_idx on public.abandoned_carts (last_activity_at desc) where status in ('open', 'contacted');
create unique index abandoned_carts_session_open_unique on public.abandoned_carts (session_id) where session_id is not null and status in ('open', 'contacted');
create index abandoned_carts_customer_id_idx on public.abandoned_carts (customer_id);
create index abandoned_carts_recovered_order_id_idx on public.abandoned_carts (recovered_order_id) where recovered_order_id is not null;

create table public.return_cases (
  id bigint generated always as identity primary key,
  public_number text not null unique,
  order_id bigint not null references public.orders(id) on delete restrict,
  reason text not null,
  resolution text not null check (resolution in ('refund', 'exchange', 'store_credit')),
  status text not null default 'requested' check (status in ('requested', 'approved', 'received', 'resolved', 'rejected')),
  amount numeric(12,2) not null check (amount >= 0),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index return_cases_queue_idx on public.return_cases (status, created_at desc);
create index return_cases_order_id_idx on public.return_cases (order_id);

create table public.automation_workflows (
  id text primary key,
  name text not null,
  description text not null,
  event_name text not null check (event_name in ('order.created', 'payment.confirmed', 'fulfillment.shipped', 'inventory.low', 'cart.abandoned', 'conversation.handoff', 'return.requested')),
  webhook_url text not null default '',
  enabled boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (webhook_url = '' or webhook_url ~ '^https://')
);

create table public.automation_runs (
  id bigint generated always as identity primary key,
  workflow_id text not null references public.automation_workflows(id) on delete restrict,
  event_name text not null,
  event_key text,
  status text not null check (status in ('queued', 'success', 'failed', 'configuration_required')),
  http_status integer,
  detail text not null default '',
  payload_hash text,
  attempt integer not null default 1 check (attempt > 0),
  created_at timestamptz not null default now()
);
create index automation_runs_workflow_created_idx on public.automation_runs (workflow_id, created_at desc);
create unique index automation_runs_event_attempt_unique on public.automation_runs (workflow_id, event_key, attempt) where event_key is not null;

alter table public.discounts enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.abandoned_carts enable row level security;
alter table public.return_cases enable row level security;
alter table public.automation_workflows enable row level security;
alter table public.automation_runs enable row level security;

create policy discounts_admin_all on public.discounts for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy marketing_campaigns_admin_all on public.marketing_campaigns for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy abandoned_carts_admin_all on public.abandoned_carts for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy return_cases_admin_all on public.return_cases for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy automation_workflows_admin_all on public.automation_workflows for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy automation_runs_admin_all on public.automation_runs for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

grant select, insert, update, delete on public.discounts, public.marketing_campaigns, public.abandoned_carts, public.return_cases, public.automation_workflows, public.automation_runs to authenticated;
grant usage, select on sequence public.discounts_id_seq, public.marketing_campaigns_id_seq, public.abandoned_carts_id_seq, public.return_cases_id_seq, public.automation_runs_id_seq to authenticated;

create trigger discounts_touch_updated_at before update on public.discounts for each row execute function private.touch_updated_at();
create trigger marketing_campaigns_touch_updated_at before update on public.marketing_campaigns for each row execute function private.touch_updated_at();
create trigger abandoned_carts_touch_updated_at before update on public.abandoned_carts for each row execute function private.touch_updated_at();
create trigger return_cases_touch_updated_at before update on public.return_cases for each row execute function private.touch_updated_at();
create trigger automation_workflows_touch_updated_at before update on public.automation_workflows for each row execute function private.touch_updated_at();

create trigger discounts_capture_audit after insert or update or delete on public.discounts for each row execute function private.capture_audit();
create trigger marketing_campaigns_capture_audit after insert or update or delete on public.marketing_campaigns for each row execute function private.capture_audit();
create trigger abandoned_carts_capture_audit after insert or update or delete on public.abandoned_carts for each row execute function private.capture_audit();
create trigger return_cases_capture_audit after insert or update or delete on public.return_cases for each row execute function private.capture_audit();
create trigger automation_workflows_capture_audit after insert or update or delete on public.automation_workflows for each row execute function private.capture_audit();

comment on table public.automation_runs is 'Registro idempotente de intentos; n8n conserva credenciales, firmas y reintentos.';
