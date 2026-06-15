"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronLeft, CheckCheck } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead, getToken } from "@/lib/api";
import type { Notification } from "@/lib/types";

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    getNotifications(token)
      .then(setNotifications)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleRead(id: string) {
    const token = getToken();
    if (!token) return;
    await markNotificationRead(id, token).catch(() => null);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function handleReadAll() {
    const token = getToken();
    if (!token) return;
    await markAllNotificationsRead(token).catch(() => null);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-white border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-navy-muted hover:text-navy-DEFAULT transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-teal-DEFAULT" />
              <h1 className="font-semibold text-navy-DEFAULT">Notifications</h1>
              {unreadCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleReadAll} className="flex items-center gap-1.5 text-xs text-teal-DEFAULT hover:text-teal-dark font-medium">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="text-navy-faint mx-auto mb-3" />
            <p className="font-medium text-navy-DEFAULT mb-1">No notifications yet</p>
            <p className="text-sm text-navy-muted">Updates about your inspections and reservations will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read && handleRead(n.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                  n.read ? "bg-white border-border" : "bg-teal-faint border-teal-DEFAULT/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!n.read && <div className="w-2 h-2 rounded-full bg-teal-DEFAULT shrink-0 mt-1.5" />}
                  <div className={`flex-1 min-w-0 ${n.read ? "pl-5" : ""}`}>
                    <p className="text-sm font-medium text-navy-DEFAULT">{n.title}</p>
                    <p className="text-xs text-navy-muted mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-navy-faint mt-1">{fmtRelative(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
