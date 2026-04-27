"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Camera,
  Copy,
  Eye,
  Newspaper,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import type { ContentItem } from "@/lib/engine";

// ─── Shared animation variants ────────────────────────────────────────────────

export const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      delay: Math.min(i * 0.055, 0.6),
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

interface TrendCardProps {
  item: ContentItem;
  index: number;
  onSelect: (item: ContentItem) => void;
}

// ─── 1. Video Card (YouTube Shorts — 9:16) ───────────────────────────────────

function VideoCard({ item, index, onSelect }: TrendCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(item)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900 shadow-2xl shadow-black/50 transition-transform duration-300 hover:scale-[1.025]"
      style={{ aspectRatio: "9/16" }}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-2 ring-white/30 transition-transform duration-200 group-hover:scale-110">
          <Play className="h-7 w-7 fill-white text-white" />
        </div>
      </div>

      {/* Source badge */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        <Play className="h-2.5 w-2.5 fill-white" />
        Shorts
      </div>

      {/* View count */}
      {item.viewCount && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Eye className="h-3 w-3 text-slate-300" />
          {item.viewCount}
        </div>
      )}

      {/* Bottom — Viral Hook + Watch */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {item.hook && (
          <p className="mb-2 line-clamp-1 rounded-lg bg-black/40 px-2 py-1 text-[11px] font-semibold italic text-indigo-300 backdrop-blur-sm">
            {item.hook}
          </p>
        )}
        <p className="mb-3 line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow">
          {item.title}
        </p>
        <a
          href={item.url === "#" ? undefined : item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Watch
        </a>
      </div>
    </motion.div>
  );
}

// ─── 2. Photo Card (Pexels — Content Concept) ─────────────────────────────────

function PhotoCard({ item, index, onSelect }: TrendCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(item)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-slate-900 shadow-xl shadow-black/40 ring-1 ring-slate-700/40 transition-all duration-300 hover:scale-[1.015] hover:ring-emerald-500/30"
    >
      {item.imageUrl && (
        <div className="relative overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={600}
            height={900}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
          {/* Hover overlay with concept text */}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {item.hook && (
              <p className="text-xs font-medium italic text-emerald-300">
                {item.hook}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Content Concept
          </span>
        </div>
        <p className="line-clamp-2 text-xs font-medium leading-snug text-slate-300">
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

// ─── 3. News / Brand Card (Trend Alert) ───────────────────────────────────────

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
  const borderClass = isReddit
    ? "from-orange-500/60 via-rose-500/40 to-purple-600/50"
    : "from-indigo-500/60 via-violet-500/40 to-cyan-500/50";

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(item)}
      className="cursor-pointer"
    >
      <div className={`rounded-2xl bg-gradient-to-br p-px shadow-xl transition-transform duration-300 hover:scale-[1.015] ${borderClass}`}>
        <div className="h-full rounded-2xl bg-[#080e1c] p-5">
          {/* Badge */}
          <div className="mb-3 flex items-start justify-between gap-2">
            {isReddit ? (
              <div className="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                <TrendingUp className="h-3 w-3" />
                Reddit Hot
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                <Newspaper className="h-3 w-3" />
                Trend Alert
              </div>
            )}
            {isReddit && item.score != null && item.score > 0 && (
              <span className="text-[10px] font-semibold text-slate-500">
                ▲ {item.score.toLocaleString()}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 text-sm font-semibold leading-snug text-white">
            {item.title}
          </h3>

          {/* Hook */}
          {item.hook && (
            <p className="mb-4 line-clamp-2 text-[11px] leading-relaxed italic text-indigo-300/70">
              &ldquo;{item.hook}&rdquo;
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {item.author && (
              <span className="text-[10px] text-slate-600">{item.author}</span>
            )}
            <button
              onClick={copyHook}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:bg-indigo-600/25 hover:text-indigo-300 active:scale-95"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied!" : "Copy Hook"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 4. AI Synthetic Card (purple glow) ───────────────────────────────────────

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
      onClick={() => onSelect(item)}
      className="cursor-pointer"
    >
      {/* Animated purple glow border */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-600/70 via-violet-500/50 to-fuchsia-600/60 p-px shadow-2xl shadow-purple-900/30 transition-transform duration-300 hover:scale-[1.015]">
        <div className="rounded-2xl bg-gradient-to-br from-[#110a24] to-[#0c0818] p-5">
          {/* AI badge */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
              <Sparkles className="h-3 w-3" />
              AI-Generated Trend
            </div>
            <Bot className="h-4 w-4 text-purple-500/60" />
          </div>

          {/* Idea */}
          <h3 className="mb-3 text-sm font-semibold leading-snug text-white">
            {item.title}
          </h3>

          {/* Viral hook */}
          {item.hook && (
            <p className="mb-4 line-clamp-2 rounded-lg bg-purple-950/40 p-2 text-[11px] leading-relaxed italic text-purple-300/80">
              {item.hook}
            </p>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] text-purple-500/60">
              <Zap className="h-3 w-3" />
              Use this idea
            </span>
            <button
              onClick={copyTitle}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600/20 px-3 py-1.5 text-[11px] font-semibold text-purple-300 transition hover:bg-purple-600/40 hover:text-white active:scale-95"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied!" : "Copy Idea"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function TrendCard({ item, index, onSelect }: TrendCardProps) {
  if (item.synthetic) return <SyntheticCard item={item} index={index} onSelect={onSelect} />;
  if (item.type === "video") return <VideoCard item={item} index={index} onSelect={onSelect} />;
  if (item.type === "image") return <PhotoCard item={item} index={index} onSelect={onSelect} />;
  return <NewsCard item={item} index={index} onSelect={onSelect} />;
}

