"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT mb-2">Something went wrong</h1>
        <p className="text-navy-muted text-sm mb-8">
          An unexpected error occurred. You can try again or return to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-teal-DEFAULT text-white text-sm font-medium rounded-full px-5 py-2.5 hover:bg-teal-dark transition-colors"
          >
            <RefreshCw size={15} /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 border border-border text-navy-DEFAULT text-sm font-medium rounded-full px-5 py-2.5 hover:bg-white transition-colors"
          >
            <Home size={15} /> Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="text-[10px] text-navy-faint font-mono mt-6">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
