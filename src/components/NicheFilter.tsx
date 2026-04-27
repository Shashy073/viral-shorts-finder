"use client";

import type { NicheCategory } from "@/lib/types";

const NICHES: { label: string; value: NicheCategory; emoji: string }[] = [
  { label: "All", value: "all", emoji: "✦" },
  { label: "Tech", value: "tech", emoji: "⚡" },
  { label: "Fitness", value: "fitness", emoji: "🏋️" },
  { label: "Business", value: "business", emoji: "💼" },
  { label: "Lifestyle", value: "lifestyle", emoji: "✨" },
  { label: "Beauty", value: "beauty", emoji: "💄" },
  { label: "Gaming", value: "gaming", emoji: "🎮" },
];

interface NicheFilterProps {
  active: NicheCategory;
  onChange: (niche: NicheCategory) => void;
}

export default function NicheFilter({ active, onChange }: NicheFilterProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="group"
      aria-label="Filter by niche"
    >
      {NICHES.map(({ label, value, emoji }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={[
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 ring-2 ring-indigo-400/30"
                : "bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-slate-200",
            ].join(" ")}
          >
            <span aria-hidden="true">{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
