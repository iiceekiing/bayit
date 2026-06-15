"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import type { PropertyFilters, PropertyType } from "@/lib/types";
import { PROPERTY_TYPES, propertyTypeLabel } from "@/lib/utils";

interface Props {
  states: string[];
  currentFilters: PropertyFilters;
}

export function PropertiesFilters({ states, currentFilters }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function clearAll() {
    router.push("/properties");
  }

  const hasFilters = Object.entries(currentFilters).some(
    ([k, v]) => k !== "page" && k !== "limit" && v,
  );

  return (
    <div className="bg-white border border-border rounded-2xl p-4 space-y-5 sticky top-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-navy-muted" />
          <p className="text-sm font-semibold text-navy-DEFAULT">Filters</p>
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-medium text-navy-muted mb-1.5 block">Keyword</label>
        <input
          type="text"
          defaultValue={currentFilters.search ?? ""}
          placeholder="Search..."
          onKeyDown={(e) => {
            if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value);
          }}
          className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT transition-colors"
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="text-xs font-medium text-navy-muted mb-1.5 block">Property Type</label>
        <select
          value={currentFilters.type ?? ""}
          onChange={(e) => update("type", e.target.value)}
          className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT bg-white"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{propertyTypeLabel(t)}</option>
          ))}
        </select>
      </div>

      {/* State */}
      {states.length > 0 && (
        <div>
          <label className="text-xs font-medium text-navy-muted mb-1.5 block">State</label>
          <select
            value={currentFilters.state ?? ""}
            onChange={(e) => update("state", e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT bg-white"
          >
            <option value="">All States</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* Bedrooms */}
      <div>
        <label className="text-xs font-medium text-navy-muted mb-1.5 block">Min Bedrooms</label>
        <select
          value={currentFilters.bedrooms?.toString() ?? ""}
          onChange={(e) => update("bedrooms", e.target.value)}
          className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT bg-white"
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="text-xs font-medium text-navy-muted mb-1.5 block">Max Price (₦M)</label>
        <select
          value={currentFilters.maxPrice?.toString() ?? ""}
          onChange={(e) => update("maxPrice", e.target.value)}
          className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT bg-white"
        >
          <option value="">Any</option>
          {[5000000, 10000000, 20000000, 50000000, 100000000, 200000000, 500000000].map((p) => (
            <option key={p} value={p}>
              Up to ₦{(p / 1000000).toFixed(0)}M
            </option>
          ))}
        </select>
      </div>

      {/* Featured toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={currentFilters.featured ?? false}
          onChange={(e) => update("featured", e.target.checked ? "true" : "")}
          className="w-4 h-4 rounded accent-teal-DEFAULT"
        />
        <span className="text-sm text-navy-DEFAULT">Featured only</span>
      </label>
    </div>
  );
}
