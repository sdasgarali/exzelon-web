"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";

/** Search box + optional filter controls, shown above a dashboard table. */
export function DashToolbar({
  search,
  onSearch,
  placeholder,
  children,
  count,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  count?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative md:max-w-xs md:flex-1">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder ?? "Search…"}
          className="h-10 w-full rounded-xl border border-sand-200 bg-white pl-9 pr-3 text-sm text-ink-900 outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
      {count !== undefined && <div className="text-sm text-slate-400 md:ml-auto">{count}</div>}
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-10 rounded-xl border border-sand-200 bg-white px-3 text-sm font-medium capitalize text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
