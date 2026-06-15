import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string | null,
    dto: {
      propertyId: string;
      buyerName: string;
      buyerPhone: string;
      buyerEmail?: string;
      notes?: string;
    },
  ) {
    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.status === 'SOLD') throw new BadRequestException('Property is already sold');

    const DEPOSIT = BigInt(property.price / BigInt(10)); // 10% deposit

    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        propertyId: dto.propertyId,
        buyerName: dto.buyerName,
        buyerPhone: dto.buyerPhone,
        buyerEmail: dto.buyerEmail,
        notes: dto.notes,
        depositAmount: DEPOSIT,
      },
      include: { property: true },
    });

    return this.serialize(reservation);
  }

  async myReservations(userId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
    return reservations.map((r) => this.serialize(r));
  }

  async adminGetAll(filters: { status?: ReservationStatus }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const reservations = await this.prisma.reservation.findMany({
      where,
      include: { property: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return reservations.map((r) => this.serialize(r));
  }

  async adminUpdateStatus(id: string, status: ReservationStatus) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const data: any = { status };

    if (status === 'APPROVED') {
      data.depositPaid = true;
      data.reservedUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
      // Mark property as reserved
      if (reservation.propertyId) {
        await this.prisma.property.update({
          where: { id: reservation.propertyId },
          data: { status: 'RESERVED' },
        });
      }
    } else if (status === 'REJECTED' && reservation.propertyId) {
      const prop = await this.prisma.property.findUnique({ where: { id: reservation.propertyId } });
      if (prop?.status === 'RESERVED') {
        await this.prisma.property.update({
          where: { id: reservation.propertyId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data,
      include: { property: true },
    });
    return this.serialize(updated);
  }

  private serialize(r: any) {
    return {
      ...r,
      depositAmount: r.depositAmount?.toString(),
      property: r.property
        ? { ...r.property, price: r.property.price?.toString() }
        : undefined,
    };
  }
}
