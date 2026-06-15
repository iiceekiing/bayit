"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Edit2, Trash2, MapPin, Bed, Bath, Car, Maximize2,
  Calendar, FileText, CheckCircle, XCircle, Clock, Plus,
  ToggleLeft, ExternalLink,
} from "lucide-react";
import {
  getProperty, adminDeleteProperty, adminUpdatePropertyStatus,
  adminGetInspections, adminAddInspectionSlot, adminAddDocument,
  uploadDocument, getAdminToken,
} from "@/lib/api";
import {
  formatPrice, statusLabel, statusColor, propertyTypeLabel, amenityLabel, amenityEmoji,
} from "@/lib/utils";
import type { Property, InspectionBooking } from "@/lib/types";

interface Props { params: Promise<{ id: string }> }

const INS_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  PAID: "bg-blue-50 text-blue-700 border border-blue-200",
  APPROVED: "bg-teal-faint text-teal-dark border border-teal-DEFAULT/30",
  COMPLETED: "bg-green-50 text-green-700 border border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
};

export default function AdminPropertyDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<InspectionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Slot form state
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [slotMax, setSlotMax] = useState("10");
  const [addingSlot, setAddingSlot] = useState(false);

  // Document form state
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("TITLE_DEED");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [addingDoc, setAddingDoc] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) { router.replace("/login"); return; }
    Promise.all([
      getProperty(id),
      adminGetInspections(token, id),
    ]).then(([prop, ins]) => {
      setProperty(prop);
      setBookings(ins);
    }).catch(() => router.replace("/admin/properties"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleDelete() {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    const token = getAdminToken();
    if (!token) return;
    setDeleting(true);
    try {
      await adminDeleteProperty(id, token);
      router.replace("/admin/properties");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const token = getAdminToken();
    if (!token || !property) return;
    const updated = await adminUpdatePropertyStatus(id, e.target.value, token).catch(() => null);
    if (updated) setProperty(updated);
  }

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    const token = getAdminToken();
    if (!token || !slotDate || !slotTime) return;
    setAddingSlot(true);
    try {
      const slot = await adminAddInspectionSlot(id, {
        date: new Date(slotDate).toISOString(),
        time: slotTime,
        maxVisitors: parseInt(slotMax, 10),
      }, token);
      setProperty((p) => p ? { ...p, inspectionSlots: [...(p.inspectionSlots ?? []), slot] } : p);
      setSlotDate(""); setSlotTime(""); setSlotMax("10");
    } finally {
      setAddingSlot(false);
    }
  }

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault();
    const token = getAdminToken();
    if (!token || !docFile || !docName) return;
    setAddingDoc(true);
    try {
      const { url } = await uploadDocument(docFile, token);
      const doc = await adminAddDocument(id, { type: docType, name: docName, url }, token);
      setProperty((p) => p ? { ...p, documents: [...(p.documents ?? []), doc] } : p);
      setDocName(""); setDocFile(null); setDocType("TITLE_DEED");
    } finally {
      setAddingDoc(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/properties" className="text-navy-muted hover:text-navy-DEFAULT">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-xl font-bold text-navy-DEFAULT">{property.title}</h1>
            <p className="text-xs text-navy-muted flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {property.city}, {property.state}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/properties/${id}`} target="_blank"
            className="flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1.5 text-navy-muted hover:text-teal-DEFAULT transition-colors">
            <ExternalLink size={12} /> Public View
          </Link>
          <Link href={`/admin/properties/${id}/edit`}
            className="flex items-center gap-1.5 text-xs bg-teal-DEFAULT text-white rounded-full px-3 py-1.5 hover:bg-teal-dark transition-colors">
            <Edit2 size={12} /> Edit
          </Link>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 text-xs border border-red-200 text-red-500 rounded-full px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-40">
            <Trash2 size={12} /> {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cover image */}
          {property.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={property.coverImage} alt={property.title}
              className="w-full h-52 object-cover rounded-2xl border border-border" />
          )}

          {/* Details card */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-bold text-2xl text-navy-DEFAULT">{formatPrice(property.price)}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(property.status)}`}>
                  {statusLabel(property.status)}
                </span>
                <span className="text-xs text-navy-faint border border-border px-2.5 py-1 rounded-full">
                  {propertyTypeLabel(property.propertyType)}
                </span>
                {property.isFeatured && (
                  <span className="text-xs bg-gold-faint text-gold-DEFAULT font-semibold px-2.5 py-1 rounded-full">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>

            {/* Change status inline */}
            <div>
              <p className="text-[11px] text-navy-faint uppercase tracking-wide mb-1">Change Status</p>
              <select onChange={handleStatusChange} value={property.status}
                className="border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT text-navy-DEFAULT w-full sm:w-auto">
                {["AVAILABLE","INSPECTION_BOOKED","RESERVED","PENDING_PAYMENT","SOLD","OFF_MARKET","UNDER_REVIEW"].map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
              {[
                { icon: Bed, label: "Beds", value: property.bedrooms },
                { icon: Bath, label: "Baths", value: property.bathrooms },
                { icon: Car, label: "Parking", value: property.parkingSpaces },
                { icon: Maximize2, label: "Floor m²", value: property.floorArea },
              ].filter((s) => s.value != null).map((s) => (
                <div key={s.label} className="text-center">
                  <s.icon size={14} className="text-navy-faint mx-auto mb-1" />
                  <p className="text-sm font-semibold text-navy-DEFAULT">{s.value}</p>
                  <p className="text-[10px] text-navy-faint">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-navy-faint uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-navy-DEFAULT leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-navy-faint uppercase tracking-wide mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="text-xs bg-canvas border border-border rounded-full px-2.5 py-1">
                      {amenityEmoji(a)} {amenityLabel(a)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-navy-DEFAULT mb-3 flex items-center gap-2">
              <FileText size={15} className="text-teal-DEFAULT" /> Documents ({property.documents?.length ?? 0})
            </h2>
            {property.documents?.length > 0 && (
              <div className="space-y-2 mb-4">
                {property.documents.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 p-3 bg-canvas rounded-xl border border-border">
                    <div>
                      <p className="text-xs font-medium text-navy-DEFAULT">{d.name}</p>
                      <p className="text-[10px] text-navy-faint">{d.type}</p>
                    </div>
                    <a href={d.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-teal-DEFAULT hover:text-teal-dark font-medium">
                      View →
                    </a>
                  </div>
                ))}
              </div>
            )}
            {/* Add document form */}
            <form onSubmit={handleAddDoc} className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-semibold text-navy-DEFAULT">Add Document</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Document name"
                  className="border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT" />
                <select value={docType} onChange={(e) => setDocType(e.target.value)}
                  className="border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT">
                  {["TITLE_DEED","SURVEY_PLAN","BUILDING_PLAN","TAX_CLEARANCE","OTHER"].map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <input type="file" accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                className="text-xs text-navy-muted" />
              <button type="submit" disabled={addingDoc || !docFile || !docName}
                className="flex items-center gap-2 text-xs bg-navy-DEFAULT text-white rounded-full px-4 py-2 hover:bg-navy-light transition-colors disabled:opacity-40">
                <Plus size={12} /> {addingDoc ? "Uploading…" : "Add Document"}
              </button>
            </form>
          </div>

          {/* Inspection bookings for this property */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-navy-DEFAULT mb-3 flex items-center gap-2">
              <Calendar size={15} className="text-teal-DEFAULT" /> Inspection Bookings ({bookings.length})
            </h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-navy-muted py-4 text-center">No bookings yet for this property.</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-3 bg-canvas border border-border rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-navy-DEFAULT">{b.fullName}</p>
                      <p className="text-[10px] text-navy-muted">{b.ticketNumber} · {b.phone}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${INS_STATUS_COLOR[b.status] ?? ""}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {/* Images */}
          {property.images?.length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-4">
              <p className="text-xs font-semibold text-navy-DEFAULT mb-3">Gallery ({property.images.length})</p>
              <div className="grid grid-cols-2 gap-2">
                {property.images.slice(0, 6).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="w-full h-20 object-cover rounded-xl border border-border" />
                ))}
              </div>
            </div>
          )}

          {/* Inspection slots */}
          <div className="bg-white border border-border rounded-2xl p-4">
            <h2 className="font-semibold text-navy-DEFAULT mb-3 flex items-center gap-2 text-sm">
              <ToggleLeft size={14} className="text-teal-DEFAULT" /> Inspection Slots
            </h2>
            {property.inspectionSlots?.length > 0 ? (
              <div className="space-y-2 mb-3">
                {property.inspectionSlots.map((s: any) => (
                  <div key={s.id} className="p-3 bg-canvas border border-border rounded-xl">
                    <p className="text-xs font-medium text-navy-DEFAULT">
                      {new Date(s.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} · {s.time}
                    </p>
                    <p className="text-[10px] text-navy-muted mt-0.5">
                      Max: {s.maxVisitors} · {s.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-navy-muted mb-3">No slots yet.</p>
            )}
            {/* Add slot form */}
            <form onSubmit={handleAddSlot} className="space-y-2 border-t border-border pt-3">
              <p className="text-[11px] font-semibold text-navy-DEFAULT">Add Slot</p>
              <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-DEFAULT" />
              <input type="time" value={slotTime} onChange={(e) => setSlotTime(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-DEFAULT" />
              <input type="number" value={slotMax} onChange={(e) => setSlotMax(e.target.value)}
                min="1" placeholder="Max visitors"
                className="w-full border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-DEFAULT" />
              <button type="submit" disabled={addingSlot || !slotDate || !slotTime}
                className="w-full flex items-center justify-center gap-2 text-xs bg-teal-DEFAULT text-white rounded-full py-2 hover:bg-teal-dark transition-colors disabled:opacity-40">
                <Plus size={12} /> {addingSlot ? "Adding…" : "Add Slot"}
              </button>
            </form>
          </div>

          {/* Location */}
          {property.latitude && property.longitude && (
            <a href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-border rounded-2xl p-4 text-sm text-teal-DEFAULT hover:border-teal-DEFAULT/50 transition-colors">
              <MapPin size={14} /> View on Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
