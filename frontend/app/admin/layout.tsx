"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2, LayoutDashboard, Home, Calendar, Shield, CreditCard,
  MessageSquare, Users, Settings, LogOut, Menu, X,
} from "lucide-react";
import { getAdminToken } from "@/lib/api";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/properties", icon: Home, label: "Properties" },
  { href: "/admin/inspections", icon: Calendar, label: "Inspections" },
  { href: "/admin/reservations", icon: Shield, label: "Reservations" },
  { href: "/admin/transactions", icon: CreditCard, label: "Transactions" },
  { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) router.replace("/login");
  }, [router]);

  function logout() {
    localStorage.removeItem("bayit_admin_token");
    localStorage.removeItem("bayit_admin_user");
    router.push("/login");
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-navy-light flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-teal-DEFAULT/20 flex items-center justify-center">
          <Building2 size={16} className="text-teal-light" />
        </div>
        <span className="font-serif text-lg font-bold text-white">Bayit</span>
        <span className="text-[10px] bg-teal-DEFAULT/20 text-teal-light px-2 py-0.5 rounded-full ml-auto">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(n.href, n.exact)
                ? "bg-teal-DEFAULT text-white"
                : "text-navy-faint hover:text-white hover:bg-navy-light"
            }`}
          >
            <n.icon size={16} /> {n.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-navy-light pt-4">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy-faint hover:text-white hover:bg-navy-light transition-colors w-full">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-navy-DEFAULT shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 h-full bg-navy-DEFAULT">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={20} className="text-navy-DEFAULT" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-teal-DEFAULT" />
            <span className="font-serif font-bold text-navy-DEFAULT">Bayit Admin</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
