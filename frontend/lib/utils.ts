import type { PropertyType, PropertyStatus, Amenity } from "./types";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Price in kobo → formatted Naira string
export function formatPrice(kobo: string | number | bigint): string {
  const naira = Number(kobo) / 100;
  if (naira >= 1_000_000_000) return `₦${(naira / 1_000_000_000).toFixed(2)}B`;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(0)}K`;
  return `₦${naira.toLocaleString("en-NG")}`;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: string | number): number {
  return Number(kobo) / 100;
}

export function propertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    HOUSE: "House",
    APARTMENT: "Apartment",
    DUPLEX: "Duplex",
    TERRACE: "Terrace",
    BUNGALOW: "Bungalow",
    VILLA: "Villa",
    STUDIO_APARTMENT: "Studio Apartment",
    OFFICE_SPACE: "Office Space",
    SHOP: "Shop",
    WAREHOUSE: "Warehouse",
    LAND: "Land",
    COMMERCIAL_BUILDING: "Commercial Building",
  };
  return labels[type] ?? type;
}

export function statusLabel(status: PropertyStatus): string {
  const labels: Record<PropertyStatus, string> = {
    AVAILABLE: "Available",
    INSPECTION_BOOKED: "Inspection Booked",
    RESERVED: "Reserved",
    PENDING_PAYMENT: "Pending Payment",
    SOLD: "Sold",
    OFF_MARKET: "Off Market",
    UNDER_REVIEW: "Under Review",
  };
  return labels[status] ?? status;
}

export function statusColor(status: PropertyStatus): string {
  const colors: Record<PropertyStatus, string> = {
    AVAILABLE: "bg-teal-faint text-teal-dark",
    INSPECTION_BOOKED: "bg-blue-50 text-blue-700",
    RESERVED: "bg-amber-50 text-amber-700",
    PENDING_PAYMENT: "bg-orange-50 text-orange-700",
    SOLD: "bg-red-50 text-red-700",
    OFF_MARKET: "bg-gray-100 text-gray-500",
    UNDER_REVIEW: "bg-purple-50 text-purple-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-500";
}

export function amenityLabel(amenity: Amenity): string {
  const labels: Record<Amenity, string> = {
    SWIMMING_POOL: "Swimming Pool",
    GYM: "Gym",
    SECURITY: "24/7 Security",
    CCTV: "CCTV",
    WATER_SUPPLY: "Water Supply",
    SOLAR_POWER: "Solar Power",
    ELEVATOR: "Elevator",
    FURNISHED: "Furnished",
    AIR_CONDITIONING: "Air Conditioning",
    GARDEN: "Garden",
    CHILDREN_PLAY_AREA: "Children Play Area",
    INTERNET: "Internet",
  };
  return labels[amenity] ?? amenity;
}

export function amenityEmoji(amenity: Amenity): string {
  const emojis: Record<Amenity, string> = {
    SWIMMING_POOL: "🏊",
    GYM: "💪",
    SECURITY: "🛡",
    CCTV: "📹",
    WATER_SUPPLY: "💧",
    SOLAR_POWER: "☀️",
    ELEVATOR: "🛗",
    FURNISHED: "🛋",
    AIR_CONDITIONING: "❄️",
    GARDEN: "🌿",
    CHILDREN_PLAY_AREA: "🎡",
    INTERNET: "📶",
  };
  return emojis[amenity] ?? "✓";
}

export function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const PROPERTY_TYPES: PropertyType[] = [
  "HOUSE", "APARTMENT", "DUPLEX", "TERRACE", "BUNGALOW", "VILLA",
  "STUDIO_APARTMENT", "OFFICE_SPACE", "SHOP", "WAREHOUSE", "LAND", "COMMERCIAL_BUILDING",
];

export const ALL_AMENITIES: Amenity[] = [
  "SWIMMING_POOL", "GYM", "SECURITY", "CCTV", "WATER_SUPPLY", "SOLAR_POWER",
  "ELEVATOR", "FURNISHED", "AIR_CONDITIONING", "GARDEN", "CHILDREN_PLAY_AREA", "INTERNET",
];
