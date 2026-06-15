"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getMyTransactions, getToken } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending Review", color: "bg-amber-50 text-amber-700 border border-amber-200", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-teal-faint text-teal-dark border border-teal-DEFAULT/30", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
};

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    getMyTransactions(token)
      .then(setTransactions)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-navy-muted hover:text-navy-DEFAULT transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-teal-DEFAULT" />
            <h1 className="font-semibold text-navy-DEFAULT">My Transactions</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard size={32} className="text-navy-faint mx-auto mb-3" />
            <p className="font-medium text-navy-DEFAULT mb-1">No transactions yet</p>
            <p className="text-sm text-navy-muted mb-4">
              Payments you submit will appear here for tracking.
            </p>
            <Link
              href="/properties"
              className="text-sm text-teal-DEFAULT hover:text-teal-dark font-medium"
            >
              Browse Properties →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.PENDING;
              const CfgIcon = cfg.icon;
              return (
                <div key={tx.id} className="bg-white border border-border rounded-2xl overflow-hidden">
                  {/* Title row */}
                  <div className="px-5 py-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-DEFAULT truncate">{tx.property?.title}</p>
                      <p className="text-xs text-navy-muted mt-0.5">
                        {tx.property?.city}, {tx.property?.state}
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
                    <InfoCell label="Amount" value={formatPrice(tx.amount)} />
                    <InfoCell
                      label="Date Submitted"
                      value={new Date(tx.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    />
                    {tx.paymentReference && (
                      <InfoCell label="Payment Reference" value={tx.paymentReference} mono />
                    )}
                    {tx.adminNotes && (
                      <InfoCell
                        label="Admin Notes"
                        value={tx.adminNotes}
                        className="col-span-2 sm:col-span-3"
                      />
                    )}
                  </div>

                  {/* Receipt + property links */}
                  <div className="border-t border-border px-5 py-3 flex items-center gap-4">
                    {tx.receiptUrl && (
                      <a
                        href={tx.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-DEFAULT hover:text-teal-dark font-medium"
                      >
                        View Receipt →
                      </a>
                    )}
                    <Link
                      href={`/properties/${tx.propertyId}`}
                      className="text-xs text-navy-muted hover:text-navy-DEFAULT font-medium"
                    >
                      View Property →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCell({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] text-navy-faint uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-xs text-navy-DEFAULT ${mono ? "font-mono tracking-wide" : "font-medium"}`}>
        {value}
      </p>
    </div>
  );
}
