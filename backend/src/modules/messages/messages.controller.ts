import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Public()
  @Get('admins')
  getAdmins() {
    return this.service.getAdmins();
  }

  // User side
  @Get('conversations')
  userConversationList(@CurrentUser() user: any) {
    return this.service.userConversationList(user.id);
  }

  @Get('with/:adminId')
  userConversation(@CurrentUser() user: any, @Param('adminId') adminId: string) {
    return this.service.userConversation(user.id, adminId);
  }

  @Post('to/:adminId')
  sendToAdmin(
    @CurrentUser() user: any,
    @Param('adminId') adminId: string,
    @Body() dto: any,
  ) {
    return this.service.sendToAdmin(user.id, adminId, dto);
  }

  @Get('unread-count')
  userUnread(@CurrentUser() user: any) {
    return this.service.getUserUnreadCount(user.id);
  }

  // Admin side
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/conversations')
  adminConversationList() {
    return this.service.adminConversationList();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/:userId')
  adminConversation(@CurrentUser() admin: any, @Param('userId') userId: string) {
    return this.service.adminConversation(userId, admin.id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/:userId')
  adminSend(
    @CurrentUser() admin: any,
    @Param('userId') userId: string,
    @Body() dto: any,
  ) {
    return this.service.adminSend(admin.id, userId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/unread-count/all')
  adminUnread() {
    return this.service.adminUnreadCount();
  }
}
