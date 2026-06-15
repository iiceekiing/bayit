import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    dto: {
      propertyId: string;
      amount: number;
      paymentReference?: string;
      receiptUrl?: string;
    },
  ) {
    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        propertyId: dto.propertyId,
        amount: BigInt(dto.amount),
        paymentReference: dto.paymentReference,
        receiptUrl: dto.receiptUrl,
      },
      include: { property: true },
    });
    return this.serialize(tx);
  }

  async myTransactions(userId: string) {
    const txs = await this.prisma.transaction.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
    return txs.map((t) => this.serialize(t));
  }

  async adminGetAll() {
    const txs = await this.prisma.transaction.findMany({
      include: {
        property: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return txs.map((t) => this.serialize(t));
  }

  async adminUpdate(id: string, status: TransactionStatus, adminNotes?: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('Transaction not found');

    if (status === 'APPROVED' && tx.propertyId) {
      await this.prisma.property.update({
        where: { id: tx.propertyId },
        data: { status: 'SOLD' },
      });
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: { status, adminNotes },
      include: { property: true },
    });
    return this.serialize(updated);
  }

  private serialize(t: any) {
    return {
      ...t,
      amount: t.amount?.toString(),
      property: t.property ? { ...t.property, price: t.property.price?.toString() } : undefined,
    };
  }
}
