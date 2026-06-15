"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell, Calendar, Shield, CreditCard, MessageSquare,
  CheckCircle, Clock, ArrowRight,
} from "lucide-react";
import {
  adminGetInspections, adminGetReservations, adminGetTransactions,
  getAdminUnreadCount, getAdminToken,
} from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "inspection" | "reservation" | "transaction" | "message";
  title: string;
  subtitle: string;
  href: string;
  time: string;
  urgent: boolean;
}

export default function AdminActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inspections: 0, reservations: 0, transactions: 0, messages: 0 });

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;

    Promise.all([
      adminGetInspections(token),
      adminGetReservations(token),
      adminGetTransactions(token),
      getAdminUnreadCount(token),
    ]).then(([inspections, reservations, transactions, msgs]) => {
      const pending: ActivityItem[] = [];

      inspections
        .filter((i) => i.status === "PENDING" || i.status === "PAID")
        .forEach((i) => pending.push({
          id: i.id,
          type: "inspection",
          title: `Inspection: ${i.slot?.property?.title ?? "Property"}`,
          subtitle: `${i.fullName} · ${i.status === "PAID" ? "Payment received — awaiting approval" : "Awaiting payment confirmation"}`,
          href: "/admin/inspections",
          time: i.createdAt,
          urgent: i.status === "PAID",
        }));

      reservations
        .filter((r) => r.status === "PENDING")
        .forEach((r) => pending.push({
          id: r.id,
          type: "reservation",
          title: `Reservation: ${r.property?.title ?? "Property"}`,
          subtitle: `${r.buyerName} · Deposit ${r.depositAmount ? formatPrice(r.depositAmount) : "—"} — awaiting approval`,
          href: "/admin/reservations",
          time: r.createdAt,
          urgent: false,
        }));

      transactions
        .filter((t) => t.status === "PENDING")
        .forEach((t) => pending.push({
          id: t.id,
          type: "transaction",
          title: `Payment: ${t.property?.title ?? "Property"}`,
          subtitle: `${(t as any).user?.name ?? "User"} · ${t.amount ? formatPrice(t.amount) : "—"} — awaiting approval`,
          href: "/admin/transactions",
          time: t.createdAt,
          urgent: true,
        }));

      // Sort newest first
      pending.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setItems(pending);
      setStats({
        inspections: inspections.filter((i) => i.status === "PENDING" || i.status === "PAID").length,
        reservations: reservations.filter((r) => r.status === "PENDING").length,
        transactions: transactions.filter((t) => t.status === "PENDING").length,
        messages: msgs.count,
      });
    }).finally(() => setLoading(false));
  }, []);

  const ICON_MAP = {
    inspection: Calendar,
    reservation: Shield,
    transaction: CreditCard,
    message: MessageSquare,
  };

  const COLOR_MAP = {
    inspection: "bg-blue-50 text-blue-600",
    reservation: "bg-teal-faint text-teal-dark",
    transaction: "bg-amber-50 text-amber-600",
    message: "bg-navy-ghost text-navy-muted",
  };

  const total = stats.inspections + stats.reservations + stats.transactions + stats.messages;

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <Bell size={18} className="text-teal-DEFAULT" />
          <h1 className="text-lg font-semibold text-navy-DEFAULT">Activity &amp; Pending Actions</h1>
          {total > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {total}
            </span>
          )}
        </div>
        <p className="text-sm text-navy-muted mt-1">Items that require your attention</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending Inspections", count: stats.inspections, href: "/admin/inspections", icon: Calendar, color: "blue" },
            { label: "Pending Reservations", count: stats.reservations, href: "/admin/reservations", icon: Shield, color: "teal" },
            { label: "Pending Payments", count: stats.transactions, href: "/admin/transactions", icon: CreditCard, color: "amber" },
            { label: "Unread Messages", count: stats.messages, href: "/admin/messages", icon: MessageSquare, color: "navy" },
          ].map((s) => (
            <Link key={s.label} href={s.href}
              className="bg-white border border-border rounded-2xl p-4 hover:border-teal-DEFAULT/40 transition-colors group">
              <s.icon size={16} className="text-teal-DEFAULT mb-2" />
              <p className="text-2xl font-bold text-navy-DEFAULT">{s.count}</p>
              <p className="text-[11px] text-navy-muted mt-0.5 leading-snug">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Activity list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle size={36} className="text-teal-DEFAULT mx-auto mb-3" />
            <p className="font-semibold text-navy-DEFAULT mb-1">All caught up!</p>
            <p className="text-sm text-navy-muted">No pending items need your attention right now.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-navy-muted uppercase tracking-wide">
              Pending Actions ({items.length})
            </h2>
            {items.map((item) => {
              const Icon = ICON_MAP[item.type];
              const colorClass = COLOR_MAP[item.type];
              return (
                <Link key={item.id} href={item.href}
                  className="flex items-center gap-4 bg-white border border-border rounded-2xl px-4 py-3.5 hover:border-teal-DEFAULT/40 hover:shadow-sm transition-all group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-navy-DEFAULT truncate">{item.title}</p>
                      {item.urgent && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          <Clock size={9} /> Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-navy-muted mt-0.5 truncate">{item.subtitle}</p>
                  </div>
                  <ArrowRight size={14} className="text-navy-faint group-hover:text-teal-DEFAULT transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
