create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_name text not null,
  file_path text not null,
  file_type text not null check (file_type in ('pdf', 'docx', 'image')),
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  extracted_text_preview text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists documents_user_updated_idx
  on public.documents (user_id, updated_at desc);

create index if not exists document_chunks_document_idx
  on public.document_chunks (document_id, chunk_index);

alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

create policy "Users can read their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can create their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

create policy "Users can read their own document chunks"
  on public.document_chunks for select
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.documents
      where documents.id = document_chunks.document_id
        and documents.user_id = auth.uid()
    )
  );

create policy "Users can create their own document chunks"
  on public.document_chunks for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.documents
      where documents.id = document_chunks.document_id
        and documents.user_id = auth.uid()
    )
  );

create policy "Users can update their own document chunks"
  on public.document_chunks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own document chunks"
  on public.document_chunks for delete
  using (auth.uid() = user_id);

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'orivoo-documents',
  'orivoo-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read their own document files"
  on storage.objects for select
  using (
    bucket_id = 'orivoo-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own document files"
  on storage.objects for insert
  with check (
    bucket_id = 'orivoo-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own document files"
  on storage.objects for update
  using (
    bucket_id = 'orivoo-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'orivoo-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own document files"
  on storage.objects for delete
  using (
    bucket_id = 'orivoo-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
