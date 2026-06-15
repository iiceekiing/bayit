"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getMyInspections, getToken } from "@/lib/api";
import type { InspectionBooking } from "@/lib/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending Review", color: "bg-amber-50 text-amber-700 border border-amber-200", icon: Clock },
  PAID: { label: "Payment Submitted", color: "bg-blue-50 text-blue-700 border border-blue-200", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-teal-faint text-teal-dark border border-teal-DEFAULT/30", icon: CheckCircle },
  COMPLETED: { label: "Completed", color: "bg-green-50 text-green-700 border border-green-200", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
};

export default function InspectionsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<InspectionBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    getMyInspections(token)
      .then(setBookings)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-white border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-navy-muted hover:text-navy-DEFAULT transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-teal-DEFAULT" />
            <h1 className="font-semibold text-navy-DEFAULT">My Inspections</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-navy-ghost rounded-lg animate-pulse" />
                    <div className="h-3 w-1/3 bg-navy-ghost rounded-lg animate-pulse" />
                  </div>
                  <div className="h-6 w-24 bg-navy-ghost rounded-full animate-pulse" />
                </div>
                <div className="border-t border-border px-5 py-3 bg-canvas grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-2 w-10 bg-navy-ghost rounded animate-pulse" />
                      <div className="h-3 w-16 bg-navy-ghost rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={32} className="text-navy-faint mx-auto mb-3" />
            <p className="font-medium text-navy-DEFAULT mb-1">No inspection bookings yet</p>
            <p className="text-sm text-navy-muted mb-4">Browse properties and book an inspection slot.</p>
            <Link href="/properties" className="text-sm text-teal-DEFAULT hover:text-teal-dark font-medium">
              Browse Properties →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING;
              const CfgIcon = cfg.icon;
              return (
                <div key={b.id} className="bg-white border border-border rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-DEFAULT truncate">{b.slot?.property?.title}</p>
                      <p className="text-xs text-navy-muted mt-0.5">
                        {b.slot?.property?.city}, {b.slot?.property?.state}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${cfg.color}`}>
                      <CfgIcon size={11} /> {cfg.label}
                    </span>
                  </div>

                  <div className="border-t border-border px-5 py-3 bg-canvas grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <InfoCell label="Ticket" value={b.ticketNumber} mono />
                    <InfoCell
                      label="Date"
                      value={b.slot ? new Date(b.slot.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    />
                    <InfoCell label="Time" value={b.slot?.time ?? "—"} />
                    <InfoCell label="Name" value={b.fullName} />
                    <InfoCell label="Phone" value={b.phone} />
                    {b.adminNotes && <InfoCell label="Admin Notes" value={b.adminNotes} className="col-span-2" />}
                  </div>

                  {b.receiptUrl && (
                    <div className="border-t border-border px-5 py-3">
                      <a href={b.receiptUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-teal-DEFAULT hover:text-teal-dark font-medium">
                        View Receipt →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCell({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-navy-faint uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-xs text-navy-DEFAULT ${mono ? "font-mono tracking-wide" : "font-medium"}`}>{value}</p>
    </div>
  );
}
