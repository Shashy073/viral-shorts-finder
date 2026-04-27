"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  Copy,
  Eye,
  Play,
  TrendingUp,
  Zap,
} from "lucide-react";

import type { ContentItem } from "@/lib/api";

export const cardVariants = {
  hidden: { opacity: 0, y: 28 },
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

interface ContentCardProps {
  item: ContentItem;
  index: number;
  onSelect: (item: ContentItem) => void;
}

// ─── YouTube Shorts Card (9:16) ───────────────────────────────────────────────
function VideoCard({
  item,
  index,
  onSelect,
}: ContentCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(item)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900 shadow-2xl shadow-black/50 transition-transform duration-300 hover:scale-[1.02] hover:shadow-indigo-900/30"
      style={{ aspectRatio: "9/16" }}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-2 ring-white/30">
          <Play className="h-6 w-6 fill-white text-white" />
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

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow">
          {item.title}
        </p>
        <a
          href={item.url}
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

// ─── Pexels Image Card ────────────────────────────────────────────────────────
function ImageCard({
  item,
  index,
  onSelect,
}: ContentCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(item)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-slate-900 shadow-xl shadow-black/40 ring-1 ring-slate-700/40 transition-all duration-300 hover:scale-[1.015] hover:ring-indigo-500/40"
    >
      {item.imageUrl && (
        <div className="relative overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={600}
            height={900}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      )}

      <div className="p-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Camera className="h-3 w-3 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Visual Vibe
          </span>
        </div>
        {item.title && (
          <p className="line-clamp-2 text-xs font-medium text-slate-300">
            {item.title}
          </p>
        )}
        {item.author && (
          <p className="mt-1 text-[10px] text-slate-600">by {item.author}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── News / Reddit Idea Card ──────────────────────────────────────────────────
function IdeaCard({
  item,
  index,
  onSelect,
}: ContentCardProps) {
  const [copied, setCopied] = useState(false);

  function copyHook(e: React.MouseEvent) {
    e.stopPropagation();
    const text = item.hook ?? item.title;
    void navigator.clipboard.writeText(text).then(() => {
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
      onClick={() => onSelect(item)}
      className="cursor-pointer"
    >
      {/* Gradient border wrapper */}
      <div
        className={`rounded-2xl p-px shadow-xl transition-transform duration-300 hover:scale-[1.015] ${
          isReddit
            ? "bg-gradient-to-br from-orange-500/70 via-rose-600/40 to-purple-600/60"
            : "bg-gradient-to-br from-indigo-500/70 via-violet-600/40 to-emerald-500/60"
        }`}
      >
        <div className="rounded-2xl bg-[#0a0f1e] p-5">
          {/* Source badge */}
          <div className="mb-3 flex items-center gap-2">
            {isReddit ? (
              <div className="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                <TrendingUp className="h-3 w-3" />
                Reddit Hot
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                <Zap className="h-3 w-3" />
                News Hook
              </div>
            )}
            {isReddit && item.score && (
              <span className="ml-auto text-[10px] font-semibold text-slate-500">
                ▲ {item.score.toLocaleString()}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 text-sm font-semibold leading-snug text-white">
            {item.title}
          </h3>

          {/* Viral Hook */}
          {item.hook && (
            <p className="mb-4 line-clamp-2 text-[11px] leading-relaxed text-indigo-300/70 italic">
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
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:bg-indigo-600/20 hover:text-indigo-300 active:scale-95"
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

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ContentCard({ item, index, onSelect }: ContentCardProps) {
  if (item.type === "video") return <VideoCard item={item} index={index} onSelect={onSelect} />;
  if (item.type === "image") return <ImageCard item={item} index={index} onSelect={onSelect} />;
  return <IdeaCard item={item} index={index} onSelect={onSelect} />;
}
