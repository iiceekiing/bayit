import type {
  AuthResponse, User, Property, PaginatedProperties, PropertyFilters,
  InspectionBooking, InspectionSlot, Reservation, Transaction, AdminTransaction,
  Message, ConversationSummary, AdminSummary, Notification, PaymentSettings,
  PropertyDocument,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("bayit_token") ?? "";
}

export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("bayit_admin_token") ?? "";
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function register(name: string, email: string, password: string, phone?: string): Promise<AuthResponse> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, phone }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token: string): Promise<User> {
  return request("/api/auth/me", { headers: authHeader(token) });
}

// ─── Properties ───────────────────────────────────────────────────────────────

export async function getProperties(filters: PropertyFilters = {}): Promise<PaginatedProperties> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  return request(`/api/properties?${params}`);
}

export async function getFeaturedProperties(): Promise<Property[]> {
  return request("/api/properties/featured");
}

export async function getProperty(id: string): Promise<Property> {
  return request(`/api/properties/${id}`);
}

export async function getStates(): Promise<string[]> {
  return request("/api/properties/states");
}

export async function adminCreateProperty(data: any, token: string): Promise<Property> {
  return request("/api/properties", { method: "POST", body: JSON.stringify(data), headers: authHeader(token) });
}

export async function adminUpdateProperty(id: string, data: any, token: string): Promise<Property> {
  return request(`/api/properties/${id}`, { method: "PUT", body: JSON.stringify(data), headers: authHeader(token) });
}

export async function adminUpdatePropertyStatus(id: string, status: string, token: string): Promise<Property> {
  return request(`/api/properties/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }), headers: authHeader(token) });
}

export async function adminDeleteProperty(id: string, token: string): Promise<void> {
  await request(`/api/properties/${id}`, { method: "DELETE", headers: authHeader(token) });
}

export async function adminAddDocument(propertyId: string, doc: { type: string; name: string; url: string }, token: string): Promise<PropertyDocument> {
  return request(`/api/properties/${propertyId}/documents`, { method: "POST", body: JSON.stringify(doc), headers: authHeader(token) });
}

export async function adminAddInspectionSlot(propertyId: string, slot: any, token: string): Promise<InspectionSlot> {
  return request(`/api/properties/${propertyId}/inspection-slots`, { method: "POST", body: JSON.stringify(slot), headers: authHeader(token) });
}

// ─── Inspections ──────────────────────────────────────────────────────────────

export async function getInspectionSlots(propertyId: string): Promise<InspectionSlot[]> {
  return request(`/api/inspections/slots/${propertyId}`);
}

export async function bookInspection(dto: {
  slotId: string; fullName: string; email: string; phone: string;
  paymentReference?: string; receiptUrl?: string;
}, token: string): Promise<InspectionBooking> {
  return request("/api/inspections/book", { method: "POST", body: JSON.stringify(dto), headers: authHeader(token) });
}

export async function getMyInspections(token: string): Promise<InspectionBooking[]> {
  return request("/api/inspections/mine", { headers: authHeader(token) });
}

export async function getInspectionTicket(id: string, token: string): Promise<InspectionBooking> {
  return request(`/api/inspections/ticket/${id}`, { headers: authHeader(token) });
}

export async function adminGetInspections(token: string, propertyId?: string): Promise<InspectionBooking[]> {
  const params = propertyId ? `?propertyId=${propertyId}` : "";
  return request(`/api/inspections/admin${params}`, { headers: authHeader(token) });
}

export async function adminUpdateInspectionStatus(id: string, status: string, adminNotes: string | undefined, token: string): Promise<InspectionBooking> {
  return request(`/api/inspections/admin/${id}/status`, {
    method: "PATCH", body: JSON.stringify({ status, adminNotes }), headers: authHeader(token),
  });
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export async function createReservation(dto: {
  propertyId: string; buyerName: string; buyerPhone: string; buyerEmail?: string; notes?: string;
}, token: string): Promise<Reservation> {
  return request("/api/reservations", { method: "POST", body: JSON.stringify(dto), headers: authHeader(token) });
}

export async function getMyReservations(token: string): Promise<Reservation[]> {
  return request("/api/reservations/mine", { headers: authHeader(token) });
}

export async function adminGetReservations(token: string): Promise<Reservation[]> {
  return request("/api/reservations/admin", { headers: authHeader(token) });
}

export async function adminUpdateReservation(id: string, status: string, token: string): Promise<Reservation> {
  return request(`/api/reservations/admin/${id}/status`, {
    method: "PATCH", body: JSON.stringify({ status }), headers: authHeader(token),
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function createTransaction(dto: {
  propertyId: string; amount: number; paymentReference?: string; receiptUrl?: string;
}, token: string): Promise<Transaction> {
  return request("/api/transactions", { method: "POST", body: JSON.stringify(dto), headers: authHeader(token) });
}

export async function getMyTransactions(token: string): Promise<Transaction[]> {
  return request("/api/transactions/mine", { headers: authHeader(token) });
}

export async function adminGetTransactions(token: string): Promise<AdminTransaction[]> {
  return request("/api/transactions/admin", { headers: authHeader(token) });
}

export async function adminUpdateTransaction(id: string, status: string, adminNotes: string | undefined, token: string): Promise<AdminTransaction> {
  return request(`/api/transactions/admin/${id}`, {
    method: "PATCH", body: JSON.stringify({ status, adminNotes }), headers: authHeader(token),
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getAdmins(): Promise<AdminSummary[]> {
  return request("/api/messages/admins");
}

export async function getUserConversations(token: string): Promise<ConversationSummary[]> {
  return request("/api/messages/conversations", { headers: authHeader(token) });
}

export async function getConversation(adminId: string, token: string): Promise<Message[]> {
  return request(`/api/messages/with/${adminId}`, { headers: authHeader(token) });
}

export async function sendMessage(adminId: string, dto: any, token: string): Promise<Message> {
  return request(`/api/messages/to/${adminId}`, { method: "POST", body: JSON.stringify(dto), headers: authHeader(token) });
}

export async function getUserUnreadCount(token: string): Promise<{ count: number }> {
  return request("/api/messages/unread-count", { headers: authHeader(token) });
}

export async function getAdminUnreadCount(token: string): Promise<{ count: number }> {
  return request("/api/messages/admin/unread-count/all", { headers: authHeader(token) });
}

export async function adminGetConversations(token: string): Promise<ConversationSummary[]> {
  return request("/api/messages/admin/conversations", { headers: authHeader(token) });
}

export async function adminGetConversation(userId: string, token: string): Promise<Message[]> {
  return request(`/api/messages/admin/${userId}`, { headers: authHeader(token) });
}

export async function adminSendMessage(userId: string, dto: any, token: string): Promise<Message> {
  return request(`/api/messages/admin/${userId}`, { method: "POST", body: JSON.stringify(dto), headers: authHeader(token) });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(token: string): Promise<Notification[]> {
  return request("/api/notifications", { headers: authHeader(token) });
}

export async function markNotificationRead(id: string, token: string) {
  return request(`/api/notifications/${id}/read`, { method: "PATCH", headers: authHeader(token) });
}

export async function markAllNotificationsRead(token: string) {
  return request("/api/notifications/read-all", { method: "PATCH", headers: authHeader(token) });
}

export async function getNotificationUnreadCount(token: string): Promise<{ count: number }> {
  return request("/api/notifications/unread-count", { headers: authHeader(token) });
}

// ─── Payment Settings ─────────────────────────────────────────────────────────

export async function getPaymentSettings(): Promise<PaymentSettings> {
  return request("/api/payment-settings");
}

export async function updatePaymentSettings(dto: any, token: string): Promise<PaymentSettings> {
  return request("/api/payment-settings", { method: "PUT", body: JSON.stringify(dto), headers: authHeader(token) });
}

// ─── Upload ───────────────────────────────────────────────────────────────────

async function uploadFile(endpoint: string, file: File | Blob, token: string, filename?: string) {
  const form = new FormData();
  form.append("file", file, filename);
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json() as Promise<{ url: string; publicId: string }>;
}

export const uploadImage = (file: File, token: string) => uploadFile("/api/upload/image", file, token, file.name);
export const uploadVideo = (file: File, token: string) => uploadFile("/api/upload/video", file, token, file.name);
export const uploadDocument = (file: File, token: string) => uploadFile("/api/upload/document", file, token, file.name);
export const uploadReceipt = (file: File, token: string) => uploadFile("/api/upload/receipt", file, token, file.name);
export const uploadChatImage = (file: File, token: string) => uploadFile("/api/upload/chat/image", file, token, file.name);
export const uploadChatVideo = (file: File, token: string) => uploadFile("/api/upload/chat/video", file, token, file.name);
export const uploadChatVoice = (blob: Blob, token: string) => uploadFile("/api/upload/chat/voice", blob, token, "voice.webm");
export const uploadChatDocument = (file: File, token: string) => uploadFile("/api/upload/chat/document", file, token, file.name);

// ─── Saved Properties ─────────────────────────────────────────────────────────

export async function getSavedProperties(token: string) {
  return request<any[]>("/api/users/saved", { headers: authHeader(token) });
}

export async function toggleSaved(propertyId: string, token: string) {
  return request<{ saved: boolean }>(`/api/users/saved/${propertyId}/toggle`, {
    method: "PATCH", headers: authHeader(token),
  });
}

// ─── Admin: Users ─────────────────────────────────────────────────────────────

export async function adminGetUsers(token: string) {
  return request<User[]>("/api/users/admin", { headers: authHeader(token) });
}

// ─── Password Reset ────────────────────────────────────────────────────────────

export async function forgotPassword(email: string) {
  return request<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return request<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
}
