import { PropertyCardSkeleton } from "@/components/ui/Skeleton";

export default function PropertiesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 bg-navy-ghost rounded-xl animate-pulse" />
        <div className="h-4 w-24 bg-navy-ghost rounded-xl animate-pulse" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter sidebar skeleton */}
        <div className="lg:w-64 shrink-0 space-y-3">
          <div className="h-10 bg-navy-ghost rounded-xl animate-pulse" />
          <div className="h-32 bg-navy-ghost rounded-xl animate-pulse" />
          <div className="h-24 bg-navy-ghost rounded-xl animate-pulse" />
        </div>
        {/* Cards grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
