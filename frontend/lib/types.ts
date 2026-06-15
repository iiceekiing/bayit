// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "AGENT" | "USER";

export type PropertyType =
  | "HOUSE" | "APARTMENT" | "DUPLEX" | "TERRACE" | "BUNGALOW"
  | "VILLA" | "STUDIO_APARTMENT" | "OFFICE_SPACE" | "SHOP"
  | "WAREHOUSE" | "LAND" | "COMMERCIAL_BUILDING";

export type PropertyStatus =
  | "AVAILABLE" | "INSPECTION_BOOKED" | "RESERVED"
  | "PENDING_PAYMENT" | "SOLD" | "OFF_MARKET" | "UNDER_REVIEW";

export type Amenity =
  | "SWIMMING_POOL" | "GYM" | "SECURITY" | "CCTV" | "WATER_SUPPLY"
  | "SOLAR_POWER" | "ELEVATOR" | "FURNISHED" | "AIR_CONDITIONING"
  | "GARDEN" | "CHILDREN_PLAY_AREA" | "INTERNET";

export type DocumentType =
  | "SURVEY" | "C_OF_O" | "BUILDING_APPROVAL" | "OWNERSHIP_DOCUMENT"
  | "VERIFICATION_DOCUMENT" | "OTHER";

export type InspectionStatus = "PENDING" | "PAID" | "APPROVED" | "CANCELLED" | "COMPLETED";
export type ReservationStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "VOICE" | "DOCUMENT";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Property ─────────────────────────────────────────────────────────────────

export interface PropertyDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  createdAt: string;
}

export interface InspectionSlot {
  id: string;
  propertyId: string;
  date: string;
  time: string;
  maxVisitors: number;
  fee: string; // BigInt as string (kobo)
  isActive: boolean;
  bookedCount: number;
  availableCount: number;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  price: string; // BigInt as string (kobo)
  status: PropertyStatus;
  isFeatured: boolean;

  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  parkingSpaces: number | null;
  landSize: number | null;
  floorArea: number | null;
  yearBuilt: number | null;

  state: string;
  city: string;
  area: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;

  images: string[];
  coverImage: string | null;
  videoUrl: string | null;
  amenities: Amenity[];

  documents: PropertyDocument[];
  inspectionSlots: InspectionSlot[];

  _count?: { reservations: number; savedBy: number };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProperties {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  type?: PropertyType;
  status?: PropertyStatus;
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  featured?: boolean;
  search?: string;
}

// ─── Inspection ───────────────────────────────────────────────────────────────

export interface InspectionBooking {
  id: string;
  userId: string;
  slotId: string;
  fullName: string;
  email: string;
  phone: string;
  ticketNumber: string;
  status: InspectionStatus;
  paymentReference: string | null;
  receiptUrl: string | null;
  adminNotes: string | null;
  slot: InspectionSlot & { property: Property };
  createdAt: string;
  updatedAt: string;
}

// ─── Reservation ──────────────────────────────────────────────────────────────

export interface Reservation {
  id: string;
  userId: string | null;
  propertyId: string;
  property: Property;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  depositAmount: string | null;
  depositPaid: boolean;
  reservedUntil: string | null;
  status: ReservationStatus;
  notes: string | null;
  createdAt: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  userId: string;
  propertyId: string;
  property: Property;
  amount: string;
  paymentReference: string | null;
  receiptUrl: string | null;
  status: TransactionStatus;
  adminNotes: string | null;
  createdAt: string;
}

export interface AdminTransaction extends Transaction {
  user: { id: string; name: string; email: string; phone: string | null };
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  userId: string;
  adminId: string | null;
  content: string | null;
  fromAdmin: boolean;
  read: boolean;
  messageType: MessageType;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: string | null;
  mimeType: string | null;
  createdAt: string;
}

export interface ConversationSummary {
  adminId?: string;
  adminName?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string | null;
  lastMessage: string | null;
  lastAt: string | null;
  unreadCount: number;
}

export interface AdminSummary {
  id: string;
  displayName: string;
  role: UserRole;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: any;
  createdAt: string;
}

// ─── Payment Settings ─────────────────────────────────────────────────────────

export interface PaymentSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string | null;
  updatedAt: string;
}
