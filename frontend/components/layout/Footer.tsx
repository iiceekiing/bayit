import Link from "next/link";
import { Home, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-DEFAULT text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-DEFAULT flex items-center justify-center">
                <Home size={16} className="text-white" />
              </div>
              <span className="font-serif text-xl font-bold">Bayit</span>
            </div>
            <p className="text-navy-faint text-sm leading-relaxed max-w-xs">
              Nigeria's premium real estate marketplace. Discover, inspect, and acquire your dream property with confidence and transparency.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-navy-faint">
                <Phone size={14} className="text-teal-light" />
                <span>+234 700 000 0000</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-faint">
                <Mail size={14} className="text-teal-light" />
                <span>hello@bayit.ng</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-faint">
                <MapPin size={14} className="text-teal-light" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-faint mb-4">Explore</h3>
            <ul className="space-y-2">
              {[
                { href: "/properties", label: "All Properties" },
                { href: "/properties?type=APARTMENT", label: "Apartments" },
                { href: "/properties?type=HOUSE", label: "Houses" },
                { href: "/properties?featured=true", label: "Featured" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-navy-faint hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-faint mb-4">Account</h3>
            <ul className="space-y-2">
              {[
                { href: "/register", label: "Register" },
                { href: "/login", label: "Sign In" },
                { href: "/dashboard", label: "My Dashboard" },
                { href: "/dashboard/inspections", label: "My Inspections" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-navy-faint hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-light mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-faint">
          <p>© {new Date().getFullYear()} Bayit Properties Ltd. All rights reserved.</p>
          <p>Built with trust, powered by transparency.</p>
        </div>
      </div>
    </footer>
  );
}
