import { notFound } from "next/navigation";
import { getProperty } from "@/lib/api";
import { InspectionBookingFlow } from "@/components/inspection/InspectionBookingFlow";

interface Props { params: Promise<{ propertyId: string }> }

export default async function InspectionPage({ params }: Props) {
  const { propertyId } = await params;
  const property = await getProperty(propertyId).catch(() => null);
  if (!property) notFound();

  if (!property.inspectionSlots?.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-navy-muted">No inspection slots available for this property.</p>
      </div>
    );
  }

  return <InspectionBookingFlow property={property} />;
}
