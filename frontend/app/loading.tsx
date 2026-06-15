import { PropertyCardSkeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Hero skeleton */}
      <div className="text-center space-y-4 py-8">
        <div className="h-12 w-80 bg-navy-ghost rounded-2xl animate-pulse mx-auto" />
        <div className="h-5 w-64 bg-navy-ghost rounded-xl animate-pulse mx-auto" />
        <div className="h-12 w-40 bg-navy-ghost rounded-full animate-pulse mx-auto mt-4" />
      </div>
      {/* Featured properties skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-48 bg-navy-ghost rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
