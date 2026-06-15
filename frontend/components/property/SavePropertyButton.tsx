"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getToken, getSavedProperties, toggleSaved } from "@/lib/api";

interface Props {
  propertyId: string;
}

export function SavePropertyButton({ propertyId }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getSavedProperties(token)
      .then((props) => setSaved(props.some((p: any) => p.property?.id === propertyId || p.propertyId === propertyId)))
      .catch(() => {});
  }, [propertyId]);

  async function handleToggle() {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const res = await toggleSaved(propertyId, token);
      setSaved(res.saved);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={saved ? "Remove from saved" : "Save this property"}
      className={`flex items-center justify-center gap-2 w-full border text-sm font-medium rounded-full py-3 transition-colors ${
        saved
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-border text-navy-DEFAULT hover:bg-canvas"
      }`}
    >
      <Heart size={15} className={saved ? "fill-red-500 text-red-500" : ""} />
      {saved ? "Saved" : "Save Property"}
    </button>
  );
}
