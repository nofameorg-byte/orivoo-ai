import { VP23Logo } from "@/components/vp23-logo";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="text-center">
        <VP23Logo href="/" size="lg" showText={false} className="justify-center" />
        <p className="mt-6 text-sm uppercase tracking-[0.28em] text-muted">
          Loading VP23
        </p>
      </div>
    </main>
  );
}
