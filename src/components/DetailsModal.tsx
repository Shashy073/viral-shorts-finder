"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";

import type { ContentItem } from "@/lib/engine";

interface DetailsModalProps {
  item: ContentItem | null;
  onClose: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  youtube: "YouTube Shorts",
  pexels: "Pexels",
  reddit: "Reddit",
  newsdata: "NewsData",
  synthetic: "AI-Generated",
};

const SOURCE_COLORS: Record<string, string> = {
  youtube: "text-red-400 bg-red-500/20",
  pexels: "text-emerald-400 bg-emerald-500/20",
  reddit: "text-orange-400 bg-orange-500/20",
  newsdata: "text-indigo-400 bg-indigo-500/20",
  synthetic: "text-purple-400 bg-purple-500/20",
};

function generateHooks(title: string): [string, string, string] {
  const t = title.length > 52 ? title.slice(0, 52) + "…" : title;
  return [
    `The secret behind "${t}" that nobody is talking about`,
    `I studied "${t}" for 30 days — here's what I found`,
    `Why "${t}" is the most underrated content idea of 2025`,
  ];
}

export default function DetailsModal({ item, onClose }: DetailsModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = item ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  useEffect(() => {
    if (item) panelRef.current?.focus();
  }, [item]);

  function handleCopy(hook: string, idx: number) {
    void navigator.clipboard.writeText(hook).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  }

  return (
    <AnimatePresence>
      {item && (() => {
        const hooks = generateHooks(item.title);
        return (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md"
              onClick={onClose}
              aria-hidden="true"
            />

            <motion.div
              key="panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Details for ${item.title}`}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-xl -translate-y-1/2 overflow-hidden rounded-3xl bg-[#0b1120] shadow-2xl shadow-black/70 ring-1 ring-slate-700/50 outline-none"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-800/60 p-6">
                <div className="min-w-0">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${SOURCE_COLORS[item.source] ?? "text-slate-400 bg-slate-700/30"}`}
                  >
                    {SOURCE_LABELS[item.source] ?? item.source}
                  </span>
                  <h2 className="mt-2 text-base font-semibold leading-snug text-white">
                    {item.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 p-6">
                {/* Source link */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Original Source
                  </p>
                  <a
                    href={item.url === "#" ? undefined : item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-400 transition hover:text-indigo-300 hover:underline"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0" />
                    {item.url.replace(/^https?:\/\//, "").slice(0, 65)}
                    {item.url.length > 65 ? "…" : ""}
                  </a>
                </div>

                {/* Description */}
                {item.description && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Summary
                    </p>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {item.description.slice(0, 300)}
                      {item.description.length > 300 ? "…" : ""}
                    </p>
                  </div>
                )}

                {/* AI Hooks */}
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    AI-Generated Hooks
                  </p>
                  <ul className="space-y-2.5">
                    {hooks.map((hook, idx) => (
                      <li
                        key={idx}
                        className="flex items-start justify-between gap-3 rounded-xl bg-slate-800/50 p-3.5 ring-1 ring-slate-700/30"
                      >
                        <div className="flex gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-[11px] font-bold text-indigo-400">
                            {idx + 1}
                          </span>
                          <p className="text-sm leading-relaxed text-slate-300">
                            {hook}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(hook, idx)}
                          aria-label={`Copy hook ${idx + 1}`}
                          className="flex-shrink-0 rounded-lg bg-emerald-600/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-600/40 hover:text-emerald-300 active:scale-95"
                        >
                          {copiedIndex === idx ? "Copied!" : "Copy"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        );
      })()}
    </AnimatePresence>
  );
}

