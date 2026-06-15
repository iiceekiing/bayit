"use client";

import { useEffect, useState } from "react";
import { Shield, MapPin } from "lucide-react";
import { adminGetReservations, adminUpdateReservation, getAdminToken } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Reservation } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-teal-faint text-teal-dark",
  REJECTED: "bg-red-50 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-600",
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    adminGetReservations(token).then(setReservations).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    const token = getAdminToken();
    if (!token) return;
    setUpdating(id);
    try {
      const updated = await adminUpdateReservation(id, status, token);
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: updated.status, reservedUntil: updated.reservedUntil } : r));
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filter === "ALL" ? reservations : reservations.filter((r) => r.status === filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Reservations</h1>
          <p className="text-sm text-navy-muted mt-0.5">{reservations.filter((r) => r.status === "PENDING").length} pending</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm outline-none">
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Shield size={32} className="text-navy-faint mx-auto mb-3" />
          <p className="text-navy-muted">No reservations found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-DEFAULT truncate">{r.property?.title}</p>
                  <div className="flex items-center gap-1 text-xs text-navy-muted mt-0.5">
                    <MapPin size={11} /> {r.property?.city}, {r.property?.state}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-navy-muted">
                    <span>{r.buyerName}</span>
                    <span>{r.buyerPhone}</span>
                    {r.buyerEmail && <span>{r.buyerEmail}</span>}
                  </div>
                  {r.depositAmount && (
                    <p className="text-xs mt-1">
                      Deposit: <span className="font-semibold text-navy-DEFAULT">{formatPrice(r.depositAmount)}</span>
                      {" "}· {r.depositPaid ? "Paid" : "Unpaid"}
                    </p>
                  )}
                  {r.reservedUntil && (
                    <p className="text-xs text-navy-muted mt-0.5">
                      Reserved until: {new Date(r.reservedUntil).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[r.status] ?? ""}`}>
                  {r.status}
                </span>
              </div>

              {r.status === "PENDING" && (
                <div className="border-t border-border px-5 py-3 bg-canvas flex gap-2">
                  <button onClick={() => updateStatus(r.id, "APPROVED")} disabled={updating === r.id}
                    className="text-xs font-medium px-4 py-1.5 bg-teal-DEFAULT text-white rounded-full hover:bg-teal-dark transition-colors disabled:opacity-40">
                    {updating === r.id ? "…" : "Approve"}
                  </button>
                  <button onClick={() => updateStatus(r.id, "REJECTED")} disabled={updating === r.id}
                    className="text-xs font-medium px-4 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors disabled:opacity-40">
                    {updating === r.id ? "…" : "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
