import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/payment-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentSettingsController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  async get() {
    const settings = await this.prisma.paymentSettings.findFirst();
    if (!settings) {
      return {
        bankName: 'First Bank Nigeria',
        accountName: 'Bayit Properties Ltd',
        accountNumber: '0000000000',
        instructions: 'Transfer the exact amount and use your name as narration.',
        updatedAt: new Date().toISOString(),
      };
    }
    return settings;
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put()
  async update(
    @CurrentUser() user: any,
    @Body()
    dto: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      instructions?: string;
    },
  ) {
    const existing = await this.prisma.paymentSettings.findFirst();
    if (existing) {
      return this.prisma.paymentSettings.update({
        where: { id: existing.id },
        data: { ...dto, updatedBy: user.id },
      });
    }
    return this.prisma.paymentSettings.create({
      data: { ...dto, updatedBy: user.id },
    });
  }
}
