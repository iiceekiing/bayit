import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {}

  async create(
    userId: string,
    dto: {
      propertyId: string;
      amount: number;
      paymentReference?: string;
      receiptUrl?: string;
    },
  ) {
    const [property, user] = await Promise.all([
      this.prisma.property.findUnique({ where: { id: dto.propertyId } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
    ]);

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

    const propertyTitle = property?.title ?? 'the property';
    const amountNaira = dto.amount / 100;
    await this.notifications.create(
      userId,
      'PAYMENT_SUBMITTED',
      'Payment Submitted',
      `Your payment of ₦${amountNaira.toLocaleString()} for ${propertyTitle} has been submitted and is pending admin review.`,
    );

    if (user?.email) {
      await this.email.sendPaymentSubmitted(user.email, user.name ?? 'Customer', propertyTitle, `₦${amountNaira.toLocaleString()}`);
    }

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
    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: { property: true, user: { select: { email: true, name: true } } },
    });
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

    const propertyTitle = tx.property?.title ?? 'the property';
    const amountNaira = Number(tx.amount) / 100;

    if (status === 'APPROVED') {
      await this.notifications.create(
        tx.userId,
        'PAYMENT_APPROVED',
        'Payment Approved',
        `Your payment of ₦${amountNaira.toLocaleString()} for ${propertyTitle} has been approved. Congratulations on your purchase!`,
      );
      if (tx.user?.email) {
        await this.email.sendPaymentApproved(tx.user.email, tx.user.name ?? 'Customer', propertyTitle, `₦${amountNaira.toLocaleString()}`);
      }
    } else if (status === 'REJECTED') {
      await this.notifications.create(
        tx.userId,
        'PAYMENT_REJECTED',
        'Payment Rejected',
        `Your payment for ${propertyTitle} has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''} Please resubmit with the correct details.`,
      );
    }

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
