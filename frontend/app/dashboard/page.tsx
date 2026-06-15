"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home, Calendar, CreditCard, Shield, MessageSquare, Heart, Bell,
  LogOut, User, ChevronRight, Clock, CheckCircle, AlertCircle, Building2,
} from "lucide-react";
import {
  getMe, getMyInspections, getMyReservations, getMyTransactions,
  getSavedProperties, getUserConversations, getNotificationUnreadCount, getToken,
} from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { User as UserType, InspectionBooking, Reservation, Transaction } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [inspections, setInspections] = useState<InspectionBooking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }

    Promise.all([
      getMe(token),
      getMyInspections(token),
      getMyReservations(token),
      getMyTransactions(token),
      getSavedProperties(token),
      getUserConversations(token),
      getNotificationUnreadCount(token),
    ]).then(([u, ins, res, txs, saved, convs, notifs]) => {
      setUser(u);
      setInspections(ins);
      setReservations(res);
      setTransactions(txs);
      setSavedCount(saved.length);
      setUnreadMsgs(convs.reduce((n, c) => n + (c.unreadCount ?? 0), 0));
      setUnreadNotifs(notifs.count);
    }).catch(() => {
      router.replace("/login");
    }).finally(() => setLoading(false));
  }, [router]);

  function logout() {
    localStorage.removeItem("bayit_token");
    localStorage.removeItem("bayit_user");
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="bg-navy-DEFAULT text-white px-4 sm:px-6 py-6">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy-light animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-navy-light rounded-lg animate-pulse" />
              <div className="h-3 w-48 bg-navy-light rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-4 space-y-2">
                <div className="h-3 w-20 bg-navy-ghost rounded-lg animate-pulse" />
                <div className="h-7 w-12 bg-navy-ghost rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-4 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy-ghost animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3.5 w-1/2 bg-navy-ghost rounded-lg animate-pulse" />
                  <div className="h-3 w-3/4 bg-navy-ghost rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingInspections = inspections.filter((i) => i.status === "PENDING" || i.status === "PAID");
  const approvedReservations = reservations.filter((r) => r.status === "APPROVED");
  const pendingTransactions = transactions.filter((t) => t.status === "PENDING");

  const nav = [
    { href: "/dashboard/inspections", icon: Calendar, label: "Inspections", count: pendingInspections.length, desc: "Booked inspection slots" },
    { href: "/dashboard/reservations", icon: Shield, label: "Reservations", count: approvedReservations.length, desc: "Your property reservations" },
    { href: "/dashboard/transactions", icon: CreditCard, label: "Transactions", count: pendingTransactions.length, desc: "Payment history" },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Messages", count: unreadMsgs, desc: "Chat with agents" },
    { href: "/dashboard/saved", icon: Heart, label: "Saved", count: savedCount, desc: "Saved properties" },
    { href: "/dashboard/notifications", icon: Bell, label: "Notifications", count: unreadNotifs, desc: "Your activity updates" },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="bg-navy-DEFAULT text-white px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-DEFAULT/20 flex items-center justify-center">
              <User size={18} className="text-teal-light" />
            </div>
            <div>
              <p className="font-semibold text-base">{user?.name}</p>
              <p className="text-xs text-navy-faint">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-navy-faint hover:text-white transition-colors text-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Inspections", value: inspections.length, icon: Calendar, color: "teal" },
            { label: "Reservations", value: reservations.length, icon: Shield, color: "navy" },
            { label: "Transactions", value: transactions.length, icon: CreditCard, color: "gold" },
            { label: "Saved", value: savedCount, icon: Heart, color: "teal" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-border rounded-2xl p-4">
              <p className="text-xs text-navy-muted mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-navy-DEFAULT">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active Reservations */}
        {approvedReservations.length > 0 && (
          <Section title="Active Reservations" icon={Shield} href="/dashboard/reservations">
            <div className="space-y-2">
              {approvedReservations.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-canvas border border-border rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-teal-faint flex items-center justify-center shrink-0">
                    <Home size={16} className="text-teal-DEFAULT" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-DEFAULT truncate">{r.property?.title}</p>
                    <p className="text-xs text-navy-muted">{r.property?.city}, {r.property?.state}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-teal-DEFAULT">Reserved</p>
                    {r.reservedUntil && (
                      <p className="text-[10px] text-navy-faint">
                        Until {new Date(r.reservedUntil).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Recent Inspections */}
        {inspections.length > 0 && (
          <Section title="Recent Inspections" icon={Calendar} href="/dashboard/inspections">
            <div className="space-y-2">
              {inspections.slice(0, 3).map((ins) => (
                <div key={ins.id} className="flex items-center gap-3 p-3 bg-canvas border border-border rounded-xl">
                  <StatusDot status={ins.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-DEFAULT truncate">{ins.slot?.property?.title}</p>
                    <p className="text-xs text-navy-muted">
                      {ins.slot && new Date(ins.slot.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      {ins.slot && ` · ${ins.slot.time}`}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-navy-ghost text-navy-muted px-2 py-0.5 rounded-full">
                    {ins.ticketNumber}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Pending Transactions */}
        {pendingTransactions.length > 0 && (
          <Section title="Pending Payments" icon={CreditCard} href="/dashboard/transactions">
            <div className="space-y-2">
              {pendingTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-DEFAULT truncate">{tx.property?.title}</p>
                    <p className="text-xs text-navy-muted">Awaiting admin review</p>
                  </div>
                  <p className="text-sm font-bold text-navy-DEFAULT shrink-0">{formatPrice(tx.amount)}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Nav cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="bg-white border border-border rounded-2xl p-4 hover:border-teal-DEFAULT/50 hover:shadow-sm transition-all group">
              <div className="relative mb-3 w-fit">
                <n.icon size={20} className="text-teal-DEFAULT" />
                {n.count > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {n.count > 9 ? "9+" : n.count}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-navy-DEFAULT">{n.label}</p>
              <p className="text-xs text-navy-muted mt-0.5">{n.desc}</p>
            </Link>
          ))}
        </div>

        <Link href="/properties" className="block text-center text-sm text-teal-DEFAULT hover:text-teal-dark font-medium py-2">
          Browse Properties →
        </Link>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, href, children }: {
  title: string; icon: any; href?: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-teal-DEFAULT" />
          <h2 className="text-sm font-semibold text-navy-DEFAULT">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="text-xs text-teal-DEFAULT hover:text-teal-dark flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-400",
    PAID: "bg-blue-400",
    APPROVED: "bg-teal-DEFAULT",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-red-400",
  };
  return <div className={`w-2 h-2 rounded-full shrink-0 ${map[status] ?? "bg-navy-ghost"}`} />;
}
