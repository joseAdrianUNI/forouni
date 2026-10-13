create extension if not exists pgcrypto;

do $$
begin
  create type user_role as enum ('student', 'professor', 'moderator', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type report_status as enum ('pending', 'resolved', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(150) not null,
  email varchar(255) not null unique,
  student_id varchar(50) unique,
  password_hash text not null,
  role user_role not null default 'student',
  avatar_url text,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug varchar(80) not null unique,
  name varchar(100) not null,
  description text,
  icon varchar(100),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  title varchar(120) not null,
  content text not null,
  category_id uuid not null references categories(id) on delete restrict,
  author_id uuid not null references users(id) on delete cascade,
  image_url text,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  replies_count integer not null default 0 check (replies_count >= 0),
  reactions_count integer not null default 0 check (reactions_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  parent_post_id uuid references posts(id) on delete set null,
  content text not null,
  image_url text,
  reactions_count integer not null default 0 check (reactions_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  target_type varchar(20) not null check (target_type in ('thread', 'post')),
  target_id uuid not null,
  reaction_type varchar(30) not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references users(id) on delete cascade,
  target_type varchar(20) not null check (target_type in ('thread', 'post')),
  target_id uuid not null,
  reason text not null,
  status report_status not null default 'pending',
  resolved_by uuid references users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_threads_category_created
  on threads(category_id, created_at desc);
create index if not exists idx_threads_author on threads(author_id);
create index if not exists idx_posts_thread_created
  on posts(thread_id, created_at asc);
create index if not exists idx_reports_status on reports(status);
create index if not exists idx_reactions_target
  on reactions(target_type, target_id);

insert into categories (slug, name, display_order)
values
  ('general', 'General', 1),
  ('carreras', 'Carreras', 2),
  ('examenes', 'Examenes', 3),
  ('eventos', 'Eventos', 4),
  ('tecnologia', 'Tecnologia', 5),
  ('off-topic', 'Off-topic', 6)
on conflict (slug) do nothing;