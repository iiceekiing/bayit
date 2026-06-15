"use client";

import Link from "next/link";
import { MapPin, Bed, Bath, Maximize2, Eye, Calendar } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatPrice, propertyTypeLabel, statusLabel, statusColor } from "@/lib/utils";

interface Props {
  property: Property;
  showActions?: boolean;
}

export function PropertyCard({ property: p, showActions = true }: Props) {
  const cover = p.coverImage || p.images?.[0];

  return (
    <div className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-200">
      {/* Image */}
      <Link href={`/properties/${p.id}`} className="block relative">
        <div className="aspect-[4/3] bg-canvas overflow-hidden">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={p.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-navy-faint text-sm">
              No image
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(p.status)}`}>
            {statusLabel(p.status)}
          </span>
        </div>

        {/* Featured badge */}
        {p.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gold-DEFAULT text-white">
              Featured
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Type + Location */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-teal-DEFAULT bg-teal-faint px-2 py-0.5 rounded-full">
            {propertyTypeLabel(p.propertyType)}
          </span>
          <div className="flex items-center gap-1 text-xs text-navy-faint">
            <MapPin size={11} />
            <span>{p.city}{p.state && `, ${p.state}`}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/properties/${p.id}`}>
          <h3 className="font-semibold text-navy-DEFAULT text-sm leading-snug hover:text-teal-DEFAULT transition-colors line-clamp-2 mb-2">
            {p.title}
          </h3>
        </Link>

        {/* Specs */}
        {(p.bedrooms || p.bathrooms || p.floorArea) && (
          <div className="flex items-center gap-3 text-xs text-navy-faint mb-3">
            {p.bedrooms !== null && (
              <span className="flex items-center gap-1">
                <Bed size={11} /> {p.bedrooms} bed
              </span>
            )}
            {p.bathrooms !== null && (
              <span className="flex items-center gap-1">
                <Bath size={11} /> {p.bathrooms} bath
              </span>
            )}
            {p.floorArea !== null && (
              <span className="flex items-center gap-1">
                <Maximize2 size={11} /> {p.floorArea}m²
              </span>
            )}
          </div>
        )}

        {/* Price + Actions */}
        <div className="flex items-center justify-between">
          <p className="font-bold text-navy-DEFAULT text-base">{formatPrice(p.price)}</p>

          {showActions && (
            <div className="flex items-center gap-1.5">
              <Link
                href={`/properties/${p.id}`}
                className="flex items-center gap-1 text-xs text-navy-muted hover:text-teal-DEFAULT border border-border rounded-full px-2.5 py-1 hover:border-teal-DEFAULT transition-colors"
              >
                <Eye size={12} /> View
              </Link>
              {p.status === "AVAILABLE" && p.inspectionSlots?.length > 0 && (
                <Link
                  href={`/inspection/${p.id}`}
                  className="flex items-center gap-1 text-xs bg-teal-DEFAULT text-white rounded-full px-2.5 py-1 hover:bg-teal-dark transition-colors"
                >
                  <Calendar size={12} /> Inspect
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
