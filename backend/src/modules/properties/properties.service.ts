import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PropertyStatus, PropertyType, Prisma } from '@prisma/client';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
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
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {};
    if (query.type) where.propertyType = query.type;
    if (query.status) where.status = query.status;
    if (query.state) where.state = { contains: query.state, mode: 'insensitive' };
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.featured) where.isFeatured = true;
    if (query.bedrooms) where.bedrooms = { gte: query.bedrooms };
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = BigInt(query.minPrice);
      if (query.maxPrice) where.price.lte = BigInt(query.maxPrice);
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { area: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          inspectionSlots: {
            where: { isActive: true },
            include: { _count: { select: { bookings: true } } },
          },
          _count: { select: { reservations: true, savedBy: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      properties: properties.map((p) => this.serialize(p)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findFeatured() {
    const props = await this.prisma.property.findMany({
      where: { isFeatured: true, status: 'AVAILABLE' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { inspectionSlots: true } } },
    });
    return props.map((p) => this.serialize(p));
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        documents: true,
        inspectionSlots: {
          where: { isActive: true },
          include: { _count: { select: { bookings: true } } },
          orderBy: { date: 'asc' },
        },
        _count: { select: { reservations: true, savedBy: true } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    return this.serialize(property);
  }

  async create(dto: CreatePropertyDto) {
    const { inspectionSlots, price, amenities, ...rest } = dto;
    const property = await this.prisma.property.create({
      data: {
        ...rest,
        price: BigInt(price),
        amenities: amenities ?? [],
        inspectionSlots: inspectionSlots
          ? {
              create: inspectionSlots.map((s) => ({
                date: new Date(s.date),
                time: s.time,
                maxVisitors: s.maxVisitors ?? 10,
                fee: BigInt(s.fee ?? 1000000),
              })),
            }
          : undefined,
      },
      include: { inspectionSlots: true, documents: true },
    });
    return this.serialize(property);
  }

  async update(id: string, dto: Partial<CreatePropertyDto>) {
    await this.findOne(id);
    const { price, amenities, inspectionSlots, ...rest } = dto;
    const property = await this.prisma.property.update({
      where: { id },
      data: {
        ...rest,
        ...(price !== undefined && { price: BigInt(price) }),
        ...(amenities !== undefined && { amenities }),
      },
      include: { inspectionSlots: true, documents: true },
    });
    return this.serialize(property);
  }

  async updateStatus(id: string, status: PropertyStatus) {
    const property = await this.prisma.property.update({
      where: { id },
      data: { status },
    });
    return this.serialize(property);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.property.delete({ where: { id } });
  }

  async addDocument(
    propertyId: string,
    doc: { type: string; name: string; url: string },
  ) {
    return this.prisma.propertyDocument.create({
      data: { propertyId, type: doc.type as any, name: doc.name, url: doc.url },
    });
  }

  async deleteDocument(docId: string) {
    return this.prisma.propertyDocument.delete({ where: { id: docId } });
  }

  async addInspectionSlot(
    propertyId: string,
    slot: { date: string; time: string; maxVisitors?: number; fee?: number },
  ) {
    return this.prisma.inspectionSlot.create({
      data: {
        propertyId,
        date: new Date(slot.date),
        time: slot.time,
        maxVisitors: slot.maxVisitors ?? 10,
        fee: BigInt(slot.fee ?? 1000000),
      },
    });
  }

  async getStates() {
    const props = await this.prisma.property.findMany({
      select: { state: true },
      distinct: ['state'],
    });
    return [...new Set(props.map((p) => p.state))].sort();
  }

  private serialize(p: any) {
    return {
      ...p,
      price: p.price?.toString(),
      inspectionSlots: p.inspectionSlots?.map((s: any) => ({
        ...s,
        fee: s.fee?.toString(),
        bookedCount: s._count?.bookings ?? 0,
        _count: undefined,
      })),
    };
  }
}
