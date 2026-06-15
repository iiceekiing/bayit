"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Home, MapPin, Edit2, Trash2, Search } from "lucide-react";
import { getProperties, adminDeleteProperty, getAdminToken } from "@/lib/api";
import { formatPrice, statusLabel, statusColor, propertyTypeLabel } from "@/lib/utils";
import type { Property } from "@/lib/types";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getProperties({ limit: 100 })
      .then((r) => setProperties(r.properties))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    const token = getAdminToken();
    if (!token) return;
    setDeleting(id);
    try {
      await adminDeleteProperty(id, token);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const filtered = query
    ? properties.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.city.toLowerCase().includes(query.toLowerCase())
      )
    : properties;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Properties</h1>
        <Link href="/admin/properties/new"
          className="flex items-center gap-2 bg-teal-DEFAULT text-white text-sm font-medium rounded-full px-4 py-2 hover:bg-teal-dark transition-colors">
          <Plus size={15} /> Add Property
        </Link>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search properties…"
          className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT max-w-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Home size={32} className="text-navy-faint mx-auto mb-3" />
          <p className="text-navy-muted">No properties found.</p>
          <Link href="/admin/properties/new" className="text-sm text-teal-DEFAULT hover:text-teal-dark font-medium mt-3 block">
            Add your first property →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-border rounded-2xl overflow-hidden flex">
              {/* Thumbnail */}
              <div className="w-24 sm:w-32 shrink-0 bg-navy-ghost">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home size={20} className="text-navy-faint" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>
                        {statusLabel(p.status)}
                      </span>
                      <span className="text-[10px] text-navy-faint">{propertyTypeLabel(p.propertyType)}</span>
                      {p.isFeatured && (
                        <span className="text-[10px] bg-gold-faint text-gold-dark font-medium px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>
                    <p className="font-semibold text-navy-DEFAULT text-sm truncate">{p.title}</p>
                    <div className="flex items-center gap-1 text-xs text-navy-muted mt-0.5">
                      <MapPin size={11} /> {p.city}, {p.state}
                    </div>
                  </div>
                  <p className="font-bold text-navy-DEFAULT text-sm shrink-0">{formatPrice(p.price)}</p>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <Link href={`/admin/properties/${p.id}/edit`}
                    className="flex items-center gap-1.5 text-xs text-navy-muted hover:text-teal-DEFAULT transition-colors font-medium">
                    <Edit2 size={13} /> Edit
                  </Link>
                  <Link href={`/properties/${p.id}`} target="_blank"
                    className="text-xs text-teal-DEFAULT hover:text-teal-dark font-medium">
                    View →
                  </Link>
                  <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors ml-auto disabled:opacity-40">
                    <Trash2 size={13} /> {deleting === p.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
