import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InspectionStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) {}

  // ── User: book an inspection slot ──────────────────────────────────────────

  async bookInspection(
    userId: string,
    dto: {
      slotId: string;
      fullName: string;
      email: string;
      phone: string;
      paymentReference?: string;
      receiptUrl?: string;
    },
  ) {
    const slot = await this.prisma.inspectionSlot.findUnique({
      where: { id: dto.slotId },
      include: { _count: { select: { bookings: true } }, property: true },
    });
    if (!slot) throw new NotFoundException('Inspection slot not found');
    if (!slot.isActive) throw new BadRequestException('Inspection slot is no longer available');

    const booked = slot._count.bookings;
    if (booked >= slot.maxVisitors) throw new BadRequestException('This inspection slot is fully booked');

    const existing = await this.prisma.inspectionBooking.findFirst({
      where: { userId, slotId: dto.slotId },
    });
    if (existing) throw new BadRequestException('You already have a booking for this slot');

    const ticketNumber = `INS-${uuid().slice(0, 8).toUpperCase()}`;

    const booking = await this.prisma.inspectionBooking.create({
      data: {
        userId,
        slotId: dto.slotId,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        ticketNumber,
        status: dto.paymentReference || dto.receiptUrl ? 'PAID' : 'PENDING',
        paymentReference: dto.paymentReference,
        receiptUrl: dto.receiptUrl,
      },
      include: { slot: { include: { property: true } } },
    });

    return this.serializeBooking(booking);
  }

  // ── User: my bookings ──────────────────────────────────────────────────────

  async myBookings(userId: string) {
    const bookings = await this.prisma.inspectionBooking.findMany({
      where: { userId },
      include: { slot: { include: { property: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => this.serializeBooking(b));
  }

  async myBookingById(userId: string, id: string) {
    const booking = await this.prisma.inspectionBooking.findFirst({
      where: { id, userId },
      include: { slot: { include: { property: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.serializeBooking(booking);
  }

  // ── Admin: all bookings ─────────────────────────────────────────────────────

  async adminGetAll(filters: { status?: InspectionStatus; propertyId?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.propertyId) where.slot = { propertyId: filters.propertyId };

    const bookings = await this.prisma.inspectionBooking.findMany({
      where,
      include: {
        slot: { include: { property: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => this.serializeBooking(b));
  }

  async adminUpdateStatus(id: string, status: InspectionStatus, adminNotes?: string) {
    const booking = await this.prisma.inspectionBooking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.inspectionBooking.update({
      where: { id },
      data: { status, adminNotes },
      include: { slot: { include: { property: true } } },
    });
  }

  // ── Slot management ─────────────────────────────────────────────────────────

  async getSlotsByProperty(propertyId: string) {
    const slots = await this.prisma.inspectionSlot.findMany({
      where: { propertyId, isActive: true },
      include: { _count: { select: { bookings: true } } },
      orderBy: { date: 'asc' },
    });
    return slots.map((s) => ({
      ...s,
      fee: s.fee.toString(),
      bookedCount: s._count.bookings,
      availableCount: s.maxVisitors - s._count.bookings,
      _count: undefined,
    }));
  }

  async disableSlot(slotId: string) {
    return this.prisma.inspectionSlot.update({
      where: { id: slotId },
      data: { isActive: false },
    });
  }

  // ── Receipt download ────────────────────────────────────────────────────────

  async getBookingTicket(id: string, userId: string) {
    const booking = await this.prisma.inspectionBooking.findFirst({
      where: { id, userId },
      include: { slot: { include: { property: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.serializeBooking(booking);
  }

  private serializeBooking(b: any) {
    return {
      ...b,
      slot: b.slot
        ? {
            ...b.slot,
            fee: b.slot.fee?.toString(),
            bookedCount: b.slot._count?.bookings,
            _count: undefined,
          }
        : undefined,
    };
  }
}
