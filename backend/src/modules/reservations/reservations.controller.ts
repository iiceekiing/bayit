import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ReservationStatus } from '@prisma/client';

@Controller('api/reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private service: ReservationsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body()
    dto: {
      propertyId: string;
      buyerName: string;
      buyerPhone: string;
      buyerEmail?: string;
      notes?: string;
    },
  ) {
    return this.service.create(user.id, dto);
  }

  @Get('mine')
  myReservations(@CurrentUser() user: any) {
    return this.service.myReservations(user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin')
  adminGetAll(@Query('status') status?: ReservationStatus) {
    return this.service.adminGetAll({ status });
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/:id/status')
  adminUpdateStatus(
    @Param('id') id: string,
    @Body('status') status: ReservationStatus,
  ) {
    return this.service.adminUpdateStatus(id, status);
  }
}
