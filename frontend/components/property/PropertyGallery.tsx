"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface Props {
  images: string[];
  coverImage: string | null;
  videoUrl: string | null;
  title: string;
}

export function PropertyGallery({ images, coverImage, videoUrl, title }: Props) {
  const allMedia: Array<{ type: "image" | "video"; src: string }> = [];

  const displayImages = images?.length > 0 ? images : coverImage ? [coverImage] : [];
  displayImages.forEach((src) => allMedia.push({ type: "image", src }));
  if (videoUrl) allMedia.push({ type: "video", src: videoUrl });

  const [current, setCurrent] = useState(0);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (allMedia.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % allMedia.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [allMedia.length]);

  if (allMedia.length === 0) {
    return (
      <div className="w-full aspect-video bg-canvas border border-border rounded-2xl flex items-center justify-center text-navy-faint text-sm">
        No media available
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + allMedia.length) % allMedia.length);
  const next = () => setCurrent((c) => (c + 1) % allMedia.length);
  const item = allMedia[current];

  return (
    <div className="space-y-3">
      {/* Main media */}
      <div className="relative w-full aspect-video bg-navy-DEFAULT rounded-2xl overflow-hidden">
        {item.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            src={item.src}
            alt={`${title} — ${current + 1}`}
            className="w-full h-full object-cover animate-fade-in"
          />
        ) : (
          <video
            key={current}
            src={item.src}
            controls
            className="w-full h-full object-contain animate-fade-in"
          />
        )}

        {/* Nav arrows */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {allMedia.length}
        </div>
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allMedia.map((m, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all
                ${i === current ? "border-teal-DEFAULT" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-navy-DEFAULT flex items-center justify-center">
                  <Play size={16} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
