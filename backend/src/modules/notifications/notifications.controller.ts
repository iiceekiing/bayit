import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getMyNotifications(@CurrentUser() user: any) {
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Patch(':id/read')
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { ok: true };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: any) {
    await this.prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return { ok: true };
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: any) {
    const count = await this.prisma.notification.count({
      where: { userId: user.id, read: false },
    });
    return { count };
  }
}
