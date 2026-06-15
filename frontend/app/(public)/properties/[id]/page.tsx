import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Bed, Bath, Car, Maximize2, Calendar, Building2,
  Shield, FileText, ChevronLeft, MessageSquare, BookOpen, Heart,
} from "lucide-react";
import { getProperty } from "@/lib/api";
import { formatPrice, propertyTypeLabel, statusLabel, statusColor, amenityLabel, amenityEmoji } from "@/lib/utils";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { ReserveButton } from "@/components/property/ReserveButton";
import { SavePropertyButton } from "@/components/property/SavePropertyButton";

interface Props { params: Promise<{ id: string }> }

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id).catch(() => null);
  if (!property) notFound();

  const isSold = property.status === "SOLD";
  const hasSlots = property.inspectionSlots?.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-navy-muted mb-6">
        <Link href="/properties" className="flex items-center gap-1 hover:text-navy-DEFAULT transition-colors">
          <ChevronLeft size={14} /> Properties
        </Link>
        <span>/</span>
        <span className="text-navy-DEFAULT truncate">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <PropertyGallery images={property.images} coverImage={property.coverImage} videoUrl={property.videoUrl} title={property.title} />

          {/* Header info */}
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(property.status)}`}>
                    {statusLabel(property.status)}
                  </span>
                  <span className="text-xs bg-teal-faint text-teal-DEFAULT font-medium px-2.5 py-1 rounded-full">
                    {propertyTypeLabel(property.propertyType)}
                  </span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy-DEFAULT leading-tight">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 mt-2 text-navy-muted text-sm">
                  <MapPin size={14} />
                  <span>{property.address}{property.area && `, ${property.area}`}, {property.city}, {property.state}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl text-navy-DEFAULT">{formatPrice(property.price)}</p>
              </div>
            </div>
          </div>

          {/* Specs */}
          {(property.bedrooms || property.bathrooms || property.parkingSpaces || property.floorArea) && (
            <div className="bg-canvas border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-navy-DEFAULT mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms !== null && (
                  <Spec icon={Bed} label="Bedrooms" value={property.bedrooms.toString()} />
                )}
                {property.bathrooms !== null && (
                  <Spec icon={Bath} label="Bathrooms" value={property.bathrooms.toString()} />
                )}
                {property.toilets !== null && (
                  <Spec icon={Building2} label="Toilets" value={property.toilets.toString()} />
                )}
                {property.parkingSpaces !== null && (
                  <Spec icon={Car} label="Parking" value={property.parkingSpaces.toString()} />
                )}
                {property.floorArea !== null && (
                  <Spec icon={Maximize2} label="Floor Area" value={`${property.floorArea}m²`} />
                )}
                {property.landSize !== null && (
                  <Spec icon={Maximize2} label="Land Size" value={`${property.landSize}m²`} />
                )}
                {property.yearBuilt !== null && (
                  <Spec icon={Calendar} label="Year Built" value={property.yearBuilt.toString()} />
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-navy-DEFAULT mb-3">Description</h2>
            <p className="text-sm text-navy-muted leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-navy-DEFAULT mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-1.5 bg-teal-faint text-teal-dark text-xs font-medium px-3 py-1.5 rounded-full">
                    <span>{amenityEmoji(a)}</span>
                    {amenityLabel(a)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {property.documents?.length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-navy-DEFAULT mb-3 flex items-center gap-2">
                <FileText size={15} className="text-teal-DEFAULT" /> Property Documents
              </h2>
              <div className="space-y-2">
                {property.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-teal-DEFAULT hover:bg-teal-faint transition-colors group"
                  >
                    <FileText size={16} className="text-teal-DEFAULT shrink-0" />
                    <span className="text-sm text-navy-DEFAULT group-hover:text-teal-dark">{doc.name}</span>
                    <span className="ml-auto text-xs text-navy-faint">{doc.type.replace(/_/g, " ")}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Google Maps placeholder */}
          {(property.latitude && property.longitude) && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-navy-DEFAULT mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-teal-DEFAULT" /> Location
              </h2>
              <a
                href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-canvas border border-border rounded-xl h-32 flex items-center justify-center text-sm text-teal-DEFAULT hover:bg-teal-faint transition-colors"
              >
                <MapPin size={16} className="mr-2" />
                View on Google Maps →
              </a>
            </div>
          )}

          {/* Inspection slots */}
          {hasSlots && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-navy-DEFAULT mb-3 flex items-center gap-2">
                <Calendar size={15} className="text-teal-DEFAULT" /> Available Inspection Dates
              </h2>
              <div className="space-y-2">
                {property.inspectionSlots.map((slot) => {
                  const full = slot.bookedCount >= slot.maxVisitors;
                  return (
                    <div key={slot.id} className={`flex items-center justify-between p-3 border rounded-xl ${full ? "border-border opacity-50" : "border-teal-DEFAULT/30 bg-teal-50/30"}`}>
                      <div>
                        <p className="text-sm font-medium text-navy-DEFAULT">
                          {new Date(slot.date).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-xs text-navy-muted">{slot.time}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${full ? "text-red-500" : "text-teal-DEFAULT"}`}>
                          {full ? "Fully Booked" : `${slot.bookedCount}/${slot.maxVisitors} booked`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action card */}
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-20 space-y-3">
            <p className="font-bold text-xl text-navy-DEFAULT">{formatPrice(property.price)}</p>
            <p className="text-xs text-navy-muted">{property.city}, {property.state}</p>

            {isSold ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-red-700">Property Sold</p>
                <p className="text-xs text-red-500 mt-1">This property has been sold.</p>
              </div>
            ) : (
              <>
                {hasSlots && !isSold && (
                  <Link
                    href={`/inspection/${property.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-teal-DEFAULT text-white text-sm font-medium rounded-full py-3 hover:bg-teal-dark transition-colors"
                  >
                    <Calendar size={15} /> Book Inspection
                  </Link>
                )}

                <ReserveButton property={property} />

                <Link
                  href="/dashboard/messages"
                  className="flex items-center justify-center gap-2 w-full border border-border text-navy-DEFAULT text-sm font-medium rounded-full py-3 hover:bg-canvas transition-colors"
                >
                  <MessageSquare size={15} /> Chat with Agent
                </Link>

                <SavePropertyButton propertyId={property.id} />
              </>
            )}

            {/* Trust signals */}
            <div className="border-t border-border pt-3 space-y-2">
              {[
                { icon: Shield, text: "Verified property listing" },
                { icon: BookOpen, text: "Documents available on request" },
                { icon: Calendar, text: "Physical inspection available" },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-2 text-xs text-navy-faint">
                  <t.icon size={12} className="text-teal-DEFAULT shrink-0" />
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-white border border-border rounded-xl p-3 text-center">
      <Icon size={18} className="text-teal-DEFAULT mb-1" />
      <p className="text-xs text-navy-faint">{label}</p>
      <p className="text-sm font-semibold text-navy-DEFAULT mt-0.5">{value}</p>
    </div>
  );
}
