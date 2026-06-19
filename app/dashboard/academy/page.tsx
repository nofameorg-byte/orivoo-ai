import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  FolderKanban,
  GraduationCap,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  deleteAcademyCourse,
  generateAcademyCourse,
} from "@/app/actions/academy";
import { createClient } from "@/lib/supabase/server";

type AcademyPageProps = {
  searchParams: Promise<{ message?: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AcademyPage({ searchParams }: AcademyPageProps) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Login to access ORIVOO Academy.");
  }

  const [{ data: courses }, { data: projects }] = await Promise.all([
    supabase
      .from("academy_courses")
      .select("id,title,description,subject,grade_level,project_id,created_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id,name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);
  const projectNames = new Map(
    (projects ?? []).map((project) => [project.id, project.name]),
  );

  return (
    <div id="workspace" className="space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
            <Sparkles className="size-4" aria-hidden />
            ORIVOO Academy
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Learning programs for students, families, teachers, nonprofits, and workforce teams.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-muted">
            Generate courses, lessons, study guides, quizzes, flashcards, and
            practice tests with ORIVOO memory and language support.
          </p>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <form action={generateAcademyCourse} className="surface-card rounded-[2rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Generate Course
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Create a learning path
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-white">Subject</span>
              <input
                required
                name="subject"
                placeholder="Math"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Grade Level</span>
              <input
                required
                name="gradeLevel"
                placeholder="8th Grade / Adult Learners"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Project</span>
              <select
                name="projectId"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
              >
                <option value="">No project</option>
                {(projects ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-white">Topic</span>
            <textarea
              required
              name="topic"
              placeholder="Financial literacy for high school students"
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/50"
            />
          </label>
          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gold-bright">
            <GraduationCap className="size-4" aria-hidden />
            Generate Academy Course
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Examples
          </p>
          <div className="mt-5 grid gap-3">
            {[
              "Math",
              "Science",
              "History",
              "Government",
              "Civics",
              "Reading",
              "Technology",
              "Financial Literacy",
            ].map((example) => (
              <div key={example} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-muted">
                {example}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Academy history
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Courses
            </h2>
          </div>
          <BookOpen className="size-6 text-gold" aria-hidden />
        </div>

        {courses?.length ? (
          <div className="grid gap-4">
            {courses.map((course) => (
              <article key={course.id} className="rounded-3xl border border-white/10 bg-black/35 p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">{course.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{course.description}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
                      <FolderKanban className="size-3.5" aria-hidden />
                      {course.project_id ? projectNames.get(course.project_id) ?? "Project" : "No project"}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {course.subject} · {course.grade_level} · Updated {formatDate(course.updated_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/dashboard/academy/${course.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gold-bright">
                      Open course
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <form action={deleteAcademyCourse}>
                      <input type="hidden" name="courseId" value={course.id} />
                      <button className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2 text-sm text-red-100 hover:bg-red-500/10">
                        <Trash2 className="size-4" aria-hidden />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
            <BookOpen className="mx-auto mb-4 size-10 text-gold" aria-hidden />
            <h3 className="text-xl font-semibold text-white">No courses yet</h3>
            <p className="mt-3 text-muted">Generate your first Academy course above.</p>
          </div>
        )}
      </section>
    </div>
  );
}
