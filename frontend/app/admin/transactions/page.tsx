"use client";

import { useEffect, useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { adminGetTransactions, adminUpdateTransaction, getAdminToken } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { AdminTransaction } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-teal-faint text-teal-dark",
  REJECTED: "bg-red-50 text-red-700",
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    adminGetTransactions(token).then(setTransactions).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    const token = getAdminToken();
    if (!token) return;
    setUpdating(id);
    try {
      const updated = await adminUpdateTransaction(id, status, notes[id], token);
      setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, ...updated } : t));
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filter === "ALL" ? transactions : transactions.filter((t) => t.status === filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Transactions</h1>
          <p className="text-sm text-navy-muted mt-0.5">{transactions.filter((t) => t.status === "PENDING").length} pending</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm outline-none">
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard size={32} className="text-navy-faint mx-auto mb-3" />
          <p className="text-navy-muted">No transactions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-DEFAULT truncate">{t.property?.title}</p>
                  <p className="text-xs text-navy-muted mt-0.5">{t.user?.name} · {t.user?.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm font-bold text-navy-DEFAULT">{formatPrice(t.amount)}</p>
                    {t.paymentReference && (
                      <p className="text-xs text-navy-muted">Ref: <span className="font-mono text-navy-DEFAULT">{t.paymentReference}</span></p>
                    )}
                  </div>
                  {t.adminNotes && (
                    <p className="text-xs text-navy-muted mt-1">Notes: {t.adminNotes}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[t.status] ?? ""}`}>
                    {t.status}
                  </span>
                  {t.receiptUrl && (
                    <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-teal-DEFAULT hover:text-teal-dark">
                      <ExternalLink size={11} /> Receipt
                    </a>
                  )}
                </div>
              </div>

              {t.status === "PENDING" && (
                <div className="border-t border-border px-5 py-3 bg-canvas flex flex-wrap items-center gap-2">
                  <input
                    value={notes[t.id] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [t.id]: e.target.value }))}
                    placeholder="Admin notes…"
                    className="border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-teal-DEFAULT flex-1 min-w-32"
                  />
                  <button onClick={() => updateStatus(t.id, "APPROVED")} disabled={updating === t.id}
                    className="text-xs font-medium px-4 py-1.5 bg-teal-DEFAULT text-white rounded-full hover:bg-teal-dark transition-colors disabled:opacity-40">
                    {updating === t.id ? "…" : "Approve"}
                  </button>
                  <button onClick={() => updateStatus(t.id, "REJECTED")} disabled={updating === t.id}
                    className="text-xs font-medium px-4 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors disabled:opacity-40">
                    {updating === t.id ? "…" : "Reject"}
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
