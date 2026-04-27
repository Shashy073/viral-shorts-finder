"use client";

import { useState } from "react";
import useSWR from "swr";

import type { FetchAllTrendsResult, NicheCategory, TrendItem } from "@/lib/types";

interface TrendFeedProps {
  query: string;
  niche: NicheCategory;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch trends");
    return res.json() as Promise<FetchAllTrendsResult>;
  });

export default function TrendFeed({ query, niche }: TrendFeedProps) {
  const [_selected, setSelected] = useState<TrendItem | null>(null);

  const key = `/api/trends?q=${encodeURIComponent(query)}&niche=${niche}`;
  const { data, error, isLoading, mutate } = useSWR<FetchAllTrendsResult>(
    key,
    fetcher,
    { revalidateOnFocus: false },
  );

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {isLoading
            ? "Fetching trends…"
            : error
              ? "Something went wrong."
              : data
                ? `${data.items.length} results for "${data.query}"`
                : ""}
        </p>
        <button
          onClick={() => void mutate()}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="columns-2 gap-4 sm:columns-3 xl:columns-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-slate-800/60"
              style={{ height: i % 3 === 0 ? 360 : i % 3 === 1 ? 240 : 300 }}
            >
              <div className="h-full w-full animate-pulse bg-gradient-to-br from-slate-800 to-slate-900" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="rounded-full bg-red-500/10 p-4 text-red-400">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <p className="text-slate-400">
            Failed to load trends.{" "}
            <button
              onClick={() => void mutate()}
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              Try again
            </button>
          </p>
        </div>
      )}

      {/* Masonry grid */}
      {!isLoading && !error && data && data.items.length > 0 && (
        <div className="columns-2 gap-4 sm:columns-3 xl:columns-4">
          {data.items.map((item) => (
            <div key={item.id} className="mb-4 break-inside-avoid">
              <button
                onClick={() => setSelected(item)}
                className="w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-900 p-4 text-left shadow-xl transition hover:bg-slate-800"
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {item.description}
                  </p>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && data && data.items.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="rounded-full bg-indigo-500/10 p-4 text-indigo-400">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-300">No trends found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different keyword or niche category.
            </p>
          </div>
        </div>
      )}

      {/* DetailsModal removed — use Dashboard modal instead */}
    </>
  );
}
