"use client";

import { type FormEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import useSWR from "swr";

import DetailsModal from "@/components/DetailsModal";
import TrendCard from "@/components/TrendCard";
import type { ContentItem, FeedResult } from "@/lib/engine";

// ─── Quick-filter definitions ─────────────────────────────────────────────────

const FILTERS = [
  { label: "🔥 Viral",      query: "trending"   },
  { label: "📹 Reels",      query: "reels"      },
  { label: "📸 Post Ideas", query: "posts"      },
  { label: "📰 Brand News", query: "brand news" },
  { label: "🎨 Aesthetic",  query: "aesthetic"  },
  { label: "💡 Startup",    query: "startup"    },
];

// ─── SWR fetcher ──────────────────────────────────────────────────────────────

const fetcher = (url: string): Promise<FeedResult> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Network error");
    return r.json() as Promise<FeedResult>;
  });

// ─── Skeleton heights (varied for masonry illusion) ──────────────────────────

const SKELETON_HEIGHTS = [
  340, 220, 300, 380, 260, 200, 320, 280, 240, 360, 190, 310,
];

// ─── Pulse scanning animation ─────────────────────────────────────────────────

function PulseScanAnimation({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Sweeping scan bar */}
      <div className="mb-5 h-px w-full overflow-hidden rounded-full bg-white/5">
        <div className="scan-sweep-bar h-full rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </div>

      {/* Thinking indicator */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-800/30 bg-indigo-950/40 px-5 py-3 backdrop-blur-sm">
          {/* 4 bouncing dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="block h-1.5 w-1.5 rounded-full bg-indigo-500"
                style={{ animation: `bounce 1s ease-in-out ${i * 0.14}s infinite` }}
              />
            ))}
          </div>
          <span className="text-sm text-slate-400">
            AI scanning{" "}
            <span className="font-bold text-white">
              &ldquo;{query}&rdquo;
            </span>{" "}
            across YouTube · Pexels · Reddit · NewsData
          </span>
        </div>

        {/* Status labels */}
        <div className="flex flex-wrap justify-center gap-2">
          {["YouTube Shorts", "Pexels Photos", "Reddit Trends", "News Headlines", "AI Synthesis"].map(
            (src, i) => (
              <span
                key={src}
                className="rounded-full border border-white/5 bg-white/3 px-2.5 py-0.5 text-[10px] font-medium text-slate-600"
                style={{ animation: `bounce 1.4s ease-in-out ${i * 0.25}s infinite` }}
              >
                {src}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Shimmer skeleton masonry grid */}
      <div className="mt-8 columns-1 gap-4 md:columns-2 lg:columns-3 xl:columns-4">
        {SKELETON_HEIGHTS.map((h, i) => (
          <div key={i} className="mb-4 break-inside-avoid">
            <div
              className="skeleton-shimmer w-full rounded-2xl"
              style={{ height: h }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Stats toolbar ────────────────────────────────────────────────────────────

function Toolbar({
  data,
  error,
  isLoading,
  onRefresh,
}: {
  data: FeedResult | undefined;
  error: unknown;
  isLoading: boolean;
  onRefresh: () => void;
}) {
  if (isLoading) return null;

  const syntheticCount = data?.items.filter((i) => i.synthetic).length ?? 0;
  const realCount = (data?.items.length ?? 0) - syntheticCount;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {error ? (
          <span className="text-red-400">Something went wrong. Try again.</span>
        ) : data ? (
          <>
            <span>
              <span className="font-semibold text-slate-300">{realCount}</span>{" "}
              live results
            </span>
            {syntheticCount > 0 && (
              <>
                <span className="text-slate-700">·</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-semibold text-indigo-400">
                    {syntheticCount}
                  </span>{" "}
                  AI ideas
                </span>
              </>
            )}
            {data.intent !== "general" && (
              <>
                <span className="text-slate-700">·</span>
                <span className="rounded-full bg-indigo-900/30 px-2 py-0.5 text-[11px] font-semibold capitalize text-indigo-400">
                  {data.intent} intent
                </span>
              </>
            )}
          </>
        ) : null}
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex min-h-[44px] items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-4 text-sm font-medium text-slate-400 backdrop-blur-sm transition hover:bg-white/10 hover:text-white disabled:opacity-40 active:scale-95"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
}

// ─── Masonry feed grid ────────────────────────────────────────────────────────

function FeedGrid({
  items,
  onSelect,
}: {
  items: ContentItem[];
  onSelect: (item: ContentItem) => void;
}) {
  return (
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3 xl:columns-4">
      {items.map((item, i) => (
        <div key={item.id} className="mb-4 break-inside-avoid">
          <TrendCard item={item} index={i} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}

// ─── Empty / error state ──────────────────────────────────────────────────────

function EmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-28 text-center">
      <div className="rounded-full bg-indigo-500/10 p-5">
        <Search className="h-8 w-8 text-indigo-400" />
      </div>
      <div>
        <p className="text-base font-semibold text-slate-200">No results found</p>
        <p className="mt-1.5 text-sm text-slate-500">
          Try a different keyword or category.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="min-h-[44px] rounded-xl bg-indigo-600/20 px-6 text-sm font-semibold text-indigo-400 transition hover:bg-indigo-600/40 hover:text-white active:scale-95"
      >
        Try again
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function MainDashboard() {
  const [inputValue, setInputValue] = useState("trending");
  const [query, setQuery] = useState("trending");
  const [activeFilter, setActiveFilter] = useState("🔥 Viral");
  const [previousQuery, setPreviousQuery] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const swrKey = `/api/trends?q=${encodeURIComponent(query)}`;
  const { data, error, isLoading, mutate } = useSWR<FeedResult>(
    swrKey,
    fetcher,
    { revalidateOnFocus: false },
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = inputValue.trim() || "trending";
    setQuery(q);
    setActiveFilter("");
  }

  function handleFilterClick(label: string, q: string) {
    const isAlreadyActive = activeFilter === label;

    if (isAlreadyActive) {
      setActiveFilter("");
      setInputValue(previousQuery);
      setQuery(previousQuery);
      return;
    }

    setPreviousQuery(inputValue.trim());
    setActiveFilter(label);
    setInputValue(q);
    setQuery(q);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* ── Fixed ambient background orbs (purely decorative) ─────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-700/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-violet-700/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-48 w-48 rounded-full bg-cyan-700/6 blur-3xl" />
      </div>

      {/* ── Sticky header block ───────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/92 backdrop-blur-[12px]"
      >
        <div className="mx-auto max-w-screen-xl px-4">

          {/* Brand row */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <button
                type="button"
                onClick={() => window.location.reload()}
                aria-label="Reload TrendMatrix Pro"
                className="text-left text-2xl font-black tracking-tight transition hover:text-indigo-300"
              >
                Trend
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Matrix
                </span>
                <span className="ml-1.5 text-sm font-semibold text-slate-600">
                  Pro
                </span>
              </button>
              {/* "AI Engine" badge — hidden on smallest screens */}
              <div className="hidden items-center gap-1.5 rounded-full border border-indigo-800/40 bg-indigo-950/50 px-3 py-0.5 text-[10px] font-semibold text-indigo-400 sm:flex">
                <Zap className="h-3 w-3 text-cyan-400" />
                AI Engine
              </div>
            </div>

            {/* Scanning pulse indicator */}
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>
                <span className="hidden sm:block">Scanning…</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="hidden sm:block">Live</span>
              </div>
            )}
          </div>

          {/* Search bar — full-width on mobile */}
          <form
            onSubmit={handleSubmit}
            className="pb-3"
            role="search"
            aria-label="Search trends"
          >
            <div className="flex items-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 pl-4 pr-1.5 py-1.5 backdrop-blur-sm transition-all duration-300 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20">
              <Search className="h-4 w-4 flex-shrink-0 text-indigo-400" />
              <input
                ref={inputRef}
                type="search"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setPreviousQuery(e.target.value);
                }}
                placeholder='e.g. "sustainable fashion reels" or "SaaS brand news"'
                className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-white placeholder-slate-500 outline-none"
                maxLength={100}
                autoComplete="off"
                spellCheck={false}
              />
              {/* Mobile — icon-only Generate button (saves space) */}
              <button
                type="submit"
                aria-label="Discover trends"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500 active:scale-95 sm:hidden"
              >
                <Zap className="h-4 w-4" />
              </button>
              {/* Desktop — text button */}
              <button
                type="submit"
                className="hidden flex-shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500 active:scale-95 sm:flex"
              >
                Discover
              </button>
            </div>
          </form>

          {/* Filter chips — horizontal scroll on mobile, wrap on desktop */}
          <div
            className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide md:flex-wrap md:justify-start"
            role="group"
            aria-label="Quick filters"
          >
            {FILTERS.map(({ label, query: fq }) => {
              const isActive = activeFilter === label;
              return (
                <button
                  key={label}
                  onClick={() => handleFilterClick(label, fq)}
                  aria-pressed={isActive}
                  className={[
                    "flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                    "min-h-[36px]", // comfortable tap target
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 ring-2 ring-indigo-400/30"
                      : "border border-white/8 bg-white/5 text-slate-400 hover:border-indigo-700/40 hover:bg-white/8 hover:text-slate-200",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Feed ─────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 mx-auto max-w-screen-xl px-4 pb-16 pt-6">

        <Toolbar
          data={data}
          error={error}
          isLoading={isLoading}
          onRefresh={() => void mutate()}
        />

        {/* Pulse scanning skeleton */}
        {isLoading && <PulseScanAnimation query={query} />}

        {/* Error */}
        {!isLoading && error && (
          <EmptyState onRetry={() => void mutate()} />
        )}

        {/* Staggered results */}
        <AnimatePresence mode="wait">
          {!isLoading && !error && data && data.items.length > 0 && (
            <motion.div
              key={query}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FeedGrid items={data.items} onSelect={setSelected} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty */}
        {!isLoading && !error && data && data.items.length === 0 && (
          <EmptyState onRetry={() => void mutate()} />
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-xs text-slate-700">
          TrendMatrix Pro &copy; {new Date().getFullYear()} &middot; AI-powered
          content discovery &middot; YouTube · Pexels · Reddit · NewsData
        </p>
      </footer>

      {/* ── Details modal ─────────────────────────────────────────────────────── */}
      <DetailsModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

