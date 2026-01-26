import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(email: string, password: string) {
    return this.prisma.user.create({ data: { email, password } });
  }

  delete(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  update(userId: string, data: { email?: string; password?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  findById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        twoFactorEnabled: true,
        // Don't return password or twoFactorSecret
      },
    });
  }

  updateTwoFactor(userId: string, secret: string | null, enabled: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: enabled,
      },
    });
  }
}

