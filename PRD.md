# Bayit — Project Requirements Document

**Version:** 1.0  
**Last Updated:** 2026-06-15  
**Project Location:** `/home/iceking/bayit`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [Directory Structure](#6-directory-structure)
7. [Backend Modules](#7-backend-modules)
8. [Frontend Pages & Components](#8-frontend-pages--components)
9. [API Reference](#9-api-reference)
10. [Feature Implementation Status](#10-feature-implementation-status)
11. [Pending Work](#11-pending-work)
12. [Environment Variables](#12-environment-variables)
13. [Running the Project](#13-running-the-project)

---

## 1. Project Overview

**Bayit** is a Nigerian real estate marketplace platform. The name "Bayit" (בַּיִת) means "home" in Hebrew. It enables buyers to discover, inspect, reserve, and purchase properties in a guided, trust-building process.

### Core User Journey

```
Browse Properties → View Detail → Book Inspection → Pay Fee → Attend Inspection → Reserve Property → Pay Deposit → Complete Purchase
```

### User Roles

| Role | Description |
|------|-------------|
| `USER` | Regular buyers — can browse, inspect, reserve, purchase, save, message |
| `AGENT` | Property agents — same access as USER, future agent-specific features |
| `ADMIN` | Staff — manages properties, inspections, reservations, transactions, messages |
| `SUPER_ADMIN` | Full access — all admin features plus user management and settings |

### Key Business Rules

- Inspection fee is **₦10,000** (stored as `1,000,000` kobo in the DB), non-refundable
- A 15-second countdown disclaimer must be read before booking an inspection
- Reservation deposit is **10%** of the property price, auto-calculated
- Reservation is valid for **14 days** after admin approval
- All prices are stored in **kobo** as PostgreSQL `BigInt`, serialized as strings in JSON
- Admin must manually approve inspections, reservations, and transactions
- Chat is between users and admins only (no user-to-user messaging)

---

## 2. Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 10.x | Server framework |
| TypeScript | 5.3 | Language |
| PostgreSQL | 15+ | Primary database |
| Prisma ORM | 5.10 | Database access layer |
| JWT + Passport | — | Authentication |
| Socket.IO | 4.x | Real-time messaging |
| Cloudinary | 2.x | Media/file storage |
| Multer | 1.4 | File upload middleware |
| Nodemailer | 6.x | Email notifications (configured, not yet wired to events) |
| bcryptjs | 2.x | Password hashing |
| class-validator | 0.14 | DTO validation |
| uuid | 9.x | Ticket number generation |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14 (App Router) | React framework |
| TypeScript | 5.x | Language |
| Tailwind CSS | 3.x | Styling |
| Lucide React | — | Icons |

---

## 3. Design System

The design system is defined in `frontend/tailwind.config.ts`.

### Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `canvas` | `#F5F7FA` | Page background |
| `surface` / `white` | `#FFFFFF` | Card backgrounds |
| `navy-DEFAULT` | `#0B1F3A` | Primary text, admin sidebar, buttons |
| `navy-light` | `#1E3352` | Navy hover states |
| `navy-muted` | `#4A5A72` | Secondary text |
| `navy-faint` | `#8A9AB2` | Placeholder/metadata text |
| `navy-ghost` | `#E4EAF2` | Subtle fills, avatar backgrounds |
| `teal-DEFAULT` | `#0D7377` | Primary CTA buttons, links, accents |
| `teal-dark` | `#095255` | Teal hover |
| `teal-light` | `#14A085` | Teal on dark backgrounds |
| `teal-faint` | `#E4F5F5` | Teal tinted fills |
| `gold-DEFAULT` | `#C49A1A` | Luxury/featured badge accent |
| `gold-faint` | `#FDF6E3` | Gold tinted fills |
| `border` | `#E2E8F0` | All borders and dividers |

### Typography

- **Serif** (`Georgia, Cambria`): Page headings, property titles, section titles
- **Sans** (`Inter, system-ui`): Body text, labels, UI elements
- **Mono** (`font-mono`): Ticket numbers, account numbers, references

### Shadow System

| Token | Usage |
|-------|-------|
| `shadow-card` | Default card elevation |
| `shadow-card-hover` | On hover or selected states |
| `shadow-modal` | Modal overlays |

### Border Radius

- `rounded-xl` (0.75rem) — inputs, small cards, tags
- `rounded-2xl` (1rem) — most cards
- `rounded-3xl` (1.5rem) — major modal/card containers
- `rounded-full` — buttons, badges, avatars

### Animations

- `animate-fade-in` — gallery media transitions
- `animate-slide-up` — modal entry
- `animate-spin` — loading spinners

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  Port: 3000                                                       │
│                                                                   │
│  (public)/         — No-auth pages                               │
│    /properties     — Property listing                            │
│    /properties/[id]— Property detail + inspection slots          │
│    /inspection/[id]— 3-step inspection booking flow              │
│                                                                   │
│  /login, /register — Auth pages                                   │
│                                                                   │
│  /dashboard/       — Authenticated user area                     │
│    /inspections    — User's bookings                             │
│    /messages       — Conversations list + chat                   │
│    /saved          — Saved properties                            │
│    /notifications  — Activity updates                            │
│                                                                   │
│  /admin/           — Admin panel (ADMIN/SUPER_ADMIN only)        │
│    /properties     — CRUD                                        │
│    /inspections    — Review + approve bookings                   │
│    /reservations   — Approve/reject reservations                 │
│    /transactions   — Approve/reject payments                     │
│    /messages       — All user conversations                      │
│    /users          — User list                                   │
│    /settings       — Bank account details                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (HTTP + Bearer JWT)
                           │ WebSocket (/messages namespace)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                        BACKEND (NestJS)                           │
│  Port: 3001                                                       │
│                                                                   │
│  Global Guards:                                                   │
│    JwtAuthGuard  — validates JWT on all routes                   │
│    RolesGuard    — enforces @Roles() decorator                   │
│    @Public()     — opt-out decorator for public routes           │
│                                                                   │
│  Modules:                                                         │
│    Auth         — register, login, /me                           │
│    Properties   — full CRUD, slots, documents                    │
│    Inspections  — booking, tickets, admin review                 │
│    Reservations — create, approve/reject, 14-day window          │
│    Transactions — submit, approve/reject                         │
│    Messages     — REST + Socket.IO gateway                       │
│    Notifications— create, mark-read                              │
│    Upload       — Cloudinary image/video/doc/receipt/chat        │
│    Users        — saved properties, admin user list              │
│    PaymentSettings — bank account CRUD                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Prisma ORM
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      PostgreSQL Database                          │
│                                                                   │
│  Tables: users, properties, property_documents,                  │
│  inspection_slots, inspection_bookings, reservations,            │
│  transactions, messages, saved_properties, notifications,        │
│  payment_settings                                                │
└─────────────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Cloudinary  │
                    │  (media CDN) │
                    └─────────────┘
```

### Authentication Flow

1. User registers or logs in → receives JWT token
2. Frontend stores token in `localStorage` (`bayit_token` for users, `bayit_admin_token` for admins)
3. All API calls pass `Authorization: Bearer <token>` header
4. Socket.IO connections pass token via `socket.auth.token` on handshake
5. Admin routes require `ADMIN` or `SUPER_ADMIN` role

---

## 5. Database Schema

All prices are stored in **kobo** as `BigInt`. 1 Naira = 100 kobo.

### Users

```prisma
model User {
  id         String   @id @default(uuid())
  name       String
  email      String   @unique
  phone      String?
  password   String   // bcrypt hashed
  role       UserRole @default(USER)
  isVerified Boolean  @default(false)
  avatarUrl  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum UserRole { SUPER_ADMIN | ADMIN | AGENT | USER }
```

### Properties

```prisma
model Property {
  price        BigInt              // kobo
  status       PropertyStatus      // 7 values
  propertyType PropertyType        // 12 values
  amenities    Amenity[]           // up to 12 values
  images       String[]
  // + bedrooms, bathrooms, toilets, parkingSpaces, floorArea, landSize, yearBuilt
  // + state, city, area, address, latitude, longitude
  // + isFeatured, coverImage, videoUrl
}

enum PropertyType {
  HOUSE | APARTMENT | DUPLEX | TERRACE | BUNGALOW | VILLA
  STUDIO_APARTMENT | OFFICE_SPACE | SHOP | WAREHOUSE | LAND | COMMERCIAL_BUILDING
}

enum PropertyStatus {
  AVAILABLE | INSPECTION_BOOKED | RESERVED | PENDING_PAYMENT | SOLD | OFF_MARKET | UNDER_REVIEW
}

enum Amenity {
  SWIMMING_POOL | GYM | SECURITY | CCTV | WATER_SUPPLY | SOLAR_POWER
  ELEVATOR | FURNISHED | AIR_CONDITIONING | GARDEN | CHILDREN_PLAY_AREA | INTERNET
}
```

### Inspection Slots & Bookings

```prisma
model InspectionSlot {
  date        DateTime
  time        String
  maxVisitors Int     @default(10)
  fee         BigInt  @default(1000000)  // ₦10,000
  isActive    Boolean @default(true)
}

model InspectionBooking {
  ticketNumber String           @unique  // "INS-XXXXXXXX" format
  status       InspectionStatus @default(PENDING)
  // PENDING → PAID → APPROVED → COMPLETED | CANCELLED
}
```

### Reservations

```prisma
model Reservation {
  depositAmount BigInt?         // auto-calculated as 10% of property price
  depositPaid   Boolean @default(false)
  reservedUntil DateTime?       // set to now + 14 days on approval
  status        ReservationStatus @default(PENDING)
  // PENDING → APPROVED | REJECTED | EXPIRED
}
```

### Messages

```prisma
model Message {
  userId    String    // always the user (buyer)
  adminId   String?   // the specific admin in this conversation
  fromAdmin Boolean   // direction flag
  messageType MessageType  // TEXT | IMAGE | VIDEO | VOICE | DOCUMENT
  fileUrl  String?
}
```

### Key Relationships

- One Property → many InspectionSlots → many InspectionBookings
- One Property → many Reservations, Transactions
- One User → many InspectionBookings, Reservations, Transactions, Messages
- Messages are scoped by `(userId, adminId)` pair — each pair is a separate conversation thread

---

## 6. Directory Structure

```
/home/iceking/bayit/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           ← Complete DB schema
│   ├── src/
│   │   ├── main.ts                 ← Bootstrap (CORS, ValidationPipe)
│   │   ├── app.module.ts           ← Root module, global guards
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── public.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts
│   │   │       └── roles.guard.ts
│   │   └── modules/
│   │       ├── auth/               ← register, login, /me, JWT strategy
│   │       ├── properties/         ← CRUD, slots, documents, filters
│   │       ├── inspections/        ← book, tickets, admin manage
│   │       ├── reservations/       ← create, approve/reject
│   │       ├── transactions/       ← submit, approve/reject
│   │       ├── messages/           ← REST + Socket.IO gateway
│   │       ├── notifications/      ← create, mark-read
│   │       ├── upload/             ← Cloudinary upload endpoints
│   │       ├── users/              ← saved properties, user list
│   │       └── payment-settings/   ← bank account CRUD
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── layout.tsx              ← Root layout with Navbar + Footer
    │   ├── page.tsx                ← Homepage / Landing page
    │   ├── globals.css             ← Tailwind directives + global styles
    │   ├── login/page.tsx          ← Login form
    │   ├── register/page.tsx       ← Registration form
    │   ├── (public)/               ← Public-facing pages (no auth required)
    │   │   ├── properties/
    │   │   │   ├── page.tsx        ← Property listing with filters
    │   │   │   └── [id]/page.tsx   ← Property detail, gallery, slots, sidebar
    │   │   └── inspection/
    │   │       └── [propertyId]/page.tsx ← Inspection booking entry point
    │   ├── dashboard/              ← Authenticated user area
    │   │   ├── page.tsx            ← User dashboard overview
    │   │   ├── inspections/page.tsx← User's inspection bookings
    │   │   ├── messages/
    │   │   │   ├── page.tsx        ← Conversations list
    │   │   │   └── [adminId]/page.tsx ← Chat with specific admin
    │   │   ├── saved/page.tsx      ← Saved/wishlist properties
    │   │   └── notifications/page.tsx ← Activity notifications
    │   └── admin/                  ← Admin panel
    │       ├── layout.tsx          ← Admin sidebar layout
    │       ├── page.tsx            ← Admin dashboard with stats
    │       ├── properties/
    │       │   ├── page.tsx        ← Property list + delete
    │       │   ├── new/page.tsx    ← Create property form
    │       │   └── [id]/edit/page.tsx ← Edit property form
    │       ├── inspections/page.tsx← Review & approve bookings
    │       ├── reservations/page.tsx ← Approve/reject reservations
    │       ├── transactions/page.tsx ← Approve/reject payments
    │       ├── messages/
    │       │   ├── page.tsx        ← All user conversations list
    │       │   └── [userId]/page.tsx ← Chat with specific user
    │       ├── users/page.tsx      ← User directory with message link
    │       └── settings/page.tsx   ← Bank account payment settings
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx          ← Public navbar with auth links
    │   │   └── Footer.tsx          ← Site footer
    │   ├── property/
    │   │   ├── PropertyCard.tsx    ← Grid card with image, price, specs
    │   │   ├── PropertyGallery.tsx ← Auto-rotating media carousel
    │   │   ├── PropertiesFilters.tsx ← Filter sidebar/bar
    │   │   └── ReserveButton.tsx   ← Reserve modal with deposit display
    │   ├── inspection/
    │   │   └── InspectionBookingFlow.tsx ← 3-step booking flow
    │   ├── admin/
    │   │   └── PropertyForm.tsx    ← Create/edit property form
    │   ├── chat/                   ← (placeholder dir, not yet implemented)
    │   ├── dashboard/              ← (placeholder dir, not yet implemented)
    │   └── ui/                     ← (placeholder dir, not yet implemented)
    ├── lib/
    │   ├── api.ts                  ← All API call functions
    │   ├── types.ts                ← All TypeScript interfaces/types
    │   └── utils.ts                ← formatPrice, labels, enums
    ├── hooks/                      ← (placeholder dir, not yet implemented)
    ├── tailwind.config.ts
    ├── next.config.ts
    └── package.json
```

---

## 7. Backend Modules

### Auth Module (`/api/auth`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `POST /register` | Public | Create account, returns JWT |
| `POST /login` | Public | Login, returns JWT |
| `GET /me` | Authenticated | Get current user profile |

**Implementation:** `auth.service.ts` hashes passwords with bcrypt (10 rounds), signs JWT with 30-day expiry. Strategy in `jwt.strategy.ts` extracts `sub` from payload and loads user from DB.

### Properties Module (`/api/properties`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `GET /` | Public | Paginated list with filters |
| `GET /featured` | Public | Up to 6 featured available properties |
| `GET /states` | Public | Distinct states for filter dropdown |
| `GET /:id` | Public | Single property with docs + slots |
| `POST /` | ADMIN+ | Create property |
| `PUT /:id` | ADMIN+ | Update property |
| `PATCH /:id/status` | ADMIN+ | Update status only |
| `DELETE /:id` | ADMIN+ | Delete property |
| `POST /:id/documents` | ADMIN+ | Add document |
| `DELETE /:id/documents/:docId` | ADMIN+ | Remove document |
| `POST /:id/inspection-slots` | ADMIN+ | Add inspection slot |
| `PATCH /slots/:slotId/disable` | ADMIN+ | Deactivate slot |

**Query filters:** `type`, `status`, `state`, `city`, `minPrice`, `maxPrice`, `bedrooms`, `featured`, `search`, `page`, `limit`

**BigInt serialization:** All prices and fees are `.toString()`'d in the `serialize()` method.

### Inspections Module (`/api/inspections`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `GET /slots/:propertyId` | Public | Slots with `bookedCount` + `availableCount` |
| `POST /book` | USER+ | Book a slot; auto-sets PAID if receipt/ref provided |
| `GET /mine` | USER+ | My bookings with slot + property |
| `GET /ticket/:id` | USER+ | Single booking ticket |
| `GET /admin` | ADMIN+ | All bookings (filter by `status`, `propertyId`) |
| `PATCH /admin/:id/status` | ADMIN+ | Update booking status + admin notes |

**Ticket format:** `INS-XXXXXXXX` (8 uppercase hex chars from UUID)

**Capacity check:** Before booking, counts existing bookings for the slot and rejects if `bookedCount >= maxVisitors`.

### Reservations Module (`/api/reservations`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `POST /` | USER+ | Create reservation; deposit = `price / 10` |
| `GET /mine` | USER+ | My reservations |
| `GET /admin` | ADMIN+ | All reservations |
| `PATCH /admin/:id/status` | ADMIN+ | Approve/reject; approval sets 14-day window + marks property RESERVED |

### Transactions Module (`/api/transactions`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `POST /` | USER+ | Submit transaction (receipt URL + reference) |
| `GET /mine` | USER+ | My transactions |
| `GET /admin` | ADMIN+ | All transactions with user info |
| `PATCH /admin/:id` | ADMIN+ | Approve/reject with admin notes |

### Messages Module (`/api/messages` + WebSocket `/messages`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `GET /admins` | Public | List of ADMIN/SUPER_ADMIN users |
| `GET /conversations` | USER+ | User's conversation summaries |
| `GET /with/:adminId` | USER+ | Messages with specific admin (marks admin msgs read) |
| `POST /to/:adminId` | USER+ | Send message to admin |
| `GET /unread-count` | USER+ | Unread message count |
| `GET /admin/conversations` | ADMIN+ | All user conversation summaries |
| `GET /admin/:userId` | ADMIN+ | Messages with specific user (marks user msgs read) |
| `POST /admin/:userId` | ADMIN+ | Send message to user |

**Socket.IO Gateway:** Namespace `/messages`, JWT-authenticated on connect. Users join room `user:{userId}`. Typing indicators emit to target user's room. Real-time delivery of new messages.

### Upload Module (`/api/upload`)

| Endpoint | Type | Folder |
|----------|------|--------|
| `POST /image` | Image | `bayit/properties` |
| `POST /video` | Video | `bayit/videos` |
| `POST /document` | Document (PDF etc) | `bayit/documents` |
| `POST /receipt` | Image/PDF | `bayit/receipts` |
| `POST /chat/image` | Image | `bayit/chat` |
| `POST /chat/video` | Video | `bayit/chat` |
| `POST /chat/voice` | Audio | `bayit/chat/voice` |
| `POST /chat/document` | Document | `bayit/chat/docs` |

All uploads use Cloudinary `upload_stream` via Multer `memoryStorage`.

### Notifications Module (`/api/notifications`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `GET /` | USER+ | All user notifications |
| `PATCH /:id/read` | USER+ | Mark one as read |
| `PATCH /read-all` | USER+ | Mark all as read |
| `GET /unread-count` | USER+ | Count of unread |

**Notification types:** `INSPECTION_BOOKED`, `INSPECTION_APPROVED`, `INSPECTION_REJECTED`, `RESERVATION_CREATED`, `RESERVATION_APPROVED`, `RESERVATION_REJECTED`, `PAYMENT_SUBMITTED`, `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `NEW_MESSAGE`, `ADMIN_ALERT`

> **Note:** Notification creation is not yet automatically triggered by service events. It needs to be wired up in each service when status changes occur.

### Users Module (`/api/users`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `GET /saved` | USER+ | Saved properties |
| `PATCH /saved/:propertyId/toggle` | USER+ | Toggle save/unsave |
| `GET /admin` | ADMIN+ | All users list |

### Payment Settings Module (`/api/payment-settings`)

| Endpoint | Access | Description |
|----------|--------|-------------|
| `GET /` | Public | Get current bank details |
| `PUT /` | ADMIN+ | Update bank details |

---

## 8. Frontend Pages & Components

### Public Pages

#### Homepage (`app/page.tsx`)
- Hero section with search CTA
- Featured properties grid (pulls from `/api/properties/featured`)
- Platform features/value propositions section
- Navbar and Footer

#### Properties Listing (`app/(public)/properties/page.tsx`)
- Filter bar: type, status, state/city, price range, bedrooms
- Paginated property grid using `PropertyCard`
- URL-synced filters (query params)

#### Property Detail (`app/(public)/properties/[id]/page.tsx`)
- `PropertyGallery` — auto-rotating carousel (4s interval), thumbnails
- Status badge + property type badge
- Specs grid (bedrooms, bathrooms, toilets, parking, floor area, land size, year built)
- Full description
- Amenities badges with emoji
- Documents list (linked to Cloudinary URLs)
- Available inspection slots with capacity bar
- Google Maps link (lat/lng)
- Sticky action sidebar: Book Inspection, Reserve Property, Chat with Agent

#### Inspection Booking Flow (`app/(public)/inspection/[propertyId]/page.tsx` + `InspectionBookingFlow.tsx`)

Three-step multi-state component:

**Step 1 — Disclaimer**
- ₦10,000 fee notice in amber highlight box
- 6 numbered terms (non-refundable, logistics, rebooking, capacity, ID, availability)
- 15-second countdown timer (disabled "Continue" button)
- Checkbox: "I have read and understand the inspection terms"
- Continue button activates only after timer expires AND checkbox is checked

**Step 2 — Booking Form**
- Full Name, Email, Phone inputs
- Available slot list with capacity bars and "Filling fast!" warnings (>70% booked)
- Date formatted in Nigerian locale (e.g., "Wednesday, 18 June 2025")
- Progress step indicator (Terms → Details → Payment)

**Step 3 — Payment**
- Booking summary (property, date, time, fee)
- Toggle between Bank Transfer and Pay with Card (Paystack placeholder)
- Bank Transfer: shows bank details from payment settings (with copy button), payment reference input (required), receipt upload (required)
- Submit creates booking with `paymentReference` + `receiptUrl`

**Success Screen**
- Ticket number display, date/time confirmation
- "Pending Review" status notice
- Links to dashboard and property listing

### Auth Pages

#### Login (`app/login/page.tsx`)
- Email + password form
- Admin users are redirected to `/admin`, regular users to `/dashboard`
- Tokens stored in `localStorage`

#### Register (`app/register/page.tsx`)
- Name, email, phone (optional), password, confirm password
- Client-side validation (password match, min 8 chars)
- Redirects to `/dashboard` on success

### User Dashboard

#### Dashboard Overview (`app/dashboard/page.tsx`)
- Stats row (inspection count, reservation count, transaction count, saved count)
- Active Reservations section (approved, with expiry date)
- Recent Inspections (last 3, with status indicator)
- Pending Transactions (amber warning row)
- Nav cards grid (Inspections, Messages, Saved, Notifications — with unread badges)
- Fetches all data in parallel on mount; redirects to `/login` if no token

#### My Inspections (`app/dashboard/inspections/page.tsx`)
- All bookings with status badge, ticket number, date/time, admin notes
- Receipt view link if `receiptUrl` exists

#### Messages — Conversations List (`app/dashboard/messages/page.tsx`)
- "Recent" conversations sorted by last message time, with unread count badges
- "Start New Chat" section showing admins not yet messaged
- Relative timestamps (Xm, Xh, date)

#### Messages — Chat (`app/dashboard/messages/[adminId]/page.tsx`)
- Full-height chat layout (header + scrollable messages + fixed input)
- Date separators grouping messages by day
- Sent messages right-aligned (teal bubble), received messages left-aligned (white bubble)
- Image and document support (upload via Cloudinary before sending)
- Enter to send, Shift+Enter for newline
- Image picker + file attachment buttons

#### Saved Properties (`app/dashboard/saved/page.tsx`)
- Card list with thumbnail, status badge, price, bedroom/bath specs
- Unsave button (red heart fill)
- Link to property detail

#### Notifications (`app/dashboard/notifications/page.tsx`)
- Unread notifications with teal dot indicator
- "Mark all read" button
- Click individual notification to mark read
- Relative timestamps

### Admin Panel

#### Admin Layout (`app/admin/layout.tsx`)
- Fixed left sidebar (desktop) with full navigation
- Mobile: hamburger → slide-in overlay sidebar
- Logout button clears `bayit_admin_token`
- Redirect to `/login` if no admin token

#### Admin Dashboard (`app/admin/page.tsx`)
- Stats cards (inspections, reservations, transactions, users) with pending counts
- Quick Actions list (add property, review inspections, manage reservations, etc.)

#### Admin Properties (`app/admin/properties/page.tsx`)
- List of all properties with thumbnail, status, type, featured badge, price
- Search by name or city
- Edit and Delete actions
- Link to add new property

#### Property Create/Edit (`components/admin/PropertyForm.tsx`)
- **Basic Info:** title, description, type, status, price (in Naira — converted to kobo on save), featured toggle
- **Location:** state, city, area, address, latitude, longitude
- **Specifications:** bedrooms, bathrooms, toilets, parking spaces, floor area, land size, year built
- **Amenities:** toggle button grid
- **Media:** multi-image upload (Cloudinary), cover image selector (click to set), video upload
- **After save:** Inspection slot form (date, time, max visitors, fee) and document upload form appear

#### Admin Inspections (`app/admin/inspections/page.tsx`)
- Filter by status
- Each booking shows property, visitor name/contact, date/time, ticket, receipt link
- Status action buttons (Mark APPROVED, COMPLETED, CANCELLED) + optional admin notes input

#### Admin Reservations (`app/admin/reservations/page.tsx`)
- Filter by status
- Shows buyer details, deposit amount, reserved-until date
- Approve/Reject buttons on PENDING reservations

#### Admin Transactions (`app/admin/transactions/page.tsx`)
- Filter by status
- Shows user details, amount, payment reference, receipt link
- Approve/Reject buttons with admin notes on PENDING transactions

#### Admin Messages (`app/admin/messages/page.tsx` + `[userId]/page.tsx`)
- Conversation list showing user name, email, phone, last message, unread count
- Chat UI with navy bubbles (admin) vs white bubbles (user)
- Same file/image sending capability as user chat

#### Admin Users (`app/admin/users/page.tsx`)
- Searchable user directory
- Role badges (USER, AGENT, ADMIN, SUPER_ADMIN)
- Direct "Message" link to open chat

#### Admin Settings (`app/admin/settings/page.tsx`)
- Bank Name, Account Name, Account Number, Instructions
- Persisted to `payment_settings` table
- These details are shown to users in the inspection payment flow

### Reusable Components

#### `PropertyCard`
- Cover image, status badge, type tag, title, location, price, bedroom/bath specs
- Saved toggle button (heart icon) — calls toggle API
- Link to property detail

#### `PropertyGallery`
- Auto-rotates every 4 seconds
- Supports images and videos in same carousel
- Previous/Next arrows
- Thumbnail strip
- Resets timer on manual navigation

#### `ReserveButton`
- Opens modal with property title + calculated deposit display
- Collects buyer name (required), phone (required), email (optional)
- On success: shows confirmation and redirects to dashboard

#### `Navbar` / `Footer`
- Navbar: logo, main nav links (Properties, About), Login/Register or Dashboard links
- Footer: logo, links, copyright

---

## 9. API Reference

### Base URL

```
http://localhost:3001
```

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

### Price Encoding

All prices in request bodies are in **Naira** (whole numbers). The frontend `PropertyForm` converts `price * 100` to get kobo before sending. All prices in API responses are returned as **strings** (BigInt kobo). Use `formatPrice(koboString)` from `utils.ts` to display:

```
₦1,000,000 kobo → "₦10,000"
₦75,000,000,000 kobo → "₦750M"
₦1,500,000,000,000 kobo → "₦15B"
```

### `formatPrice` logic (`lib/utils.ts`)

```typescript
// Converts kobo string → Naira display
// 100_000_000 kobo = ₦1,000,000 = "₦1M"
// 1_500_000_000 kobo = ₦15,000,000 = "₦15M"
// 150_000_000_000 kobo = ₦1.5B
```

### Token Storage

```typescript
// User
localStorage.setItem("bayit_token", token);
localStorage.setItem("bayit_user", JSON.stringify(user));

// Admin
localStorage.setItem("bayit_admin_token", token);
localStorage.setItem("bayit_admin_user", JSON.stringify(user));
```

---

## 10. Feature Implementation Status

### Backend — Fully Implemented ✅

| Module | Status |
|--------|--------|
| Auth (register, login, /me, JWT) | ✅ Complete |
| Properties CRUD | ✅ Complete |
| Property filters (type, status, city, state, price, bedrooms, search) | ✅ Complete |
| Property documents | ✅ Complete |
| Inspection slots with capacity tracking | ✅ Complete |
| Inspection booking (with ticket generation) | ✅ Complete |
| Inspection admin review | ✅ Complete |
| Reservation create (10% deposit) | ✅ Complete |
| Reservation approve/reject (14-day window, property status sync) | ✅ Complete |
| Transaction submit + admin review | ✅ Complete |
| Cloudinary upload (8 endpoint types) | ✅ Complete |
| Real-time messaging (REST + Socket.IO) | ✅ Complete |
| Read receipts for messages | ✅ Complete |
| Notification model + CRUD endpoints | ✅ Complete |
| Saved properties (toggle) | ✅ Complete |
| Payment settings CRUD | ✅ Complete |
| Admin user list | ✅ Complete |
| Global JWT + Roles guards | ✅ Complete |
| BigInt serialization | ✅ Complete |

### Backend — Not Yet Implemented ❌

| Feature | Notes |
|---------|-------|
| Auto-create notifications on service events | Need to inject `NotificationsService` into `InspectionsService`, `ReservationsService`, `TransactionsService` and call `create()` when statuses change |
| Paystack payment integration | Schema has `paystackRef` field; need Paystack SDK for inline payment webhook handling |
| Email notifications (Nodemailer) | Package installed; need `EmailService` module and wiring to service events |
| Password reset / forgot password | Nodemailer needed |
| Admin analytics/stats endpoint | Currently computed client-side by counting arrays |
| Rate limiting | Add `@nestjs/throttler` to sensitive endpoints |
| Input sanitization | Add `sanitize-html` or equivalent for text content |
| Refresh tokens | Currently JWT has 30-day expiry; no refresh mechanism |

### Frontend — Fully Implemented ✅

| Page/Component | Status |
|----------------|--------|
| Homepage / Landing page | ✅ Complete |
| Properties listing with filters | ✅ Complete |
| Property detail (gallery, specs, slots, sidebar) | ✅ Complete |
| Inspection booking flow (3 steps + success) | ✅ Complete |
| Login page | ✅ Complete |
| Register page | ✅ Complete |
| User dashboard overview | ✅ Complete |
| My Inspections page | ✅ Complete |
| My Saved Properties page | ✅ Complete |
| Notifications page | ✅ Complete |
| User Messages (conversations list) | ✅ Complete |
| User Chat page (with file upload) | ✅ Complete |
| Admin sidebar layout | ✅ Complete |
| Admin dashboard (stats + quick links) | ✅ Complete |
| Admin Properties list | ✅ Complete |
| Admin Property create form | ✅ Complete |
| Admin Property edit form | ✅ Complete |
| Admin Inspections review | ✅ Complete |
| Admin Reservations review | ✅ Complete |
| Admin Transactions review | ✅ Complete |
| Admin Messages (conversations + chat) | ✅ Complete |
| Admin Users list | ✅ Complete |
| Admin Payment Settings | ✅ Complete |
| `PropertyCard` component | ✅ Complete |
| `PropertyGallery` component | ✅ Complete |
| `PropertiesFilters` component | ✅ Complete |
| `ReserveButton` component | ✅ Complete |
| `PropertyForm` admin component | ✅ Complete |
| `InspectionBookingFlow` component | ✅ Complete |
| Navbar + Footer | ✅ Complete |
| `lib/api.ts` (all API calls) | ✅ Complete |
| `lib/types.ts` (all TypeScript types) | ✅ Complete |
| `lib/utils.ts` (formatPrice, labels) | ✅ Complete |
| Design system (Tailwind tokens) | ✅ Complete |

### Frontend — Not Yet Implemented ❌

| Feature | Notes |
|---------|-------|
| Real-time Socket.IO in chat | Currently polling on page load; need `useTypingWs` hook + socket connection |
| Typing indicators | Hook `hooks/useTypingWs.ts` directory exists but file not written |
| Paystack inline payment | Paystack method is a placeholder button in `InspectionBookingFlow` |
| User dashboard — Transactions page | No dedicated page at `/dashboard/transactions` yet |
| User dashboard — Reservations page | No dedicated `/dashboard/reservations` page; data shown on overview only |
| Save property button in property detail | `PropertyCard` has it; property detail page does not |
| Admin property detail view (`/admin/properties/[id]`) | Only list + edit exist |
| Image upload in chat (voice messages) | Voice recording UI not implemented |
| Admin notifications | No `/admin/notifications` page or real-time badge in admin sidebar |
| Admin unread message badge in sidebar | Sidebar always shows "Messages" without unread count |
| Error boundary / 404 pages | No custom `not-found.tsx` or `error.tsx` |
| Loading skeletons | All loading states are simple spinners |
| SEO metadata | No `generateMetadata` on public pages |
| `hooks/` directory | `useTypingWs.ts` and `useAuth.ts` not written |

---

## 11. Pending Work

This is the prioritized backlog of remaining implementation work.

### Priority 1 — Correctness / Core UX

1. **Auto-trigger notifications** — Wire `NotificationsService` into inspection, reservation, and transaction services so users get notified when their status changes.

2. **Real-time chat (Socket.IO client)** — Write `hooks/useTypingWs.ts` and integrate socket connection into the user and admin chat pages so messages arrive without page refresh.

3. **User dashboard sub-pages** — Add `/dashboard/reservations` and `/dashboard/transactions` dedicated pages (currently data is only on the overview).

4. **Save property button on property detail** — The detail page sidebar is missing the heart/save toggle that `PropertyCard` has.

### Priority 2 — Missing Backend Wiring

5. **Notification auto-creation** — In `inspections.service.ts`, `reservations.service.ts`, and `transactions.service.ts`, inject and call `NotificationsService.create()` on every status change.

6. **Paystack webhooks** — Add `POST /api/payments/webhook` endpoint to handle Paystack `charge.success` events and auto-approve inspections/transactions.

7. **Email service** — Create `src/modules/email/email.module.ts` using Nodemailer (SMTP credentials in `.env`) and send emails on booking confirmation, approval, and rejection.

### Priority 3 — Polish

8. **Admin sidebar unread badge** — Fetch unread message count on admin layout mount and show a badge on the Messages nav link.

9. **Loading skeletons** — Replace spinner-only loading states with skeleton UI for property cards and dashboard sections.

10. **Error boundary pages** — Add `app/not-found.tsx` and `app/error.tsx`.

11. **SEO metadata** — Add `generateMetadata()` on property detail and listing pages.

12. **`hooks/useTypingWs.ts`** — Socket.IO hook for typing indicators.

13. **Voice messages** — Add voice recording to chat pages (using `MediaRecorder` API + `uploadChatVoice`).

---

## 12. Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bayit"

# JWT
JWT_SECRET="your-very-long-random-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Nodemailer (optional — for email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@email.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@bayit.com"

# Paystack (optional — for card payments)
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."

# App
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

---

## 13. Running the Project

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- A Cloudinary account (free tier works for development)

### Backend Setup

```bash
cd /home/iceking/bayit/backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate
# Or push schema without migration history:
npm run prisma:push

# Start in development mode
npm run start:dev
```

The API will be available at `http://localhost:3001`.

### Frontend Setup

```bash
cd /home/iceking/bayit/frontend

# Install dependencies
npm install

# Set up environment
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local

# Start in development mode
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Creating the First Admin User

There is no admin creation UI. After the backend is running, use Prisma Studio or a direct DB query to promote a user:

```bash
# Option A: Prisma Studio
cd /home/iceking/bayit/backend && npm run prisma:studio

# Option B: psql
psql $DATABASE_URL -c "UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@bayit.com';"
```

Or register normally via the frontend, then update the role in the database.

---

*This document reflects the state of the project as of 2026-06-15.*
