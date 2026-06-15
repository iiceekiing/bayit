"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MessageSquare, Search } from "lucide-react";
import { adminGetUsers, getAdminToken } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    adminGetUsers(token).then(setUsers).finally(() => setLoading(false));
  }, []);

  const filtered = query
    ? users.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  const ROLE_COLORS: Record<string, string> = {
    USER: "bg-navy-ghost text-navy-muted",
    AGENT: "bg-teal-faint text-teal-dark",
    ADMIN: "bg-blue-50 text-blue-700",
    SUPER_ADMIN: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Users</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-teal-DEFAULT w-48"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-canvas transition-colors">
                <div className="w-9 h-9 rounded-full bg-navy-ghost flex items-center justify-center text-navy-muted font-semibold text-sm shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-DEFAULT">{u.name}</p>
                  <p className="text-xs text-navy-muted">{u.email}{u.phone && ` · ${u.phone}`}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? ""}`}>
                  {u.role}
                </span>
                <Link href={`/admin/messages/${u.id}`}
                  className="p-1.5 text-navy-faint hover:text-teal-DEFAULT transition-colors">
                  <MessageSquare size={15} />
                </Link>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={24} className="text-navy-faint mx-auto mb-2" />
              <p className="text-sm text-navy-muted">No users found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
