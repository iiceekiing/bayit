"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield, Clock, CheckCircle, Calendar, User, Phone, Mail,
  CreditCard, Building2, Copy, Upload, Loader2, ChevronRight, X, Check,
} from "lucide-react";
import type { Property, InspectionSlot } from "@/lib/types";
import { bookInspection, getPaymentSettings, uploadReceipt, getToken } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { usePaystack } from "@/hooks/usePaystack";

interface Props { property: Property }

type Step = "disclaimer" | "booking-form" | "payment" | "success";

export function InspectionBookingFlow({ property }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("disclaimer");

  // Disclaimer state
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [checked, setChecked] = useState(false);

  // Booking form state
  const [selectedSlot, setSelectedSlot] = useState<InspectionSlot | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });

  // Payment state
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [payRef, setPayRef] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payMethod, setPayMethod] = useState<"bank" | "paystack">("bank");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Paystack reference for card payment
  const [paystackRef] = useState(() => `BAYIT-INS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`);

  const { initiate: openPaystack } = usePaystack({
    email: form.email || "guest@bayit.ng",
    amount: 1000000, // ₦10,000 in kobo
    reference: paystackRef,
    onSuccess: async (reference) => {
      if (!selectedSlot) return;
      const token = getToken();
      if (!token) { router.push("/login"); return; }
      setSubmitting(true);
      setError("");
      try {
        const result = await bookInspection({
          slotId: selectedSlot.id,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          paymentReference: reference,
        }, token);
        setBooking(result);
        setStep("success");
      } catch (e: any) {
        setError(e.message ?? "Booking failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    onCancel: () => setError("Payment cancelled. Please try again."),
  });

  // Booking result
  const [booking, setBooking] = useState<any>(null);

  // Countdown
  useEffect(() => {
    if (step !== "disclaimer") return;
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, secondsLeft]);

  // Load payment settings when reaching payment step
  useEffect(() => {
    if (step === "payment" && !paymentSettings) {
      getPaymentSettings().then(setPaymentSettings).catch(() => null);
    }
  }, [step, paymentSettings]);

  const INSPECTION_FEE = property.inspectionSlots?.[0]?.fee
    ? formatPrice(property.inspectionSlots[0].fee)
    : "₦10,000";

  const availableSlots = property.inspectionSlots?.filter(
    (s) => s.isActive && s.bookedCount < s.maxVisitors,
  ) ?? [];

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payRef.trim()) { setError("Please enter your payment reference."); return; }
    if (!receiptFile) { setError("Please upload your payment receipt."); return; }
    if (!selectedSlot) return;

    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setSubmitting(true);
    setError("");
    try {
      const { url: receiptUrl } = await uploadReceipt(receiptFile, token);
      const result = await bookInspection({
        slotId: selectedSlot.id,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        paymentReference: payRef.trim(),
        receiptUrl,
      }, token);
      setBooking(result);
      setStep("success");
    } catch (e: any) {
      setError(e.message ?? "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 1: Disclaimer ─────────────────────────────────────────────────────

  if (step === "disclaimer") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-card">
          {/* Header */}
          <div className="bg-navy-DEFAULT px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-DEFAULT/20 flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-teal-light" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">Book a Property Inspection</h1>
            <p className="text-navy-faint text-sm mt-2">{property.title}</p>
          </div>

          <div className="px-6 py-8 space-y-6">
            {/* Fee highlight */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Inspection Fee</p>
              <p className="text-4xl font-bold text-navy-DEFAULT font-serif">₦10,000</p>
              <p className="text-xs text-amber-700 mt-1 font-medium">Non-refundable</p>
            </div>

            {/* Terms */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-navy-DEFAULT">Inspection Terms</h2>
              {[
                "The inspection fee of ₦10,000 is strictly non-refundable.",
                "The fee covers transportation, logistics, and field agent coordination.",
                "Missing your inspection appointment without prior notice may require rebooking and payment of a new fee.",
                "Inspection slots are limited — only available while capacity remains.",
                "You must arrive at the designated time with a valid ID.",
                "The inspection is not a guarantee of property availability.",
              ].map((term, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-navy-muted">
                  <div className="w-5 h-5 rounded-full bg-navy-ghost flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-muted">{i + 1}</span>
                  </div>
                  {term}
                </div>
              ))}
            </div>

            {/* Countdown */}
            {secondsLeft > 0 ? (
              <div className="flex items-center gap-3 bg-canvas border border-border rounded-xl px-4 py-3">
                <Clock size={16} className="text-navy-muted shrink-0" />
                <p className="text-sm text-navy-muted">
                  Please read the terms above. You may proceed in{" "}
                  <span className="font-bold text-navy-DEFAULT">{secondsLeft}s</span>
                </p>
              </div>
            ) : (
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setChecked((c) => !c)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                    checked ? "bg-teal-DEFAULT border-teal-DEFAULT" : "border-border"
                  }`}
                >
                  {checked && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm text-navy-DEFAULT">
                  I have read and understand the inspection terms, including the non-refundable fee policy.
                </span>
              </label>
            )}

            {/* Continue button */}
            <button
              onClick={() => setStep("booking-form")}
              disabled={secondsLeft > 0 || !checked}
              className="w-full bg-teal-DEFAULT text-white font-medium rounded-full py-3.5 hover:bg-teal-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Continue to Booking <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Booking Form ───────────────────────────────────────────────────

  if (step === "booking-form") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-card">
          <div className="px-6 py-5 border-b border-border">
            <StepIndicator current={2} />
            <h2 className="font-serif text-xl font-semibold text-navy-DEFAULT mt-4">Your Details & Preferred Date</h2>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Personal details */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-navy-muted mb-1.5 block">Full Name *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-navy-muted mb-1.5 block">Email Address *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-navy-muted mb-1.5 block">Phone Number *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+234..."
                    className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
                  />
                </div>
              </div>
            </div>

            {/* Slot selection */}
            <div>
              <label className="text-xs font-medium text-navy-muted mb-2 block">Select Inspection Date *</label>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-red-500">No available slots at this time.</p>
              ) : (
                <div className="space-y-2">
                  {availableSlots.map((slot) => {
                    const pct = Math.round((slot.bookedCount / slot.maxVisitors) * 100);
                    const urgent = pct >= 70;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full text-left border rounded-xl p-4 transition-all ${
                          selectedSlot?.id === slot.id
                            ? "border-teal-DEFAULT bg-teal-faint"
                            : "border-border hover:border-teal-DEFAULT/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-navy-DEFAULT">
                              {new Date(slot.date).toLocaleDateString("en-NG", {
                                weekday: "long", day: "numeric", month: "long", year: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-navy-muted mt-0.5">{slot.time}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className={`text-xs font-medium ${urgent ? "text-amber-600" : "text-teal-DEFAULT"}`}>
                              {slot.bookedCount}/{slot.maxVisitors} booked
                            </p>
                            {urgent && (
                              <p className="text-[10px] text-amber-500 mt-0.5">Filling fast!</p>
                            )}
                          </div>
                        </div>
                        {/* Capacity bar */}
                        <div className="mt-2 h-1.5 bg-navy-ghost rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${urgent ? "bg-amber-500" : "bg-teal-DEFAULT"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (!form.fullName || !form.email || !form.phone || !selectedSlot) return;
                setStep("payment");
              }}
              disabled={!form.fullName || !form.email || !form.phone || !selectedSlot}
              className="w-full bg-teal-DEFAULT text-white font-medium rounded-full py-3.5 hover:bg-teal-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Proceed to Payment <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Payment ────────────────────────────────────────────────────────

  if (step === "payment") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-card">
          <div className="px-6 py-5 border-b border-border">
            <StepIndicator current={3} />
            <h2 className="font-serif text-xl font-semibold text-navy-DEFAULT mt-4">Payment</h2>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Summary */}
            <div className="bg-canvas border border-border rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-muted">Property</span>
                <span className="font-medium text-navy-DEFAULT text-right max-w-[60%] line-clamp-1">{property.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-muted">Inspection date</span>
                <span className="font-medium text-navy-DEFAULT">
                  {selectedSlot && new Date(selectedSlot.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  {selectedSlot && ` · ${selectedSlot.time}`}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-navy-DEFAULT">Inspection Fee</span>
                <span className="font-bold text-navy-DEFAULT">₦10,000</span>
              </div>
            </div>

            {/* Payment method toggle */}
            <div className="flex rounded-xl border border-border overflow-hidden">
              {(["bank", "paystack"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    payMethod === m
                      ? "bg-navy-DEFAULT text-white"
                      : "bg-white text-navy-muted hover:bg-canvas"
                  }`}
                >
                  {m === "bank" ? "Bank Transfer" : "Pay with Card"}
                </button>
              ))}
            </div>

            {payMethod === "bank" ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Bank details */}
                {paymentSettings && (
                  <div className="bg-navy-DEFAULT rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 size={14} className="text-teal-light" />
                      <p className="text-xs font-semibold text-white uppercase tracking-wider">Payment Details</p>
                    </div>
                    <BankRow label="Bank" value={paymentSettings.bankName} />
                    <BankRow label="Account Name" value={paymentSettings.accountName} />
                    <BankRow label="Account Number" value={paymentSettings.accountNumber} copyable />
                    <BankRow label="Amount" value="₦10,000" />
                    {paymentSettings.instructions && (
                      <p className="text-xs text-navy-faint mt-2 pt-2 border-t border-navy-light">
                        {paymentSettings.instructions}
                      </p>
                    )}
                  </div>
                )}

                {/* Payment reference */}
                <div>
                  <label className="text-xs font-medium text-navy-muted mb-1.5 block">
                    Payment Reference / Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="e.g. TRF240615XXXXX"
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
                  />
                </div>

                {/* Receipt upload */}
                <div>
                  <label className="text-xs font-medium text-navy-muted mb-1.5 block">
                    Upload Payment Receipt <span className="text-red-500">*</span>
                  </label>
                  <label className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition-colors ${
                    receiptFile ? "border-teal-DEFAULT bg-teal-faint" : "border-border hover:border-teal-DEFAULT/50"
                  }`}>
                    <input type="file" accept="image/*,application/pdf" className="hidden"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
                    {receiptFile ? (
                      <><CheckCircle size={20} className="text-teal-DEFAULT" />
                        <p className="text-xs font-medium text-teal-dark">{receiptFile.name}</p></>
                    ) : (
                      <><Upload size={20} className="text-navy-faint" />
                        <p className="text-xs text-navy-muted">Upload screenshot or photo of payment</p></>
                    )}
                  </label>
                </div>

                {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={submitting || !payRef.trim() || !receiptFile}
                  className="w-full bg-teal-DEFAULT text-white font-medium rounded-full py-3.5 hover:bg-teal-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" /> Submitting Booking…</>
                    : <><CheckCircle size={15} /> Confirm Booking</>}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-canvas border border-border rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-navy-muted">Property</span>
                    <span className="font-medium text-navy-DEFAULT text-right max-w-[60%] line-clamp-1">{property.title}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-navy-DEFAULT">Amount</span>
                    <span className="font-bold text-navy-DEFAULT">₦10,000</span>
                  </div>
                </div>
                {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button
                  onClick={openPaystack}
                  disabled={submitting || !form.fullName || !form.email || !form.phone}
                  className="w-full bg-teal-DEFAULT text-white font-medium rounded-full py-3.5 hover:bg-teal-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
                    : <><CreditCard size={15} /> Pay ₦10,000 with Card</>}
                </button>
                <p className="text-xs text-center text-navy-faint">Secured by Paystack · Card, USSD, Bank Transfer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 4: Success ────────────────────────────────────────────────────────

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="bg-white border border-border rounded-3xl p-10 shadow-card">
        <div className="w-16 h-16 rounded-full bg-teal-faint flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-teal-DEFAULT" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT mb-2">Inspection Booked!</h1>
        <p className="text-navy-muted text-sm mb-6">
          Your inspection has been submitted and is pending confirmation.
        </p>

        {booking && (
          <div className="bg-canvas border border-border rounded-2xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-navy-muted">Ticket</span>
              <span className="font-bold text-navy-DEFAULT font-mono">{booking.ticketNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-muted">Date</span>
              <span className="font-medium text-navy-DEFAULT">
                {selectedSlot && new Date(selectedSlot.date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-muted">Time</span>
              <span className="font-medium text-navy-DEFAULT">{selectedSlot?.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-muted">Status</span>
              <span className="text-amber-600 font-medium">Pending Review</span>
            </div>
          </div>
        )}

        <Link href="/dashboard/inspections"
          className="block w-full bg-navy-DEFAULT text-white text-sm font-medium rounded-full py-3 hover:bg-navy-light transition-colors mb-3">
          View My Inspections
        </Link>
        <Link href="/properties" className="text-sm text-teal-DEFAULT hover:text-teal-dark transition-colors">
          Browse More Properties →
        </Link>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Terms" },
    { n: 2, label: "Details" },
    { n: 3, label: "Payment" },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
            ${s.n < current ? "bg-teal-DEFAULT text-white" : s.n === current ? "bg-navy-DEFAULT text-white" : "bg-navy-ghost text-navy-faint"}`}>
            {s.n < current ? <Check size={13} /> : s.n}
          </div>
          <span className={`text-xs ${s.n === current ? "text-navy-DEFAULT font-medium" : "text-navy-faint"}`}>{s.label}</span>
          {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}

function BankRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  function copy() {
    navigator.clipboard.writeText(value).catch(() => null);
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-navy-faint">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-white ${copyable ? "font-mono tracking-widest" : ""}`}>{value}</span>
        {copyable && (
          <button onClick={copy} className="text-teal-light hover:text-white transition-colors">
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
