"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, X, Loader2 } from "lucide-react";
import type { Property } from "@/lib/types";
import { createReservation, getToken } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface Props { property: Property }

export function ReserveButton({ property }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ buyerName: "", buyerPhone: "", buyerEmail: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) { router.push("/login"); return; }
    setLoading(true);
    setError("");
    try {
      await createReservation({
        propertyId: property.id,
        buyerName: form.buyerName,
        buyerPhone: form.buyerPhone,
        buyerEmail: form.buyerEmail || undefined,
      }, token);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? "Reservation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const depositDisplay = property.price
    ? formatPrice(Math.floor(Number(property.price) / 10))
    : "10% deposit";

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center gap-2 w-full border border-navy-DEFAULT text-navy-DEFAULT text-sm font-medium rounded-full py-3 hover:bg-navy-ghost transition-colors"
      >
        <Shield size={15} /> Reserve Property
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-serif text-base font-semibold text-navy-DEFAULT">Reserve Property</h2>
              <button onClick={() => { setModalOpen(false); setSuccess(false); setError(""); }}>
                <X size={18} className="text-navy-muted" />
              </button>
            </div>

            {success ? (
              <div className="px-5 py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-teal-faint flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} className="text-teal-DEFAULT" />
                </div>
                <h3 className="font-semibold text-navy-DEFAULT mb-2">Reservation Submitted!</h3>
                <p className="text-sm text-navy-muted mb-4">
                  Your reservation is pending admin review. You'll be notified once approved.
                </p>
                <button onClick={() => router.push("/dashboard")} className="text-sm text-teal-DEFAULT font-medium">
                  Go to Dashboard →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                <div className="bg-canvas border border-border rounded-xl p-4">
                  <p className="text-xs text-navy-muted mb-1">Property</p>
                  <p className="font-medium text-navy-DEFAULT text-sm">{property.title}</p>
                  <p className="text-xs text-navy-muted mt-1">Deposit required: <span className="font-semibold text-navy-DEFAULT">{depositDisplay}</span></p>
                </div>

                <div>
                  <label className="text-xs font-medium text-navy-muted mb-1 block">Full Name *</label>
                  <input required value={form.buyerName} onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT" placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-navy-muted mb-1 block">Phone Number *</label>
                  <input required value={form.buyerPhone} onChange={(e) => setForm((f) => ({ ...f, buyerPhone: e.target.value }))}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT" placeholder="+234..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-navy-muted mb-1 block">Email</label>
                  <input type="email" value={form.buyerEmail} onChange={(e) => setForm((f) => ({ ...f, buyerEmail: e.target.value }))}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT" placeholder="your@email.com" />
                </div>

                {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full bg-navy-DEFAULT text-white text-sm font-medium rounded-full py-3 hover:bg-navy-light transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : <><Shield size={15} /> Submit Reservation</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
