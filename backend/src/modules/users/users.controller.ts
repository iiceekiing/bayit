import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const { password, ...safe } = await this.prisma.user.findUnique({ where: { id: user.id } });
    return safe;
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: any, @Body() dto: { name?: string; phone?: string }) {
    const updated = await this.prisma.user.update({ where: { id: user.id }, data: dto });
    const { password, ...safe } = updated;
    return safe;
  }

  // Saved properties
  @Get('saved')
  async getSaved(@CurrentUser() user: any) {
    const saved = await this.prisma.savedProperty.findMany({
      where: { userId: user.id },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
    return saved.map((s) => ({
      ...s,
      property: { ...s.property, price: s.property.price?.toString() },
    }));
  }

  @Patch('saved/:propertyId/toggle')
  async toggleSaved(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    const existing = await this.prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    });
    if (existing) {
      await this.prisma.savedProperty.delete({ where: { id: existing.id } });
      return { saved: false };
    }
    await this.prisma.savedProperty.create({ data: { userId: user.id, propertyId } });
    return { saved: true };
  }

  // Admin: manage users
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin')
  async adminGetAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch('admin/:id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete('admin/:id')
  async deleteUser(@Param('id') id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}
