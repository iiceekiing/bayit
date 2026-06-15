import Link from "next/link";
import { Search, Shield, Calendar, TrendingUp, ArrowRight, MapPin, Home, Building2, Landmark } from "lucide-react";
import { getFeaturedProperties } from "@/lib/api";
import { PropertyCard } from "@/components/property/PropertyCard";

export default async function HomePage() {
  const featured = await getFeaturedProperties().catch(() => []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy-DEFAULT overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-DEFAULT via-navy-light to-teal-dark opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-DEFAULT/20 text-teal-light text-xs font-medium rounded-full px-3 py-1.5 mb-6">
              <Shield size={11} /> Verified Properties · Trusted Agents
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Find Your Perfect<br />
              <span className="text-teal-light">Home in Nigeria</span>
            </h1>
            <p className="text-lg text-navy-faint leading-relaxed mb-10 max-w-xl">
              Discover premium properties, schedule inspections, and complete purchases — all in one transparent platform.
            </p>

            {/* Search bar */}
            <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-modal max-w-2xl">
              <div className="flex items-center gap-2 flex-1 px-4 py-2">
                <Search size={18} className="text-navy-faint shrink-0" />
                <input
                  type="text"
                  placeholder="Search by location, type, or keyword..."
                  className="flex-1 outline-none text-navy-DEFAULT text-sm bg-transparent placeholder:text-navy-faint"
                />
              </div>
              <Link
                href="/properties"
                className="bg-teal-DEFAULT text-white text-sm font-medium rounded-xl px-6 py-3 hover:bg-teal-dark transition-colors text-center shrink-0"
              >
                Search Properties
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { n: "500+", label: "Properties Listed" },
                { n: "1,200+", label: "Happy Families" },
                { n: "98%", label: "Satisfaction Rate" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.n}</p>
                  <p className="text-sm text-navy-faint">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold text-navy-DEFAULT">Browse by Type</h2>
          <p className="text-navy-muted mt-2">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: "HOUSE", label: "Houses", icon: Home, count: "120+" },
            { type: "APARTMENT", label: "Apartments", icon: Building2, count: "80+" },
            { type: "DUPLEX", label: "Duplexes", icon: Landmark, count: "45+" },
            { type: "LAND", label: "Land", icon: MapPin, count: "60+" },
          ].map((cat) => (
            <Link
              key={cat.type}
              href={`/properties?type=${cat.type}`}
              className="group bg-white border border-border rounded-2xl p-6 text-center hover:border-teal-DEFAULT hover:shadow-card-hover transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-faint flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-DEFAULT transition-colors">
                <cat.icon size={22} className="text-teal-DEFAULT group-hover:text-white transition-colors" />
              </div>
              <p className="font-medium text-navy-DEFAULT text-sm">{cat.label}</p>
              <p className="text-xs text-navy-faint mt-0.5">{cat.count} listings</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-navy-DEFAULT">Featured Properties</h2>
              <p className="text-navy-muted mt-1">Handpicked premium listings</p>
            </div>
            <Link
              href="/properties?featured=true"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-teal-DEFAULT hover:text-teal-dark transition-colors"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-navy-DEFAULT py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-white">Your Journey to Ownership</h2>
            <p className="text-navy-faint mt-2">A clear, transparent path from discovery to ownership</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Search,
                title: "Discover & Browse",
                desc: "Explore our verified property listings. Filter by type, location, and price to find your perfect match.",
              },
              {
                step: "02",
                icon: Calendar,
                title: "Book an Inspection",
                desc: "Schedule a physical inspection for ₦10,000. Our field agents coordinate everything for a smooth visit.",
              },
              {
                step: "03",
                icon: Shield,
                title: "Reserve & Purchase",
                desc: "Reserve the property with a deposit, then complete the purchase with full documentation and admin approval.",
              },
            ].map((step) => (
              <div key={step.step} className="bg-navy-light rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-teal-DEFAULT font-serif">{step.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-teal-DEFAULT/20 flex items-center justify-center">
                    <step.icon size={20} className="text-teal-light" />
                  </div>
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-navy-faint leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-teal-faint border border-teal-DEFAULT/20 rounded-3xl p-12">
          <TrendingUp size={32} className="text-teal-DEFAULT mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-navy-DEFAULT mb-3">Ready to Find Your Home?</h2>
          <p className="text-navy-muted mb-8 max-w-md mx-auto">
            Join thousands of Nigerians who have found their dream property through Bayit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/properties" className="bg-navy-DEFAULT text-white font-medium rounded-full px-8 py-3.5 hover:bg-navy-light transition-colors">
              Browse Properties
            </Link>
            <Link href="/register" className="border border-navy-DEFAULT text-navy-DEFAULT font-medium rounded-full px-8 py-3.5 hover:bg-navy-ghost transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
