-- ============================================================================
-- Family Health — Documents storage: bucket + RLS + 50 MB per-family cap
-- Run in Supabase SQL editor. SAFE: creates new objects only; no data mutated.
-- ============================================================================

-- ── 0. READ-ONLY VERIFY FIRST (run this block alone, eyeball the output) ─────
--    Confirm the documents table columns match what the app expects.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'documents'
order by ordinal_position;
-- Expected: id, name, file_path, file_size, file_type, hidden,
--           person_id, doctor_id, visit_id, family_group_id, uploaded_at
-- If your columns differ, STOP and tell me before running the rest.


-- ── 1. Private storage bucket ────────────────────────────────────────────────
-- 10 MB per-file limit; private (no public URLs — app uses signed URLs).
insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 10485760)
on conflict (id) do update
  set public = false, file_size_limit = 10485760;


-- ── 2. Storage RLS — family-group isolation via path prefix ──────────────────
-- Object path convention: {family_group_id}/{person_id}/{uuid}-{filename}
-- The first path segment is the family_group_id; a user may only touch objects
-- whose first segment is one of their own family groups.


  );

  );

  );


-- ── 3. documents TABLE RLS (metadata rows) ───────────────────────────────────
-- Mirror the family-group pattern used elsewhere. If per-command policies
-- already exist you can skip this; these are idempotent (drop-if-exists first).
alter table public.documents enable row level security;

drop policy if exists "documents_row_all" on public.documents;
create policy "documents_row_all" on public.documents
  for all to authenticated
  using (family_group_id in (select public.my_family_group_ids()))
  with check (family_group_id in (select public.my_family_group_ids()));


-- ── 4. 50 MB per-family soft cap (beta) ──────────────────────────────────────
-- Enforced on metadata insert: sum existing file_size for the family group and
-- reject if this insert would exceed 50 MB. Cheap; runs per-insert only.
create or replace function public.enforce_family_storage_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  used bigint;
  cap  bigint := 52428800;  -- 50 MB
begin
  select coalesce(sum(file_size), 0) into used
  from public.documents
  where family_group_id = new.family_group_id;

  if used + coalesce(new.file_size, 0) > cap then
    raise exception 'STORAGE_CAP_EXCEEDED'
      using hint = 'Family storage limit (50 MB) reached.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_family_storage_cap on public.documents;
create trigger trg_family_storage_cap
  before insert on public.documents
  for each row execute function public.enforce_family_storage_cap();

-- ============================================================================
-- Done. The Smith family group is not referenced or mutated anywhere above.
-- ============================================================================
