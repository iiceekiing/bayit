import { Suspense } from "react";
import { getProperties, getStates } from "@/lib/api";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertiesFilters } from "@/components/property/PropertiesFilters";
import type { PropertyFilters } from "@/lib/types";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: PropertyFilters = {
    page: params.page ? +params.page : 1,
    limit: 12,
    type: params.type as any,
    status: params.status as any,
    state: params.state,
    city: params.city,
    minPrice: params.minPrice ? +params.minPrice : undefined,
    maxPrice: params.maxPrice ? +params.maxPrice : undefined,
    bedrooms: params.bedrooms ? +params.bedrooms : undefined,
    featured: params.featured === "true",
    search: params.search,
  };

  const [{ properties, total, pages, page }, states] = await Promise.all([
    getProperties(filters).catch(() => ({ properties: [], total: 0, pages: 1, page: 1, limit: 12 })),
    getStates().catch(() => [] as string[]),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-navy-DEFAULT">
          {params.featured === "true" ? "Featured Properties" : "All Properties"}
        </h1>
        <p className="text-navy-muted mt-1">{total} propert{total === 1 ? "y" : "ies"} found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="lg:w-64 shrink-0">
          <PropertiesFilters states={states} currentFilters={filters} />
        </div>

        {/* Results */}
        <div className="flex-1">
          {properties.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-16 text-center">
              <p className="text-navy-muted">No properties match your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`?${new URLSearchParams({ ...params, page: String(p) })}`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                        ${p === page
                          ? "bg-navy-DEFAULT text-white"
                          : "border border-border text-navy-muted hover:border-teal-DEFAULT hover:text-teal-DEFAULT"
                        }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
