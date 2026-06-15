import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageType } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // ── User sends to a specific admin ─────────────────────────────────────────
  async sendToAdmin(
    userId: string,
    adminId: string,
    dto: {
      content?: string;
      messageType?: MessageType;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    },
  ) {
    return this.prisma.message.create({
      data: {
        userId,
        adminId,
        content: dto.content,
        fromAdmin: false,
        messageType: dto.messageType ?? 'TEXT',
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize ? BigInt(dto.fileSize) : undefined,
        mimeType: dto.mimeType,
      },
    });
  }

  // ── User: get conversation with specific admin ─────────────────────────────
  async userConversation(userId: string, adminId: string) {
    const messages = await this.prisma.message.findMany({
      where: { userId, adminId },
      orderBy: { createdAt: 'asc' },
    });
    // Mark admin messages as read
    await this.prisma.message.updateMany({
      where: { userId, adminId, fromAdmin: true, read: false },
      data: { read: true },
    });
    return messages.map((m) => this.serialize(m));
  }

  // ── User: list all conversations ───────────────────────────────────────────
  async userConversationList(userId: string) {
    const adminIds = await this.prisma.message
      .findMany({
        where: { userId, adminId: { not: null } },
        select: { adminId: true },
        distinct: ['adminId'],
      })
      .then((rows) => rows.map((r) => r.adminId).filter(Boolean) as string[]);

    const summaries = await Promise.all(
      adminIds.map(async (adminId) => {
        const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!admin) return null;
        const last = await this.prisma.message.findFirst({
          where: { userId, adminId },
          orderBy: { createdAt: 'desc' },
        });
        const unread = await this.prisma.message.count({
          where: { userId, adminId, fromAdmin: true, read: false },
        });
        return {
          adminId,
          adminName: admin.name,
          lastMessage: last?.content ?? null,
          lastAt: last?.createdAt.toISOString() ?? null,
          unreadCount: unread,
        };
      }),
    );
    return summaries.filter(Boolean).sort((a, b) =>
      (b.lastAt ?? '').localeCompare(a.lastAt ?? ''),
    );
  }

  // ── Admin: get conversation with user ─────────────────────────────────────
  async adminConversation(userId: string, adminId: string) {
    const messages = await this.prisma.message.findMany({
      where: { userId, adminId },
      orderBy: { createdAt: 'asc' },
    });
    await this.prisma.message.updateMany({
      where: { userId, adminId, fromAdmin: false, read: false },
      data: { read: true },
    });
    return messages.map((m) => this.serialize(m));
  }

  // ── Admin: send to user ────────────────────────────────────────────────────
  async adminSend(
    adminId: string,
    userId: string,
    dto: {
      content?: string;
      messageType?: MessageType;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    },
  ) {
    return this.prisma.message.create({
      data: {
        userId,
        adminId,
        content: dto.content,
        fromAdmin: true,
        messageType: dto.messageType ?? 'TEXT',
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize ? BigInt(dto.fileSize) : undefined,
        mimeType: dto.mimeType,
      },
    });
  }

  // ── Admin: all conversations ───────────────────────────────────────────────
  async adminConversationList() {
    const userIds = await this.prisma.message
      .findMany({
        select: { userId: true },
        distinct: ['userId'],
      })
      .then((rows) => rows.map((r) => r.userId));

    const summaries = await Promise.all(
      userIds.map(async (userId) => {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return null;
        const last = await this.prisma.message.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        const unread = await this.prisma.message.count({
          where: { userId, fromAdmin: false, read: false },
        });
        return {
          userId,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          lastMessage: last?.content ?? null,
          lastAt: last?.createdAt.toISOString() ?? null,
          unreadCount: unread,
        };
      }),
    );
    return summaries.filter(Boolean).sort((a, b) =>
      (b.lastAt ?? '').localeCompare(a.lastAt ?? ''),
    );
  }

  async getAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: { id: true, name: true, role: true },
    });
    return admins.map((a) => ({ id: a.id, displayName: a.name, role: a.role }));
  }

  async getUserUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: { userId, fromAdmin: true, read: false },
    });
    return { count };
  }

  async adminUnreadCount() {
    const count = await this.prisma.message.count({
      where: { fromAdmin: false, read: false },
    });
    return { count };
  }

  private serialize(m: any) {
    return { ...m, fileSize: m.fileSize?.toString() };
  }
}
