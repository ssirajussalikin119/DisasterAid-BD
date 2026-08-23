export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-medium tracking-wide backdrop-blur">
        Validating session...
      </div>
    </div>
  );
}
