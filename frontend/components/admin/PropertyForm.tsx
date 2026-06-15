"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Plus, X, Upload, Calendar,
} from "lucide-react";
import {
  adminCreateProperty, adminUpdateProperty, adminAddDocument, adminAddInspectionSlot,
  uploadImage, uploadVideo, uploadDocument as uploadDocumentFile, getAdminToken,
} from "@/lib/api";
import { PROPERTY_TYPES, ALL_AMENITIES, propertyTypeLabel, amenityLabel } from "@/lib/utils";
import type { Property, PropertyStatus, Amenity } from "@/lib/types";

const STATUSES: PropertyStatus[] = [
  "AVAILABLE", "INSPECTION_BOOKED", "RESERVED", "PENDING_PAYMENT", "SOLD", "OFF_MARKET", "UNDER_REVIEW",
];

interface Props { property?: Property }

export function PropertyForm({ property }: Props) {
  const router = useRouter();
  const isEdit = !!property;

  const [form, setForm] = useState({
    title: property?.title ?? "",
    description: property?.description ?? "",
    propertyType: property?.propertyType ?? "HOUSE",
    price: property ? (Number(property.price) / 100).toString() : "",
    status: property?.status ?? "AVAILABLE" as PropertyStatus,
    isFeatured: property?.isFeatured ?? false,
    state: property?.state ?? "",
    city: property?.city ?? "",
    area: property?.area ?? "",
    address: property?.address ?? "",
    latitude: property?.latitude?.toString() ?? "",
    longitude: property?.longitude?.toString() ?? "",
    bedrooms: property?.bedrooms?.toString() ?? "",
    bathrooms: property?.bathrooms?.toString() ?? "",
    toilets: property?.toilets?.toString() ?? "",
    parkingSpaces: property?.parkingSpaces?.toString() ?? "",
    floorArea: property?.floorArea?.toString() ?? "",
    landSize: property?.landSize?.toString() ?? "",
    yearBuilt: property?.yearBuilt?.toString() ?? "",
    amenities: property?.amenities ?? [] as Amenity[],
  });

  const [images, setImages] = useState<string[]>(property?.images ?? []);
  const [coverImage, setCoverImage] = useState<string>(property?.coverImage ?? "");
  const [videoUrl, setVideoUrl] = useState<string>(property?.videoUrl ?? "");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Inspection slot form
  const [slotForm, setSlotForm] = useState({ date: "", time: "", maxVisitors: "20", fee: "1000000" });
  const [addingSlot, setAddingSlot] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [showSlotForm, setShowSlotForm] = useState(false);

  // Document form
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("OTHER");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(property?.id ?? "");

  const token = getAdminToken();

  function toggle(amenity: Amenity) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || !token) return;
    setUploadingImg(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadImage(f, token).then((r) => r.url)));
      setImages((prev) => [...prev, ...urls]);
      if (!coverImage && urls[0]) setCoverImage(urls[0]);
    } finally {
      setUploadingImg(false);
    }
  }

  async function handleVideoUpload(file: File | null) {
    if (!file || !token) return;
    setUploadingVideo(true);
    try {
      const { url } = await uploadVideo(file, token);
      setVideoUrl(url);
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const priceKobo = Math.round(parseFloat(form.price.replace(/,/g, "")) * 100);
      const payload = {
        ...form,
        price: priceKobo,
        isFeatured: form.isFeatured,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        toilets: form.toilets ? parseInt(form.toilets) : null,
        parkingSpaces: form.parkingSpaces ? parseInt(form.parkingSpaces) : null,
        floorArea: form.floorArea ? parseFloat(form.floorArea) : null,
        landSize: form.landSize ? parseFloat(form.landSize) : null,
        yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : null,
        images,
        coverImage: coverImage || (images[0] ?? null),
        videoUrl: videoUrl || null,
      };

      let result: Property;
      if (isEdit) {
        result = await adminUpdateProperty(property!.id, payload, token);
      } else {
        result = await adminCreateProperty(payload, token);
      }
      setSavedId(result.id);

      if (!isEdit) {
        router.push(`/admin/properties/${result.id}/edit`);
      } else {
        router.push("/admin/properties");
      }
    } catch (e: any) {
      setError(e.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !savedId) return;
    setAddingSlot(true);
    try {
      const slot = await adminAddInspectionSlot(savedId, {
        date: slotForm.date,
        time: slotForm.time,
        maxVisitors: parseInt(slotForm.maxVisitors),
        fee: parseInt(slotForm.fee),
      }, token);
      setSlots((prev) => [...prev, slot]);
      setSlotForm({ date: "", time: "", maxVisitors: "20", fee: "1000000" });
      setShowSlotForm(false);
    } catch (e: any) {
      setError(e.message ?? "Failed to add slot.");
    } finally {
      setAddingSlot(false);
    }
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!docFile || !docName || !token || !savedId) return;
    setUploadingDoc(true);
    try {
      const { url } = await uploadDocumentFile(docFile, token);
      await adminAddDocument(savedId, { type: docType, name: docName, url }, token);
      setDocFile(null);
      setDocName("");
    } catch (e: any) {
      setError(e.message ?? "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  }

  const inp = "w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT";

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      {/* Basic info */}
      <Section title="Basic Information">
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. 4-Bedroom Duplex in Lekki Phase 1" className={inp} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea required rows={5} value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detailed property description…" className={`${inp} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Property Type *</label>
              <select required value={form.propertyType} onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value as any }))}
                className={inp}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{propertyTypeLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PropertyStatus }))}
                className={inp}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (₦) *</label>
              <input required type="number" min="0" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 75000000" className={inp} />
              <p className="text-[10px] text-navy-faint mt-1">Enter in Naira (₦)</p>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="featured" checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="w-4 h-4 rounded accent-teal-600" />
              <label htmlFor="featured" className="text-sm text-navy-DEFAULT">Feature on homepage</label>
            </div>
          </div>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "state" as const, label: "State *", req: true, placeholder: "e.g. Lagos" },
            { key: "city" as const, label: "City *", req: true, placeholder: "e.g. Lekki" },
            { key: "area" as const, label: "Area", req: false, placeholder: "e.g. Phase 1" },
            { key: "address" as const, label: "Address *", req: true, placeholder: "Street address" },
            { key: "latitude" as const, label: "Latitude", req: false, placeholder: "e.g. 6.4281" },
            { key: "longitude" as const, label: "Longitude", req: false, placeholder: "e.g. 3.4219" },
          ].map(({ key, label, req, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input required={req} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder} className={inp} />
            </div>
          ))}
        </div>
      </Section>

      {/* Specs */}
      <Section title="Property Specifications">
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "bedrooms" as const, label: "Bedrooms" },
            { key: "bathrooms" as const, label: "Bathrooms" },
            { key: "toilets" as const, label: "Toilets" },
            { key: "parkingSpaces" as const, label: "Parking" },
            { key: "floorArea" as const, label: "Floor Area (m²)" },
            { key: "landSize" as const, label: "Land Size (m²)" },
            { key: "yearBuilt" as const, label: "Year Built" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="number" min="0" value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className={inp} />
            </div>
          ))}
        </div>
      </Section>

      {/* Amenities */}
      <Section title="Amenities">
        <div className="flex flex-wrap gap-2">
          {ALL_AMENITIES.map((a) => (
            <button key={a} type="button" onClick={() => toggle(a as Amenity)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                form.amenities.includes(a as Amenity)
                  ? "bg-teal-DEFAULT text-white border-teal-DEFAULT"
                  : "border-border text-navy-muted hover:border-teal-DEFAULT/50"
              }`}>
              {amenityLabel(a)}
            </button>
          ))}
        </div>
      </Section>

      {/* Media */}
      <Section title="Media">
        <div className="space-y-4">
          <div>
            <label className="label">Property Images</label>
            <label className={`flex items-center gap-2 border-2 border-dashed border-border rounded-xl px-4 py-3 cursor-pointer hover:border-teal-DEFAULT/50 transition-colors ${uploadingImg ? "opacity-50" : ""}`}>
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)} disabled={uploadingImg} />
              <Upload size={16} className="text-navy-faint" />
              <span className="text-sm text-navy-muted">{uploadingImg ? "Uploading…" : "Upload images"}</span>
            </label>
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((url, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className={`w-16 h-12 object-cover rounded-lg border-2 ${coverImage === url ? "border-teal-DEFAULT" : "border-transparent"} cursor-pointer`}
                      onClick={() => setCoverImage(url)} />
                    <button type="button" onClick={() => { setImages((p) => p.filter((_, j) => j !== i)); if (coverImage === url) setCoverImage(""); }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length > 0 && <p className="text-[10px] text-navy-faint mt-1">Click an image to set as cover</p>}
          </div>

          <div>
            <label className="label">Property Video</label>
            <label className={`flex items-center gap-2 border-2 border-dashed border-border rounded-xl px-4 py-3 cursor-pointer hover:border-teal-DEFAULT/50 transition-colors ${uploadingVideo ? "opacity-50" : ""}`}>
              <input type="file" accept="video/*" className="hidden"
                onChange={(e) => handleVideoUpload(e.target.files?.[0] ?? null)} disabled={uploadingVideo} />
              <Upload size={16} className="text-navy-faint" />
              <span className="text-sm text-navy-muted">{uploadingVideo ? "Uploading…" : videoUrl ? "Replace video" : "Upload video (optional)"}</span>
            </label>
            {videoUrl && <p className="text-xs text-teal-DEFAULT mt-1">Video uploaded ✓</p>}
          </div>
        </div>
      </Section>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button type="submit" disabled={saving}
        className="bg-teal-DEFAULT text-white font-medium rounded-full px-8 py-3 hover:bg-teal-dark transition-colors disabled:opacity-60 flex items-center gap-2">
        {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : (isEdit ? "Save Changes" : "Create Property")}
      </button>

      {/* Post-save: inspection slots & documents */}
      {savedId && (
        <>
          <Section title="Inspection Slots">
            {slots.map((s, i) => (
              <div key={i} className="text-xs text-navy-muted border border-border rounded-xl px-3 py-2 mb-2">
                {s.date} @ {s.time} · Max: {s.maxVisitors}
              </div>
            ))}
            {showSlotForm ? (
              <form onSubmit={handleAddSlot} className="border border-border rounded-xl p-4 space-y-3 bg-canvas">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Date *</label>
                    <input type="date" required value={slotForm.date}
                      onChange={(e) => setSlotForm((f) => ({ ...f, date: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className="label">Time *</label>
                    <input type="time" required value={slotForm.time}
                      onChange={(e) => setSlotForm((f) => ({ ...f, time: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className="label">Max Visitors</label>
                    <input type="number" min="1" value={slotForm.maxVisitors}
                      onChange={(e) => setSlotForm((f) => ({ ...f, maxVisitors: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className="label">Fee (kobo)</label>
                    <input type="number" value={slotForm.fee}
                      onChange={(e) => setSlotForm((f) => ({ ...f, fee: e.target.value }))} className={inp} />
                    <p className="text-[10px] text-navy-faint mt-0.5">1000000 = ₦10,000</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={addingSlot}
                    className="text-xs font-medium px-4 py-1.5 bg-teal-DEFAULT text-white rounded-full hover:bg-teal-dark transition-colors disabled:opacity-40">
                    {addingSlot ? "Adding…" : "Add Slot"}
                  </button>
                  <button type="button" onClick={() => setShowSlotForm(false)}
                    className="text-xs font-medium px-4 py-1.5 border border-border text-navy-muted rounded-full hover:bg-canvas">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button type="button" onClick={() => setShowSlotForm(true)}
                className="flex items-center gap-2 text-sm text-teal-DEFAULT hover:text-teal-dark font-medium">
                <Plus size={14} /> Add Inspection Slot
              </button>
            )}
          </Section>

          <Section title="Documents">
            <form onSubmit={handleAddDocument} className="border border-border rounded-xl p-4 space-y-3 bg-canvas">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Document Name *</label>
                  <input required value={docName} onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. C of O" className={inp} />
                </div>
                <div>
                  <label className="label">Document Type</label>
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inp}>
                    {["SURVEY","C_OF_O","BUILDING_APPROVAL","OWNERSHIP_DOCUMENT","VERIFICATION_DOCUMENT","OTHER"].map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 border border-dashed border-border rounded-xl px-4 py-2.5 cursor-pointer hover:border-teal-DEFAULT/50">
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden"
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
                <Upload size={14} className="text-navy-faint" />
                <span className="text-sm text-navy-muted">{docFile ? docFile.name : "Upload document"}</span>
              </label>
              <button type="submit" disabled={!docFile || !docName || uploadingDoc}
                className="text-xs font-medium px-4 py-1.5 bg-navy-DEFAULT text-white rounded-full hover:bg-navy-light transition-colors disabled:opacity-40">
                {uploadingDoc ? "Uploading…" : "Add Document"}
              </button>
            </form>
          </Section>
        </>
      )}
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-navy-DEFAULT mb-4 pb-2 border-b border-border">{title}</h3>
      {children}
    </div>
  );
}

// Inline tailwind class helper — add to globals or component
// .label { @apply text-xs font-medium text-navy-muted mb-1.5 block; }
