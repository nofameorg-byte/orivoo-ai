create table if not exists public.academy_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text not null,
  subject text not null,
  grade_level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  title text not null,
  questions_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.academy_flashcards (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  front_text text not null,
  back_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.academy_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  completion_percent integer not null default 0 check (completion_percent >= 0 and completion_percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists academy_courses_user_updated_idx
  on public.academy_courses (user_id, updated_at desc);

create index if not exists academy_courses_project_updated_idx
  on public.academy_courses (project_id, updated_at desc);

create index if not exists academy_lessons_course_idx
  on public.academy_lessons (course_id, created_at asc);

alter table public.academy_courses enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_quizzes enable row level security;
alter table public.academy_flashcards enable row level security;
alter table public.academy_progress enable row level security;

create policy "Users can read their own academy courses"
  on public.academy_courses for select
  using (auth.uid() = user_id or public.is_super_admin());

create policy "Users can create their own academy courses"
  on public.academy_courses for insert
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1 from public.projects
        where projects.id = academy_courses.project_id
          and projects.user_id = auth.uid()
      )
    )
  );

create policy "Users can update their own academy courses"
  on public.academy_courses for update
  using (auth.uid() = user_id or public.is_super_admin())
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1 from public.projects
        where projects.id = academy_courses.project_id
          and projects.user_id = auth.uid()
      )
    )
  );

create policy "Users can delete their own academy courses"
  on public.academy_courses for delete
  using (auth.uid() = user_id or public.is_super_admin());

create policy "Users can manage lessons for their own academy courses"
  on public.academy_lessons for all
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.academy_courses
      where academy_courses.id = academy_lessons.course_id
        and academy_courses.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.academy_courses
      where academy_courses.id = academy_lessons.course_id
        and academy_courses.user_id = auth.uid()
    )
  );

create policy "Users can manage quizzes for their own academy lessons"
  on public.academy_quizzes for all
  using (
    public.is_super_admin()
    or exists (
      select 1
      from public.academy_lessons
      join public.academy_courses on academy_courses.id = academy_lessons.course_id
      where academy_lessons.id = academy_quizzes.lesson_id
        and academy_courses.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.academy_lessons
      join public.academy_courses on academy_courses.id = academy_lessons.course_id
      where academy_lessons.id = academy_quizzes.lesson_id
        and academy_courses.user_id = auth.uid()
    )
  );

create policy "Users can manage flashcards for their own academy lessons"
  on public.academy_flashcards for all
  using (
    public.is_super_admin()
    or exists (
      select 1
      from public.academy_lessons
      join public.academy_courses on academy_courses.id = academy_lessons.course_id
      where academy_lessons.id = academy_flashcards.lesson_id
        and academy_courses.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.academy_lessons
      join public.academy_courses on academy_courses.id = academy_lessons.course_id
      where academy_lessons.id = academy_flashcards.lesson_id
        and academy_courses.user_id = auth.uid()
    )
  );

create policy "Users can manage their own academy progress"
  on public.academy_progress for all
  using (auth.uid() = user_id or public.is_super_admin())
  with check (auth.uid() = user_id);

create policy "Super admins can read all academy lessons"
  on public.academy_lessons for select
  using (public.is_super_admin());

create policy "Super admins can read all academy quizzes"
  on public.academy_quizzes for select
  using (public.is_super_admin());

create policy "Super admins can read all academy flashcards"
  on public.academy_flashcards for select
  using (public.is_super_admin());

drop trigger if exists set_academy_courses_updated_at on public.academy_courses;
create trigger set_academy_courses_updated_at
  before update on public.academy_courses
  for each row execute function public.set_updated_at();

drop trigger if exists set_academy_lessons_updated_at on public.academy_lessons;
create trigger set_academy_lessons_updated_at
  before update on public.academy_lessons
  for each row execute function public.set_updated_at();

drop trigger if exists set_academy_progress_updated_at on public.academy_progress;
create trigger set_academy_progress_updated_at
  before update on public.academy_progress
  for each row execute function public.set_updated_at();
