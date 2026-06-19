import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileDown,
  FolderKanban,
  Trash2,
} from "lucide-react";
import {
  assignAcademyCourseToProject,
  deleteAcademyCourse,
  updateAcademyProgress,
} from "@/app/actions/academy";
import { AcademyActions } from "@/components/academy/academy-actions";
import { createClient } from "@/lib/supabase/server";

type AcademyCoursePageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ message?: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AcademyCoursePage({
  params,
  searchParams,
}: AcademyCoursePageProps) {
  const { courseId } = await params;
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access ORIVOO Academy.");
  }

  const [
    { data: course, error: courseError },
    { data: lessons },
    { data: progress },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("academy_courses")
      .select("id,title,description,subject,grade_level,project_id,created_at,updated_at")
      .eq("id", courseId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("academy_lessons")
      .select("id,title,content,created_at")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true }),
    supabase
      .from("academy_progress")
      .select("completion_percent")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("id,name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (courseError || !course) {
    notFound();
  }

  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);
  const [{ data: quizzes }, { data: flashcards }] = await Promise.all([
    lessonIds.length
      ? supabase
          .from("academy_quizzes")
          .select("id,title,questions_json,lesson_id")
          .in("lesson_id", lessonIds)
      : Promise.resolve({ data: [] }),
    lessonIds.length
      ? supabase
          .from("academy_flashcards")
          .select("id,front_text,back_text,lesson_id")
          .in("lesson_id", lessonIds)
      : Promise.resolve({ data: [] }),
  ]);
  const projectName =
    projects?.find((project) => project.id === course.project_id)?.name ?? null;

  return (
    <div id="workspace" className="space-y-6">
      <Link href="/dashboard/academy" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" aria-hidden />
        Back to Academy
      </Link>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
              <BookOpen className="size-6" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Academy Course
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-muted">{course.description}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
            <Metric label="Subject" value={course.subject} />
            <Metric label="Grade" value={course.grade_level} />
            <Metric label="Progress" value={`${progress?.completion_percent ?? 0}%`} />
          </div>
        </div>
        <p className="mt-5 text-xs text-muted">
          Project: {projectName ?? "No project"} · Created {formatDate(course.created_at)}
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <form action={assignAcademyCourseToProject}>
            <input type="hidden" name="courseId" value={course.id} />
            <label className="text-sm font-medium text-white">
              Assign course to project
              <select name="projectId" defaultValue={course.project_id ?? ""} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50">
                <option value="">No project</option>
                {(projects ?? []).map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-bright">
              <FolderKanban className="size-4" aria-hidden />
              Save project
            </button>
          </form>
          <form action={updateAcademyProgress}>
            <input type="hidden" name="courseId" value={course.id} />
            <label className="text-sm font-medium text-white">
              Completion percent
              <input name="completionPercent" type="number" min={0} max={100} defaultValue={progress?.completion_percent ?? 0} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50" />
            </label>
            <button className="mt-3 rounded-full border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-bright">
              Update progress
            </button>
          </form>
          <form action={deleteAcademyCourse}>
            <input type="hidden" name="courseId" value={course.id} />
            <button className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2.5 text-sm text-red-100 hover:bg-red-500/10">
              <Trash2 className="size-4" aria-hidden />
              Delete course
            </button>
          </form>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={`/api/academy/${course.id}/export?format=pdf`} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-muted hover:border-gold/35 hover:text-white">
            <FileDown className="size-4" aria-hidden />
            Export PDF
          </a>
          <a href={`/api/academy/${course.id}/export?format=docx`} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-muted hover:border-gold/35 hover:text-white">
            <Download className="size-4" aria-hidden />
            Export DOCX
          </a>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Lessons
          </p>
          <div className="mt-5 space-y-4">
            {(lessons ?? []).map((lesson, index) => (
              <article key={lesson.id} className="rounded-3xl border border-white/10 bg-black/35 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gold">
                  Lesson {index + 1}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{lesson.title}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">{lesson.content}</p>
              </article>
            ))}
          </div>
        </section>
        <AcademyActions courseId={course.id} />
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <ResourceList title="Quizzes" items={(quizzes ?? []).map((quiz) => ({ id: quiz.id, title: quiz.title, body: JSON.stringify(quiz.questions_json, null, 2) }))} />
        <ResourceList title="Flashcards" items={(flashcards ?? []).map((card) => ({ id: card.id, title: card.front_text, body: card.back_text }))} />
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function ResourceList({
  items,
  title,
}: {
  items: { body: string; id: string; title: string }[];
  title: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <p className="font-semibold text-white">{item.title}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted">{item.body}</p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-muted">No items yet.</p>
        )}
      </div>
    </div>
  );
}
