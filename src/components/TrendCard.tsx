"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Bot,
  Camera,
  Copy,
  ExternalLink,
  Eye,
  Newspaper,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import type { ContentItem } from "@/lib/engine";

// ─── Shared stagger variants ──────────────────────────────────────────────────

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: Math.min(i * 0.055, 0.55),
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

interface TrendCardProps {
  item: ContentItem;
  index: number;
  onSelect: (item: ContentItem) => void;
}

// ─── Save bookmark button (44px tap target for mobile) ────────────────────────

function SaveButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSaved((s) => !s);
      }}
      aria-label={saved ? "Unsave" : "Save"}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-all duration-200 hover:bg-black/70 hover:scale-110 active:scale-95"
    >
      {saved ? (
        <BookmarkCheck className="h-4.5 w-4.5 text-indigo-400" />
      ) : (
        <Bookmark className="h-4.5 w-4.5 text-white/80" />
      )}
    </button>
  );
}

// ─── 1. Video Card — YouTube Shorts, 9:16 portrait ───────────────────────────

function VideoCard({ item, index, onSelect }: TrendCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
      // Red glow matches YouTube brand
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_0_28px_rgba(239,68,68,0.20)] backdrop-blur-sm"
      style={{ aspectRatio: "9/16" }}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 to-[#111111]" />
      )}

      {/* Scrim overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent" />

      {/* Play button — visible on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-2 ring-white/30 transition-transform duration-200 group-hover:scale-110">
          <Play className="h-7 w-7 fill-white text-white" />
        </div>
      </div>

      {/* Top bar: source badge + save */}
      <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
        <div className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          <Play className="h-2.5 w-2.5 fill-white" />
          Shorts
        </div>
        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <SaveButton />
        </div>
      </div>

      {/* View count pill */}
      {item.viewCount && (
        <div className="absolute right-3 top-16 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Eye className="h-3 w-3 text-slate-300" />
          {item.viewCount}
        </div>
      )}

      {/* Bottom — hook + title + Watch CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {item.hook && (
          <p className="mb-2 line-clamp-1 rounded-lg bg-black/50 px-2.5 py-1 text-[11px] font-semibold italic text-indigo-300 backdrop-blur-sm">
            {item.hook}
          </p>
        )}
        <p className="mb-3 line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow-lg">
          {item.title}
        </p>
        <a
          href={item.url === "#" ? undefined : item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Watch
        </a>
      </div>
    </motion.div>
  );
}

// ─── 2. Photo Card — Pexels, Content Concept ─────────────────────────────────

function PhotoCard({ item, index, onSelect }: TrendCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
      // Cyan glow matches Pexels brand
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_0_28px_rgba(34,211,238,0.12)] backdrop-blur-sm"
    >
      {item.imageUrl && (
        <div className="relative overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={600}
            height={900}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
          {/* Save — top-right on hover */}
          <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <SaveButton />
          </div>
          {/* Concept hook overlay on hover */}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {item.hook && (
              <p className="text-xs font-medium italic text-cyan-300 drop-shadow">
                {item.hook}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Content Concept
          </span>
        </div>
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-200">
          {item.title}
        </p>
        {item.author && (
          <p className="mt-1.5 text-[10px] text-slate-600">
            Photo by {item.author}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── 3. News / Brand Card — square magazine style ─────────────────────────────

function NewsCard({ item, index, onSelect }: TrendCardProps) {
  const [copied, setCopied] = useState(false);

  function copyHook(e: React.MouseEvent) {
    e.stopPropagation();
    void navigator.clipboard.writeText(item.hook ?? item.title).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isReddit = item.source === "reddit";

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
      className="group cursor-pointer"
    >
      {/* Source-coloured glow border */}
      <div
        className={[
          "relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-5 backdrop-blur-sm",
          isReddit
            ? "shadow-[0_0_28px_rgba(249,115,22,0.18)]"
            : "shadow-[0_0_28px_rgba(99,102,241,0.20)]",
        ].join(" ")}
      >
        {/* Top accent strip */}
        <div
          className={[
            "absolute inset-x-0 top-0 h-[3px] rounded-t-2xl",
            isReddit
              ? "bg-gradient-to-r from-orange-500 to-rose-500"
              : "bg-gradient-to-r from-indigo-500 to-cyan-400",
          ].join(" ")}
        />

        {/* Save — top-right on hover */}
        <div className="absolute right-4 top-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <SaveButton />
        </div>

        {/* Badge row */}
        <div className="mb-4 mt-1">
          {isReddit ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
              <TrendingUp className="h-3 w-3" />
              Reddit Hot
              {item.score != null && item.score > 0 && (
                <span className="ml-0.5 text-orange-500/70">
                  · ▲ {item.score.toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              <Newspaper className="h-3 w-3" />
              Trend Alert
            </div>
          )}
        </div>

        {/* Large bold headline */}
        <h3 className="mb-3 flex-1 text-base font-extrabold leading-snug text-white">
          {item.title}
        </h3>

        {/* Hook */}
        {item.hook && (
          <p className="mb-5 line-clamp-2 text-[11px] leading-relaxed italic text-slate-400">
            &ldquo;{item.hook}&rdquo;
          </p>
        )}

        {/* Read Trend + Copy Hook */}
        <div className="mt-auto flex items-center gap-2">
          <a
            href={item.url === "#" ? undefined : item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={[
              "flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white transition active:scale-95",
              isReddit
                ? "bg-orange-600/25 hover:bg-orange-600/40"
                : "bg-indigo-600/25 hover:bg-indigo-600/40",
            ].join(" ")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Read Trend
          </a>
          <button
            onClick={copyHook}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 text-[11px] font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "✓" : "Hook"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 4. AI Synthetic Card — indigo → violet gradient, most premium ────────────

function SyntheticCard({ item, index, onSelect }: TrendCardProps) {
  const [copied, setCopied] = useState(false);

  function copyTitle(e: React.MouseEvent) {
    e.stopPropagation();
    void navigator.clipboard.writeText(item.title).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
      className="group cursor-pointer"
    >
      {/* Indigo glow — strongest of all cards */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-violet-950/60 to-fuchsia-950/40 p-5 shadow-[0_0_36px_rgba(99,102,241,0.28)] backdrop-blur-sm">

        {/* Ambient fill behind content */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-violet-600/8 to-transparent"
        />

        {/* Badge + save row */}
        <div className="relative mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            <Sparkles className="h-3 w-3" />
            AI Idea
          </div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400/50" />
            <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <SaveButton />
            </div>
          </div>
        </div>

        {/* Idea title */}
        <h3 className="relative mb-3 text-base font-bold leading-snug text-white">
          {item.title}
        </h3>

        {/* Hook pill */}
        {item.hook && (
          <p className="relative mb-5 line-clamp-2 rounded-xl bg-indigo-950/60 p-3 text-[11px] leading-relaxed italic text-indigo-200/80">
            {item.hook}
          </p>
        )}

        {/* CTA row */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={copyTitle}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600/30 text-xs font-bold text-indigo-200 transition hover:bg-indigo-600/50 hover:text-white active:scale-95"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy Idea"}
          </button>
          <span className="flex items-center gap-1 text-[10px] text-indigo-400/50">
            <Zap className="h-3 w-3" />
            Use it
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export default function TrendCard({ item, index, onSelect }: TrendCardProps) {
  if (item.synthetic)    return <SyntheticCard item={item} index={index} onSelect={onSelect} />;
  if (item.type === "video") return <VideoCard item={item} index={index} onSelect={onSelect} />;
  if (item.type === "image") return <PhotoCard item={item} index={index} onSelect={onSelect} />;
  return <NewsCard item={item} index={index} onSelect={onSelect} />;
}

