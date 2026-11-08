create extension if not exists pgcrypto with schema extensions;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  department text,
  location text,
  employment_type text,
  positions integer check (positions is null or positions > 0),
  short_description text not null,
  description text not null,
  responsibilities text[] not null default '{}',
  qualifications text[] not null default '{}',
  required_experience text,
  required_skills text[] not null default '{}',
  application_deadline timestamptz not null,
  application_email text not null default 'athinet72@gmail.com',
  status text not null default 'draft' check (status in ('open', 'closed', 'draft')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recruitment_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_recruitment_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.recruitment_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_recruitment_admin() from public, anon;
grant execute on function public.is_recruitment_admin() to authenticated;

create or replace function public.generate_application_reference()
returns text
language sql
volatile
set search_path = public, extensions, pg_temp
as $$
  select 'ATHI-' || to_char(now() at time zone 'UTC', 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

revoke all on function public.generate_application_reference() from public, anon, authenticated;
grant execute on function public.generate_application_reference() to service_role;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  application_reference text not null unique default public.generate_application_reference(),
  idempotency_key uuid not null unique,
  job_id uuid not null references public.jobs(id) on delete restrict,
  full_name text not null,
  email text not null,
  phone text not null,
  town_county text not null,
  country text not null,
  education_level text not null,
  course_qualification text not null,
  institution text not null,
  work_experience text not null,
  employment_status text not null,
  relevant_skills text not null,
  interest text not null,
  cover_letter text not null,
  availability text not null,
  consent boolean not null check (consent),
  status text not null default 'received' check (status in ('received', 'under_review', 'shortlisted', 'interview', 'successful', 'unsuccessful')),
  submitted_at timestamptz not null default now()
);

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  document_type text not null check (document_type in ('cv', 'certificate', 'supporting_document')),
  storage_path text not null unique,
  content_type text not null check (content_type in ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  file_size integer not null check (file_size > 0 and file_size <= 5242880),
  created_at timestamptz not null default now()
);

create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_name_idx on public.applications using gin (to_tsvector('simple', full_name));
create index if not exists application_documents_application_id_idx on public.application_documents(application_id);

alter table public.jobs enable row level security;
alter table public.recruitment_admins enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;

revoke all on public.jobs, public.applications, public.application_documents, public.recruitment_admins from public, anon, authenticated;
grant select on public.jobs to anon, authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, update on public.applications to authenticated;
grant select on public.application_documents to authenticated;
grant all on public.jobs, public.applications, public.application_documents, public.recruitment_admins to service_role;

drop policy if exists "public can read published open vacancies" on public.jobs;
create policy "public can read published open vacancies" on public.jobs
  for select to anon, authenticated
  using (status = 'open' and published_at is not null and application_deadline > now());

drop policy if exists "recruitment admins manage vacancies" on public.jobs;
create policy "recruitment admins manage vacancies" on public.jobs
  for all to authenticated
  using (public.is_recruitment_admin())
  with check (public.is_recruitment_admin());

drop policy if exists "recruitment admins read applications" on public.applications;
create policy "recruitment admins read applications" on public.applications
  for select to authenticated
  using (public.is_recruitment_admin());

drop policy if exists "recruitment admins update applications" on public.applications;
create policy "recruitment admins update applications" on public.applications
  for update to authenticated
  using (public.is_recruitment_admin())
  with check (public.is_recruitment_admin());

drop policy if exists "recruitment admins read document records" on public.application_documents;
create policy "recruitment admins read document records" on public.application_documents
  for select to authenticated
  using (public.is_recruitment_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recruitment-documents',
  'recruitment-documents',
  false,
  5242880,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "recruitment admins read private application documents" on storage.objects;
create policy "recruitment admins read private application documents" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'recruitment-documents'
    and exists (
      select 1 from public.applications a
      where a.id::text = (storage.foldername(name))[1]
        and public.is_recruitment_admin()
    )
  );

insert into public.jobs (
  slug, title, department, location, employment_type, positions,
  short_description, description, responsibilities, qualifications,
  required_experience, required_skills, application_deadline,
  application_email, status, published_at
)
values (
  'customer-care-representative-2026',
  'Customer Care Representative',
  null,
  null,
  null,
  null,
  'Join our dynamic team and help us deliver excellent customer service.',
  'Join our dynamic team and help us deliver excellent customer service.',
  '{}',
  array[
    'Must be fluent in both English and Swahili.',
    'Must have completed computer training.',
    'Good communication and interpersonal skills.',
    'Basic computer skills, including MS Word, Excel and email.',
    'Ability to handle customers professionally.',
    'Must be patient, friendly and well-organized.',
    'Ability to work independently and as part of a team.'
  ],
  null,
  '{}',
  '2026-11-15 23:59:59+03',
  'athinet72@gmail.com',
  'open',
  '2026-11-08 00:00:00+03'
)
on conflict (slug) do nothing;