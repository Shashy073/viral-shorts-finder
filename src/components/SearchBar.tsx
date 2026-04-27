"use client";

import { type FormEvent, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSearch: (q: string) => void;
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch(value.trim() || "trending");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-2xl mx-auto"
      role="search"
    >
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
        <svg
          className="h-5 w-5 text-indigo-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Search trends — try "Sustainable Fashion" or #fitness'
        className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-4 pl-12 pr-32 text-sm text-slate-100 placeholder-slate-500 shadow-lg shadow-black/40 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        maxLength={100}
        autoComplete="off"
        spellCheck={false}
      />

      <button
        type="submit"
        className="absolute inset-y-2 right-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-95"
      >
        Discover
      </button>
    </form>
  );
}
