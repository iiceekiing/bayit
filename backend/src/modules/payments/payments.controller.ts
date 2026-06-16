import {
  Controller,
  Post,
  Headers,
  Body,
  RawBodyRequest,
  Req,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@Controller('api/payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private prisma: PrismaService) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handlePaystackWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() body: any,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (secret) {
      const rawBody = (req as any).rawBody as Buffer | undefined;
      const payload = rawBody ? rawBody.toString() : JSON.stringify(body);
      const expected = createHmac('sha512', secret).update(payload).digest('hex');
      if (signature !== expected) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    if (body?.event !== 'charge.success') {
      return { received: true };
    }

    const reference: string = body?.data?.reference;
    if (!reference) return { received: true };

    const amount: number = body?.data?.amount ?? 0;

    // Check inspection booking first
    const booking = await this.prisma.inspectionBooking.findFirst({
      where: { paymentReference: reference },
    });

    if (booking) {
      if (booking.status !== 'PAID') {
        await this.prisma.inspectionBooking.update({
          where: { id: booking.id },
          data: { status: 'PAID' },
        });
        this.logger.log(`Inspection booking ${booking.id} marked PAID via Paystack ref ${reference}`);
      }
      return { received: true };
    }

    // Check transaction
    const tx = await this.prisma.transaction.findFirst({
      where: { paymentReference: reference },
    });

    if (tx) {
      if (tx.status === 'PENDING') {
        await this.prisma.transaction.update({
          where: { id: tx.id },
          data: { status: 'PENDING', amount: BigInt(amount) },
        });
        this.logger.log(`Transaction ${tx.id} payment confirmed via Paystack ref ${reference}`);
      }
      return { received: true };
    }

    // Create new transaction record if no existing record found
    this.logger.warn(`No record found for Paystack reference ${reference}`);
    return { received: true };
  }
}
