import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  generateSecret() {
    const secret = speakeasy.generateSecret({
      name: 'Login App',
      length: 32,
    });
    return secret.base32;
  }

  async generateQRCode(email: string, secret: string): Promise<string> {
    const otpauth = speakeasy.otpauthURL({
      secret,
      label: email,
      issuer: 'Login App',
      encoding: 'base32',
    });
    return await QRCode.toDataURL(otpauth);
  }

  async verifyToken(token: string, secret: string): Promise<boolean> {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2,
      });
    } catch (error) {
      return false;
    }
  }
}
