import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, InspectionStatus } from '@prisma/client';

@Controller('api/inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InspectionsController {
  constructor(private service: InspectionsService) {}

  @Post('book')
  book(
    @CurrentUser() user: any,
    @Body()
    dto: {
      slotId: string;
      fullName: string;
      email: string;
      phone: string;
      paymentReference?: string;
      receiptUrl?: string;
    },
  ) {
    return this.service.bookInspection(user.id, dto);
  }

  @Get('mine')
  myBookings(@CurrentUser() user: any) {
    return this.service.myBookings(user.id);
  }

  @Get('mine/:id')
  myBooking(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.myBookingById(user.id, id);
  }

  @Get('ticket/:id')
  getTicket(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.getBookingTicket(id, user.id);
  }

  @Public()
  @Get('slots/:propertyId')
  getSlots(@Param('propertyId') propertyId: string) {
    return this.service.getSlotsByProperty(propertyId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin')
  adminGetAll(
    @Query('status') status?: InspectionStatus,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.service.adminGetAll({ status, propertyId });
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/:id/status')
  adminUpdateStatus(
    @Param('id') id: string,
    @Body() body: { status: InspectionStatus; adminNotes?: string },
  ) {
    return this.service.adminUpdateStatus(id, body.status, body.adminNotes);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('slots/:id/disable')
  disableSlot(@Param('id') id: string) {
    return this.service.disableSlot(id);
  }
}
