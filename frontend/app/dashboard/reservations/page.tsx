"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { getMyReservations, getToken } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Reservation } from "@/lib/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending Review", color: "bg-amber-50 text-amber-700 border border-amber-200", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-teal-faint text-teal-dark border border-teal-DEFAULT/30", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
  EXPIRED: { label: "Expired", color: "bg-navy-ghost text-navy-muted border border-border", icon: AlertCircle },
};

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    getMyReservations(token)
      .then(setReservations)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const approved = reservations.filter((r) => r.status === "APPROVED");
  const others = reservations.filter((r) => r.status !== "APPROVED");

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-navy-muted hover:text-navy-DEFAULT transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Home size={16} className="text-teal-DEFAULT" />
            <h1 className="font-semibold text-navy-DEFAULT">My Reservations</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16">
            <Home size={32} className="text-navy-faint mx-auto mb-3" />
            <p className="font-medium text-navy-DEFAULT mb-1">No reservations yet</p>
            <p className="text-sm text-navy-muted mb-4">
              Browse properties and reserve one you love.
            </p>
            <Link
              href="/properties"
              className="text-sm text-teal-DEFAULT hover:text-teal-dark font-medium"
            >
              Browse Properties →
            </Link>
          </div>
        ) : (
          <>
            {/* Active reservations */}
            {approved.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-navy-muted uppercase tracking-wide mb-3">
                  Active Reservations
                </h2>
                <div className="space-y-4">
                  {approved.map((r) => (
                    <ReservationCard key={r.id} reservation={r} />
                  ))}
                </div>
              </section>
            )}

            {/* All other reservations */}
            {others.length > 0 && (
              <section>
                {approved.length > 0 && (
                  <h2 className="text-xs font-semibold text-navy-muted uppercase tracking-wide mb-3">
                    Past &amp; Pending
                  </h2>
                )}
                <div className="space-y-4">
                  {others.map((r) => (
                    <ReservationCard key={r.id} reservation={r} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReservationCard({ reservation: r }: { reservation: Reservation }) {
  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
  const CfgIcon = cfg.icon;

  const daysLeft =
    r.reservedUntil && r.status === "APPROVED"
      ? Math.max(0, Math.ceil((new Date(r.reservedUntil).getTime() - Date.now()) / 86400000))
      : null;

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      {/* Title row */}
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-navy-DEFAULT truncate">{r.property?.title}</p>
          <p className="text-xs text-navy-muted mt-0.5">
            {r.property?.city}, {r.property?.state}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${cfg.color}`}
        >
          <CfgIcon size={11} /> {cfg.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="border-t border-border px-5 py-3 bg-canvas grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoCell label="Property Price" value={r.property?.price ? formatPrice(r.property.price) : "—"} />
        <InfoCell
          label="Deposit (10%)"
          value={r.depositAmount ? formatPrice(r.depositAmount) : "—"}
        />
        <InfoCell label="Deposit Paid" value={r.depositPaid ? "Yes" : "No"} />
        <InfoCell label="Buyer Name" value={r.buyerName} />
        <InfoCell label="Phone" value={r.buyerPhone} />
        {r.buyerEmail && <InfoCell label="Email" value={r.buyerEmail} />}
        {r.notes && <InfoCell label="Notes" value={r.notes} className="col-span-2 sm:col-span-3" />}
      </div>

      {/* Expiry banner for approved */}
      {r.status === "APPROVED" && r.reservedUntil && (
        <div
          className={`border-t px-5 py-3 flex items-center gap-2 text-xs font-medium ${
            daysLeft !== null && daysLeft <= 3
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-teal-DEFAULT/20 bg-teal-faint text-teal-dark"
          }`}
        >
          <CalendarDays size={13} />
          {daysLeft !== null && daysLeft > 0
            ? `Reserved until ${new Date(r.reservedUntil).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} — ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`
            : "Reservation window has expired — contact us to renew"}
        </div>
      )}

      {/* Property link */}
      <div className="border-t border-border px-5 py-3">
        <Link
          href={`/properties/${r.propertyId}`}
          className="text-xs text-teal-DEFAULT hover:text-teal-dark font-medium"
        >
          View Property →
        </Link>
      </div>
    </div>
  );
}

function InfoCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] text-navy-faint uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-xs font-medium text-navy-DEFAULT">{value}</p>
    </div>
  );
}
