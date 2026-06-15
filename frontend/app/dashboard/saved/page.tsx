"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ChevronLeft, MapPin, Bed, Bath } from "lucide-react";
import { getSavedProperties, toggleSaved, getToken } from "@/lib/api";
import { formatPrice, propertyTypeLabel, statusLabel, statusColor } from "@/lib/utils";
import type { Property } from "@/lib/types";

export default function SavedPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    getSavedProperties(token)
      .then(setProperties)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleRemove(propertyId: string) {
    const token = getToken();
    if (!token) return;
    setRemoving(propertyId);
    try {
      await toggleSaved(propertyId, token);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-white border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-navy-muted hover:text-navy-DEFAULT transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-teal-DEFAULT" />
            <h1 className="font-semibold text-navy-DEFAULT">Saved Properties</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={32} className="text-navy-faint mx-auto mb-3" />
            <p className="font-medium text-navy-DEFAULT mb-1">No saved properties</p>
            <p className="text-sm text-navy-muted mb-4">Save properties you like to revisit them later.</p>
            <Link href="/properties" className="text-sm text-teal-DEFAULT hover:text-teal-dark font-medium">
              Browse Properties →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => (
              <div key={p.id} className="bg-white border border-border rounded-2xl overflow-hidden flex">
                {/* Cover */}
                <div className="w-28 sm:w-36 shrink-0 bg-navy-ghost relative">
                  {p.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-navy-faint text-xs">No photo</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>
                        {statusLabel(p.status)}
                      </span>
                      <p className="font-semibold text-navy-DEFAULT text-sm mt-1 truncate">{p.title}</p>
                      <div className="flex items-center gap-1 text-xs text-navy-muted mt-0.5">
                        <MapPin size={11} />
                        <span>{p.city}, {p.state}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(p.id)}
                      disabled={removing === p.id}
                      className="shrink-0 p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Heart size={16} className="fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm font-bold text-navy-DEFAULT">{formatPrice(p.price)}</p>
                    {p.bedrooms !== null && (
                      <span className="flex items-center gap-1 text-xs text-navy-muted">
                        <Bed size={11} /> {p.bedrooms}
                      </span>
                    )}
                    {p.bathrooms !== null && (
                      <span className="flex items-center gap-1 text-xs text-navy-muted">
                        <Bath size={11} /> {p.bathrooms}
                      </span>
                    )}
                  </div>

                  <Link href={`/properties/${p.id}`} className="text-xs text-teal-DEFAULT hover:text-teal-dark font-medium mt-2 block">
                    View Property →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
