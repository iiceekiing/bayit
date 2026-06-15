import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-teal-faint flex items-center justify-center mx-auto mb-6">
          <Search size={36} className="text-teal-DEFAULT" />
        </div>
        <h1 className="font-serif text-5xl font-bold text-navy-DEFAULT mb-2">404</h1>
        <h2 className="font-serif text-xl font-semibold text-navy-DEFAULT mb-3">Page not found</h2>
        <p className="text-navy-muted text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
          Try browsing our property listings instead.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-teal-DEFAULT text-white text-sm font-medium rounded-full px-5 py-2.5 hover:bg-teal-dark transition-colors"
          >
            <Home size={15} /> Go Home
          </Link>
          <Link
            href="/properties"
            className="flex items-center gap-2 border border-border text-navy-DEFAULT text-sm font-medium rounded-full px-5 py-2.5 hover:bg-white transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
