"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Menu, X, Bell, MessageSquare, User, LogOut, ChevronDown, Search } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("bayit_token");
    const name = localStorage.getItem("bayit_user_name");
    const role = localStorage.getItem("bayit_user_role");
    if (token && name) setUser({ name, role: role ?? "USER" });
  }, [pathname]);

  function logout() {
    localStorage.removeItem("bayit_token");
    localStorage.removeItem("bayit_user_name");
    localStorage.removeItem("bayit_user_role");
    localStorage.removeItem("bayit_user_email");
    setUser(null);
    router.push("/");
  }

  const isAdmin = user?.role && ["ADMIN", "SUPER_ADMIN"].includes(user.role);

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-navy-DEFAULT flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <span className="font-serif text-xl font-bold text-navy-DEFAULT tracking-tight">Bayit</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <NavLink href="/properties">Properties</NavLink>
          <NavLink href="/properties?featured=true">Featured</NavLink>
          {isAdmin && <NavLink href="/admin">Admin</NavLink>}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard/messages" className="p-2 rounded-full hover:bg-navy-ghost transition-colors">
                <MessageSquare size={18} className="text-navy-muted" />
              </Link>
              <Link href="/dashboard/notifications" className="p-2 rounded-full hover:bg-navy-ghost transition-colors">
                <Bell size={18} className="text-navy-muted" />
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-navy-ghost transition-colors border border-border"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-DEFAULT flex items-center justify-center">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-navy-DEFAULT hidden sm:block">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className="text-navy-muted" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-40 w-48 bg-white border border-border rounded-xl shadow-modal py-1">
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-DEFAULT hover:bg-canvas transition-colors">
                        <User size={14} className="text-navy-muted" /> My Dashboard
                      </Link>
                      <Link href="/dashboard/saved" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-DEFAULT hover:bg-canvas transition-colors">
                        <Home size={14} className="text-navy-muted" /> Saved Properties
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-DEFAULT hover:bg-canvas transition-colors">
                          <Search size={14} className="text-navy-muted" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-border mx-2 my-1" />
                      <button onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-navy-DEFAULT hover:text-teal transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link href="/register" className="text-sm font-medium bg-navy-DEFAULT text-white rounded-full px-4 py-2 hover:bg-navy-light transition-colors">
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          <MobileLink href="/properties" onClick={() => setMenuOpen(false)}>Properties</MobileLink>
          <MobileLink href="/properties?featured=true" onClick={() => setMenuOpen(false)}>Featured</MobileLink>
          {user && <MobileLink href="/dashboard" onClick={() => setMenuOpen(false)}>My Dashboard</MobileLink>}
          {isAdmin && <MobileLink href="/admin" onClick={() => setMenuOpen(false)}>Admin</MobileLink>}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-1.5 text-sm font-medium text-navy-muted hover:text-navy-DEFAULT hover:bg-canvas rounded-lg transition-colors">
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2.5 text-sm font-medium text-navy-DEFAULT hover:bg-canvas rounded-lg transition-colors">
      {children}
    </Link>
  );
}
