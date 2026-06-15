import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProperty } from "@/lib/api";
import { PropertyForm } from "@/components/admin/PropertyForm";

interface Props { params: Promise<{ id: string }> }

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id).catch(() => null);
  if (!property) notFound();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/properties" className="text-navy-muted hover:text-navy-DEFAULT transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Edit Property</h1>
      </div>
      <PropertyForm property={property} />
    </div>
  );
}
