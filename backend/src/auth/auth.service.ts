import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly twoFactor: TwoFactorService,
  ) {}

  async signup(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.users.create(email, hashed);

    return this.issueToken(user.id, user.email);
  }

  async login(email: string, password: string, twoFactorCode?: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        throw new UnauthorizedException('2FA code required');
      }
      const isValid = await this.twoFactor.verifyToken(twoFactorCode, user.twoFactorSecret!);
      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    return this.issueToken(user.id, user.email);
  }

  async deleteAccount(userId: string) {
    await this.users.delete(userId);
  }

  async deleteAccountByCredentials(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.users.delete(user.id);
    return { message: 'Account deleted successfully', email: user.email };
  }

  async updateAccount(userId: string, email?: string, password?: string) {
    const updateData: { email?: string; password?: string } = {};

    if (email) {
      const existing = await this.users.findByEmail(email);
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await this.users.update(userId, updateData);
    return {
      message: 'Account updated successfully',
      user: { id: updated.id, email: updated.email },
    };
  }

  async updateAccountByCredentials(
    currentEmail: string,
    currentPassword: string,
    newEmail?: string,
    newPassword?: string,
  ) {
    // Verify current credentials
    const user = await this.users.findByEmail(currentEmail);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Prepare update data
    const updateData: { email?: string; password?: string } = {};

    if (newEmail) {
      const existing = await this.users.findByEmail(newEmail);
      if (existing && existing.id !== user.id) {
        throw new BadRequestException('Email already in use');
      }
      updateData.email = newEmail;
    }

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await this.users.update(user.id, updateData);
    return {
      message: 'Account updated successfully',
      user: { id: updated.id, email: updated.email },
    };
  }

  async enable2FA(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const secret = this.twoFactor.generateSecret();
    const qrCode = await this.twoFactor.generateQRCode(email, secret);

    await this.users.updateTwoFactor(user.id, secret, false);

    return {
      message: '2FA secret generated. Scan QR code with Google Authenticator',
      secret,
      qrCode,
    };
  }

  async verify2FA(email: string, code: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not set up for this account');
    }

    const isValid = await this.twoFactor.verifyToken(code, user.twoFactorSecret);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.users.updateTwoFactor(user.id, user.twoFactorSecret, true);

    return {
      message: '2FA enabled successfully',
    };
  }

  async disable2FA(email: string, password: string, code: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    const isValid = await this.twoFactor.verifyToken(code, user.twoFactorSecret);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.users.updateTwoFactor(user.id, null, false);

    return {
      message: '2FA disabled successfully',
    };
  }

  private issueToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: userId, email },
    };
  }
}

