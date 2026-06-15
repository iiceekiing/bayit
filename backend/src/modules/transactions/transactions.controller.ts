import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, TransactionStatus } from '@prisma/client';

@Controller('api/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body()
    dto: {
      propertyId: string;
      amount: number;
      paymentReference?: string;
      receiptUrl?: string;
    },
  ) {
    return this.service.create(user.id, dto);
  }

  @Get('mine')
  myTransactions(@CurrentUser() user: any) {
    return this.service.myTransactions(user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin')
  adminGetAll() {
    return this.service.adminGetAll();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/:id')
  adminUpdate(
    @Param('id') id: string,
    @Body() body: { status: TransactionStatus; adminNotes?: string },
  ) {
    return this.service.adminUpdate(id, body.status, body.adminNotes);
  }
}
