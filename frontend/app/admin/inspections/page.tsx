"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock, ChevronDown } from "lucide-react";
import { adminGetInspections, adminUpdateInspectionStatus, getAdminToken } from "@/lib/api";
import type { InspectionBooking } from "@/lib/types";

const STATUS_OPTS = ["PAID", "APPROVED", "COMPLETED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-blue-50 text-blue-700",
  APPROVED: "bg-teal-faint text-teal-dark",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function AdminInspectionsPage() {
  const [bookings, setBookings] = useState<InspectionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    adminGetInspections(token).then(setBookings).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    const token = getAdminToken();
    if (!token) return;
    setUpdating(id);
    try {
      const updated = await adminUpdateInspectionStatus(id, status, notes[id], token);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: updated.status } : b));
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Inspections</h1>
          <p className="text-sm text-navy-muted mt-0.5">{bookings.filter((b) => b.status === "PENDING").length} pending</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-DEFAULT">
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={32} className="text-navy-faint mx-auto mb-3" />
          <p className="text-navy-muted">No inspections found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-DEFAULT truncate">{b.slot?.property?.title}</p>
                  <p className="text-xs text-navy-muted mt-0.5">
                    {b.fullName} · {b.email} · {b.phone}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-navy-muted">
                      {b.slot && new Date(b.slot.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      {b.slot && ` @ ${b.slot.time}`}
                    </span>
                    <span className="text-[10px] font-mono bg-navy-ghost text-navy-muted px-2 py-0.5 rounded-full">{b.ticketNumber}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[b.status] ?? ""}`}>
                  {b.status}
                </span>
              </div>

              {b.receiptUrl && (
                <div className="px-5 pb-3">
                  <a href={b.receiptUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-teal-DEFAULT hover:text-teal-dark font-medium">View Receipt →</a>
                </div>
              )}

              {b.paymentReference && (
                <div className="px-5 pb-3">
                  <p className="text-xs text-navy-muted">Ref: <span className="font-mono text-navy-DEFAULT">{b.paymentReference}</span></p>
                </div>
              )}

              {/* Admin actions */}
              <div className="border-t border-border px-5 py-3 bg-canvas flex flex-wrap items-center gap-2">
                <input
                  value={notes[b.id] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [b.id]: e.target.value }))}
                  placeholder="Admin notes (optional)…"
                  className="border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-teal-DEFAULT flex-1 min-w-32"
                />
                {STATUS_OPTS.filter((s) => s !== b.status).map((s) => (
                  <button key={s}
                    onClick={() => updateStatus(b.id, s)}
                    disabled={updating === b.id}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 ${
                      s === "APPROVED" ? "bg-teal-DEFAULT text-white hover:bg-teal-dark" :
                      s === "CANCELLED" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                      "bg-navy-ghost text-navy-muted hover:bg-navy-faint/30"
                    }`}
                  >
                    {updating === b.id ? "…" : `Mark ${s}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
