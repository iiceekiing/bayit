import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/properties" className="text-navy-muted hover:text-navy-DEFAULT transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Add New Property</h1>
      </div>
      <PropertyForm />
    </div>
  );
}
