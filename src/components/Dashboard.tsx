"use client";

import { type FormEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Search, Zap } from "lucide-react";
import useSWR from "swr";

import ContentCard from "@/components/ContentCard";
import DetailsModal from "@/components/DetailsModal";
import type { ContentItem, FeedResult } from "@/lib/api";

// ─── Niche pills ──────────────────────────────────────────────────────────────
const NICHES = [
  { label: "Trending", emoji: "🔥" },
  { label: "SaaS", emoji: "⚡" },
  { label: "Fitness", emoji: "💪" },
  { label: "Beauty", emoji: "💄" },
  { label: "Tech", emoji: "🤖" },
  { label: "Finance", emoji: "💰" },
];

// ─── Fetcher ──────────────────────────────────────────────────────────────────
const fetcher = (url: string): Promise<FeedResult> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Network error");
    return r.json() as Promise<FeedResult>;
  });

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const SKELETON_HEIGHTS = [340, 260, 300, 380, 220, 290, 250, 360, 210, 280, 320, 240];

function SkeletonGrid() {
  return (
    <div>
      {/* "Scanning" label */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-indigo-500"
              style={{ animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-slate-400">
          Scanning the Internet...
        </span>
      </div>

      {/* Skeleton masonry */}
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
        {SKELETON_HEIGHTS.map((h, i) => (
          <div key={i} className="mb-4 break-inside-avoid">
            <div
              className="w-full animate-pulse overflow-hidden rounded-2xl bg-slate-800/50"
              style={{ height: h }}
            >
              <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-800/80 to-slate-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
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
        className="rounded-xl bg-indigo-600/20 px-5 py-2 text-sm font-semibold text-indigo-400 transition hover:bg-indigo-600/40 hover:text-white"
      >
        Try again
      </button>
    </div>
  );
}

// ─── Feed grid ────────────────────────────────────────────────────────────────
function FeedGrid({
  items,
  onSelect,
}: {
  items: ContentItem[];
  onSelect: (item: ContentItem) => void;
}) {
  return (
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
      {items.map((item, i) => (
        <div key={item.id} className="mb-4 break-inside-avoid">
          <ContentCard item={item} index={i} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [inputValue, setInputValue] = useState("trending");
  const [query, setQuery] = useState("trending");
  const [activeNiche, setActiveNiche] = useState("Trending");
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
  }

  function handleNicheClick(label: string) {
    setActiveNiche(label);
    const q = label === "Trending" ? "trending" : label.toLowerCase();
    setInputValue(q);
    setQuery(q);
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* ── Hero ── */}
      <header className="relative overflow-hidden pb-12 pt-16">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex justify-center"
        >
          <div className="h-96 w-96 -translate-y-1/2 rounded-full bg-indigo-700/20 blur-3xl" />
          <div className="h-96 w-96 translate-x-40 -translate-y-1/3 rounded-full bg-violet-700/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4">
          {/* Logo */}
          <div className="mb-9 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-800/40 bg-indigo-950/50 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Real-time trend intelligence
            </div>

            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
              Trend
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Matrix
              </span>
            </h1>
            <p className="mt-3 text-slate-400">
              YouTube Shorts · Pexels · Reddit · NewsData — one visual feed
            </p>
          </div>

          {/* Glassmorphism search bar */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl" role="search">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 shadow-2xl shadow-black/50 backdrop-blur-2xl ring-1 ring-indigo-500/10 transition-all duration-300 focus-within:border-indigo-500/40 focus-within:ring-indigo-500/30">
              <Search className="h-5 w-5 flex-shrink-0 text-indigo-400" />
              <input
                ref={inputRef}
                type="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search any trend, topic, or niche..."
                className="flex-1 bg-transparent text-base text-white placeholder-slate-500 outline-none"
                maxLength={100}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-95"
              >
                Discover
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* ── Sticky niche bar ── */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#020617]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-2 overflow-x-auto py-3.5 scrollbar-hide">
            {NICHES.map(({ label, emoji }) => {
              const isActive = activeNiche === label;
              return (
                <button
                  key={label}
                  onClick={() => handleNicheClick(label)}
                  aria-pressed={isActive}
                  className={[
                    "flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 ring-2 ring-indigo-400/30"
                      : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200",
                  ].join(" ")}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Feed ── */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Toolbar */}
        {!isLoading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {error
                ? "Something went wrong."
                : data
                  ? `${data.items.length} results for "${data.query}"`
                  : ""}
            </p>
            <button
              onClick={() => void mutate()}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700/80 hover:text-white disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && <SkeletonGrid />}

        {/* Error */}
        {!isLoading && error && (
          <EmptyState onRetry={() => void mutate()} />
        )}

        {/* Results */}
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

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-700">
        TrendMatrix © {new Date().getFullYear()} · AI-powered content discovery
      </footer>

      {/* ── Details Modal ── */}
      <DetailsModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

