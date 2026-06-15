"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home, Calendar, Shield, CreditCard, Users, ChevronRight,
  Clock, CheckCircle, AlertCircle,
} from "lucide-react";
import {
  adminGetInspections, adminGetReservations, adminGetTransactions,
  adminGetUsers, getAdminToken,
} from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ inspections: 0, reservations: 0, transactions: 0, users: 0 });
  const [pending, setPending] = useState({ inspections: 0, reservations: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    Promise.all([
      adminGetInspections(token),
      adminGetReservations(token),
      adminGetTransactions(token),
      adminGetUsers(token),
    ]).then(([ins, res, txs, users]) => {
      setStats({
        inspections: ins.length,
        reservations: res.length,
        transactions: txs.length,
        users: users.length,
      });
      setPending({
        inspections: ins.filter((i) => i.status === "PENDING").length,
        reservations: res.filter((r) => r.status === "PENDING").length,
        transactions: txs.filter((t) => t.status === "PENDING").length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const total = pending.inspections + pending.reservations + pending.transactions;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Dashboard</h1>
        {total > 0 && (
          <p className="text-sm text-amber-600 mt-1 flex items-center gap-1.5">
            <AlertCircle size={14} /> {total} item{total > 1 ? "s" : ""} pending your review
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Inspections", value: stats.inspections, icon: Calendar, pending: pending.inspections, href: "/admin/inspections" },
          { label: "Reservations", value: stats.reservations, icon: Shield, pending: pending.reservations, href: "/admin/reservations" },
          { label: "Transactions", value: stats.transactions, icon: CreditCard, pending: pending.transactions, href: "/admin/transactions" },
          { label: "Users", value: stats.users, icon: Users, pending: 0, href: "/admin/users" },
        ].map((s) => (
          <Link key={s.href} href={s.href}
            className="bg-white border border-border rounded-2xl p-5 hover:border-teal-DEFAULT/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={18} className="text-teal-DEFAULT" />
              {s.pending > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                  {s.pending} pending
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-navy-DEFAULT">{loading ? "—" : s.value}</p>
            <p className="text-xs text-navy-muted mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-navy-DEFAULT">Quick Actions</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { href: "/admin/properties/new", label: "Add New Property", desc: "List a property on the marketplace" },
            { href: "/admin/inspections", label: "Review Inspections", desc: `${pending.inspections} pending` },
            { href: "/admin/reservations", label: "Manage Reservations", desc: `${pending.reservations} pending` },
            { href: "/admin/transactions", label: "Approve Transactions", desc: `${pending.transactions} pending` },
            { href: "/admin/settings", label: "Payment Settings", desc: "Update bank account details" },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-canvas transition-colors">
              <div>
                <p className="text-sm font-medium text-navy-DEFAULT">{a.label}</p>
                <p className="text-xs text-navy-muted">{a.desc}</p>
              </div>
              <ChevronRight size={15} className="text-navy-faint" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
