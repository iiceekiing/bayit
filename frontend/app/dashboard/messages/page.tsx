"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getUserConversations, getAdmins, getToken } from "@/lib/api";
import type { ConversationSummary, AdminSummary } from "@/lib/types";

function fmtRelative(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [admins, setAdmins] = useState<AdminSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    Promise.all([getUserConversations(token), getAdmins()])
      .then(([convs, adms]) => {
        setConversations(convs.sort((a, b) => {
          if (!a.lastAt) return 1;
          if (!b.lastAt) return -1;
          return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
        }));
        const chattedIds = new Set(convs.map((c) => c.adminId));
        setAdmins(adms.filter((a) => !chattedIds.has(a.id)));
      })
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
            <MessageSquare size={16} className="text-teal-DEFAULT" />
            <h1 className="font-semibold text-navy-DEFAULT">Messages</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Recent conversations */}
            {conversations.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-navy-muted uppercase tracking-wider mb-3">Recent</h2>
                <div className="space-y-2">
                  {conversations.map((c) => (
                    <Link
                      key={c.adminId}
                      href={`/dashboard/messages/${c.adminId}`}
                      className="flex items-center gap-3 bg-white border border-border rounded-2xl p-4 hover:border-teal-DEFAULT/50 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-navy-ghost flex items-center justify-center shrink-0 font-semibold text-navy-muted text-sm">
                        {c.adminName?.charAt(0).toUpperCase() ?? "A"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-navy-DEFAULT truncate">{c.adminName ?? "Agent"}</p>
                          <span className="text-[10px] text-navy-faint shrink-0">{fmtRelative(c.lastAt)}</span>
                        </div>
                        <p className="text-xs text-navy-muted truncate mt-0.5">{c.lastMessage ?? "No messages yet"}</p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-teal-DEFAULT text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                          {c.unreadCount > 9 ? "9+" : c.unreadCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Start new conversation */}
            {admins.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-navy-muted uppercase tracking-wider mb-3">
                  {conversations.length > 0 ? "Start New Chat" : "Available Agents"}
                </h2>
                <div className="space-y-2">
                  {admins.map((a) => (
                    <Link
                      key={a.id}
                      href={`/dashboard/messages/${a.id}`}
                      className="flex items-center gap-3 bg-white border border-border rounded-2xl p-4 hover:border-teal-DEFAULT/50 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-faint flex items-center justify-center shrink-0 font-semibold text-teal-DEFAULT text-sm">
                        {a.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy-DEFAULT">{a.displayName}</p>
                        <p className="text-xs text-navy-muted">{a.role === "SUPER_ADMIN" ? "Super Admin" : "Agent"}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-teal-DEFAULT font-medium">
                        <Plus size={13} /> Chat
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {conversations.length === 0 && admins.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare size={32} className="text-navy-faint mx-auto mb-3" />
                <p className="font-medium text-navy-DEFAULT mb-1">No messages yet</p>
                <p className="text-sm text-navy-muted">Contact an agent to get started.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
