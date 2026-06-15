import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(
    private service: MessagesService,
    private gateway: MessagesGateway,
  ) {}

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
  async sendToAdmin(
    @CurrentUser() user: any,
    @Param('adminId') adminId: string,
    @Body() dto: any,
  ) {
    const msg = await this.service.sendToAdmin(user.id, adminId, dto);
    // Emit real-time event to the admin recipient
    this.gateway.emitToUser(adminId, 'newMessage', { ...msg, fileSize: msg.fileSize?.toString() });
    return msg;
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
  async adminSend(
    @CurrentUser() admin: any,
    @Param('userId') userId: string,
    @Body() dto: any,
  ) {
    const msg = await this.service.adminSend(admin.id, userId, dto);
    // Emit real-time event to the user recipient
    this.gateway.emitToUser(userId, 'newMessage', { ...msg, fileSize: msg.fileSize?.toString() });
    return msg;
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/unread-count/all')
  adminUnread() {
    return this.service.adminUnreadCount();
  }
}
