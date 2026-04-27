"use client";

import { type FormEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  ImageIcon,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import useSWR from "swr";

import DetailsModal from "@/components/DetailsModal";
import TrendCard from "@/components/TrendCard";
import type { ContentItem, FeedResult } from "@/lib/engine";

// ─── Quick-filter pills ───────────────────────────────────────────────────────

const FILTERS = [
  { label: "Viral", emoji: "🔥", icon: Flame, query: "trending" },
  { label: "Reels", emoji: "📹", icon: Video, query: "reels" },
  { label: "Posts", emoji: "📸", icon: ImageIcon, query: "posts" },
  { label: "Brand News", emoji: "📰", icon: Newspaper, query: "brand news" },
];

// ─── SWR fetcher ──────────────────────────────────────────────────────────────

const fetcher = (url: string): Promise<FeedResult> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Network error");
    return r.json() as Promise<FeedResult>;
  });

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SKELETON_HEIGHTS = [
  340, 260, 300, 380, 220, 290, 250, 360, 210, 280, 320, 240,
];

function SkeletonGrid({ query }: { query: string }) {
  return (
    <div>
      {/* Scanning indicator */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-3 rounded-full border border-indigo-800/40 bg-indigo-950/60 px-5 py-2.5 backdrop-blur-sm">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-2 w-2 rounded-full bg-indigo-400"
                style={{
                  animation: `bounce 0.9s ease-in-out ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-indigo-300">
            Scanning the social web for{" "}
            <span className="font-bold text-white">
              &ldquo;{query}&rdquo;
            </span>
            ...
          </span>
        </div>
      </motion.div>

      {/* Shimmer skeleton masonry */}
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3 xl:columns-4">
        {SKELETON_HEIGHTS.map((h, i) => (
          <div key={i} className="mb-4 break-inside-avoid">
            <div
              className="w-full overflow-hidden rounded-2xl"
              style={{ height: h }}
            >
              <div className="h-full w-full animate-pulse bg-gradient-to-br from-slate-800/80 via-slate-800/40 to-slate-900/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
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
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {error ? (
          <span className="text-red-400">Something went wrong.</span>
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
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span className="font-semibold text-purple-400">
                    {syntheticCount}
                  </span>{" "}
                  AI-generated ideas
                </span>
              </>
            )}
            {data.intent !== "general" && (
              <>
                <span className="text-slate-700">·</span>
                <span className="rounded-full bg-indigo-900/40 px-2 py-0.5 text-[11px] font-semibold capitalize text-indigo-400">
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
        className="flex items-center gap-2 rounded-xl bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700/80 hover:text-white disabled:opacity-40"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
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
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3 xl:columns-4">
      {items.map((item, i) => (
        <div key={item.id} className="mb-4 break-inside-avoid">
          <TrendCard item={item} index={i} onSelect={onSelect} />
        </div>
      ))}
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
        <p className="text-base font-semibold text-slate-200">
          No results found
        </p>
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function MainDashboard() {
  const [inputValue, setInputValue] = useState("trending");
  const [query, setQuery] = useState("trending");
  const [activeFilter, setActiveFilter] = useState("Viral");
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
    // Reset active filter if user types manually
    setActiveFilter("");
  }

  function handleFilterClick(label: string, q: string) {
    setActiveFilter(label);
    setInputValue(q);
    setQuery(q);
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden pb-12 pt-16">
        {/* Ambient glow orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-700/20 blur-3xl" />
          <div className="absolute right-1/4 top-10 h-72 w-72 rounded-full bg-violet-700/10 blur-3xl" />
          <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-emerald-700/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4">
          {/* Brand */}
          <div className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-800/40 bg-indigo-950/50 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Real-time trend intelligence · Zero-fail AI engine
            </div>

            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Trend
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Matrix
              </span>{" "}
              <span className="bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
                Pro
              </span>
            </h1>
            <p className="mt-3 text-slate-400">
              YouTube · Pexels · Reddit · NewsData · AI Synthesis — one
              discovery engine
            </p>
          </div>

          {/* Glassmorphism search bar */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-2xl"
            role="search"
            aria-label="Search trends"
          >
            <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl shadow-black/60 backdrop-blur-2xl ring-1 ring-inset ring-white/5 transition-all duration-300 focus-within:border-indigo-500/50 focus-within:ring-indigo-500/20">
              {/* Inner glow on focus */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 [div:focus-within_&]:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600/5 to-violet-600/5" />
              </div>

              <Search className="relative h-5 w-5 flex-shrink-0 text-indigo-400" />
              <input
                ref={inputRef}
                type="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Search any niche, brand, or trend — e.g. "sustainable fashion reels"'
                className="relative flex-1 bg-transparent text-base text-white placeholder-slate-500 outline-none"
                maxLength={100}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className="relative flex-shrink-0 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500 active:scale-95"
              >
                Discover
              </button>
            </div>
          </form>

          {/* Quick-filter pills */}
          <div
            className="mt-5 flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Quick filters"
          >
            {FILTERS.map(({ label, emoji, query: fq }) => {
              const isActive = activeFilter === label;
              return (
                <button
                  key={label}
                  onClick={() => handleFilterClick(label, fq)}
                  aria-pressed={isActive}
                  className={[
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 ring-2 ring-indigo-400/30"
                      : "border border-slate-700/60 bg-slate-800/50 text-slate-400 hover:border-indigo-700/50 hover:bg-slate-700/70 hover:text-slate-200",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="text-base">
                    {emoji}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Feed ─────────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-screen-xl px-4 pb-16">
        <Toolbar
          data={data}
          error={error}
          isLoading={isLoading}
          onRefresh={() => void mutate()}
        />

        {/* Skeleton */}
        {isLoading && <SkeletonGrid query={query} />}

        {/* Error */}
        {!isLoading && error && (
          <EmptyState onRetry={() => void mutate()} />
        )}

        {/* Results with stagger animation */}
        <AnimatePresence mode="wait">
          {!isLoading && !error && data && data.items.length > 0 && (
            <motion.div
              key={query}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
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
      <footer className="border-t border-white/5 py-10 text-center">
        <p className="text-xs text-slate-700">
          TrendMatrix Pro © {new Date().getFullYear()} · AI-powered content
          discovery engine · Data from YouTube, Pexels, Reddit &amp; NewsData
        </p>
      </footer>

      {/* ── Details Modal ─────────────────────────────────────────────────────── */}
      <DetailsModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
