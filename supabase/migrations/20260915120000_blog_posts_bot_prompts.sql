-- SPEC-ADMIN-03 — diario/blog administrable y prompt versionado del bot.
-- El prompt es operativo e interno: solo administradores lo leen; el backend del bot lo toma con service role.

create table public.blog_posts (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  post_type text not null check (post_type in ('guia', 'problema')),
  title text not null check (char_length(title) between 3 and 180),
  excerpt text not null check (char_length(excerpt) between 1 and 300),
  body text[] not null check (cardinality(body) > 0),
  probable_cause text,
  recommended_product_id bigint references public.products(id) on delete set null,
  reading_minutes integer not null default 1 check (reading_minutes between 1 and 120),
  published boolean not null default false,
  published_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (post_type <> 'problema' or char_length(coalesce(probable_cause, '')) > 0)
);
create index blog_posts_published_idx on public.blog_posts (published_on desc) where published = true;
create index blog_posts_recommended_product_id_idx on public.blog_posts (recommended_product_id);

create table public.bot_prompts (
  id bigint generated always as identity primary key,
  bot_key text not null default 'emma' check (bot_key ~ '^[a-z0-9_-]{2,40}$'),
  bot_name text not null check (char_length(bot_name) between 2 and 40),
  tone text not null check (tone in ('profesional', 'cercano_humor', 'dinamico')),
  greeting text not null check (char_length(greeting) between 1 and 500),
  system_prompt text not null check (char_length(system_prompt) between 50 and 20000),
  is_active boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index bot_prompts_one_active_per_bot on public.bot_prompts (bot_key) where is_active;
create index bot_prompts_history_idx on public.bot_prompts (bot_key, created_at desc);
create index bot_prompts_created_by_idx on public.bot_prompts (created_by);

alter table public.blog_posts enable row level security;
alter table public.bot_prompts enable row level security;

create policy blog_posts_anon_read on public.blog_posts for select to anon using (published = true);
create policy blog_posts_authenticated_read on public.blog_posts for select to authenticated using (published = true or (select private.is_admin()));
create policy blog_posts_admin_all on public.blog_posts for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy bot_prompts_admin_all on public.bot_prompts for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

grant select on public.blog_posts to anon, authenticated;
grant select, insert, update, delete on public.blog_posts, public.bot_prompts to authenticated;
grant usage, select on sequence public.blog_posts_id_seq, public.bot_prompts_id_seq to authenticated;

create trigger blog_posts_touch_updated_at before update on public.blog_posts for each row execute function private.touch_updated_at();
create trigger blog_posts_capture_audit after insert or update or delete on public.blog_posts for each row execute function private.capture_audit();
create trigger bot_prompts_capture_audit after insert or update or delete on public.bot_prompts for each row execute function private.capture_audit();

comment on table public.blog_posts is 'Notas de «El diario de Crazy Lady»; la tienda solo lee las publicadas.';
comment on table public.bot_prompts is 'Versiones del prompt del bot; una activa por bot. Nunca se expone al navegador público.';
