export default function LoadingPage() {
  const sources = ["YouTube Shorts", "Pexels Photos", "Reddit Trends", "News Headlines", "AI Synthesis"];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] text-white">

      {/* Ambient glow orbs — mirrors the main dashboard */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-700/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-violet-700/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-48 w-48 rounded-full bg-cyan-700/8 blur-3xl" />
      </div>

      {/* Logo mark */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-cyan-500/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/25 via-violet-600/20 to-slate-900 ring-1 ring-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] ring-1 ring-white/10">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-xl font-black text-transparent">
              TM
            </span>
          </div>
        </div>
      </div>

      {/* Brand text */}
      <div className="relative space-y-2 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-800/40 bg-indigo-950/50 px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          AI Content Engine
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Trend
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Matrix
          </span>
          <span className="ml-2 text-xl font-semibold text-slate-600">Pro</span>
        </h1>
        <p className="text-sm text-slate-400">Discovering the latest viral content…</p>
      </div>

      {/* Sweeping scan bar */}
      <div className="relative mt-10 h-px w-64 overflow-hidden rounded-full bg-white/5">
        <div className="scan-sweep-bar h-full rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </div>

      {/* Source status pills */}
      <div className="relative mt-6 flex flex-wrap justify-center gap-2">
        {sources.map((src, i) => (
          <span
            key={src}
            className="rounded-full border border-white/5 bg-white/3 px-3 py-0.5 text-[10px] font-medium text-slate-600"
            style={{ animation: `bounce 1.4s ease-in-out ${i * 0.22}s infinite` }}
          >
            {src}
          </span>
        ))}
      </div>

      {/* Bouncing dots */}
      <div className="relative mt-8 flex items-center gap-2">
        {[0, 1, 2, 3].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-indigo-500"
            style={{ animation: `bounce 1s ease-in-out ${dot * 0.14}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
