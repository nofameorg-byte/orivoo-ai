import { VP23Logo } from "@/components/vp23-logo";

export default function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
        <VP23Logo
          href="/dashboard"
          size="lg"
          showText={false}
          className="justify-center"
        />
        <p className="mt-6 text-sm uppercase tracking-[0.28em] text-muted">
          Preparing dashboard
        </p>
      </div>
    </main>
  );
}
