"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";
import { adminGetConversations, getAdminToken } from "@/lib/api";
import type { ConversationSummary } from "@/lib/types";

function fmtRelative(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    adminGetConversations(token)
      .then((c) => setConversations(c.sort((a, b) => {
        if (!a.lastAt) return 1;
        if (!b.lastAt) return -1;
        return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
      })))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Messages</h1>
        <p className="text-sm text-navy-muted mt-0.5">User conversations</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={32} className="text-navy-faint mx-auto mb-3" />
          <p className="text-navy-muted">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link key={c.userId} href={`/admin/messages/${c.userId}`}
              className="flex items-center gap-3 bg-white border border-border rounded-2xl p-4 hover:border-teal-DEFAULT/50 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-full bg-navy-ghost flex items-center justify-center shrink-0 font-semibold text-navy-muted text-sm">
                {c.userName?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-navy-DEFAULT truncate">{c.userName ?? c.userEmail}</p>
                  <span className="text-[10px] text-navy-faint shrink-0">{fmtRelative(c.lastAt)}</span>
                </div>
                <p className="text-xs text-navy-muted truncate mt-0.5">
                  {c.userPhone && <span className="mr-2">{c.userPhone}</span>}
                  {c.lastMessage ?? "No messages"}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="w-5 h-5 bg-teal-DEFAULT text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                  {c.unreadCount > 9 ? "9+" : c.unreadCount}
                </span>
              )}
              <ChevronRight size={14} className="text-navy-faint shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
