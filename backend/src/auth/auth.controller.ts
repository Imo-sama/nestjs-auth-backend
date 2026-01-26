import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSimpleDto } from './dto/update-simple.dto';
import { Enable2FADto, Verify2FADto, Disable2FADto, LoginWith2FADto } from './dto/two-factor.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginWith2FADto) {
    return this.auth.login(dto.email, dto.password, dto.twoFactorCode);
  }

  @Get('users')
  getAllUsers() {
    return this.users.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return (req as any).user;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@Req() req: Request) {
    const userId = (req as any).user.userId;
    await this.auth.deleteAccount(userId);
    return { message: 'Account deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account/:id')
  async deleteAccountById(@Param('id') id: string) {
    await this.auth.deleteAccount(id);
    return { message: `Account ${id} deleted successfully` };
  }

  @Delete('delete')
  async deleteByCredentials(@Body() dto: LoginDto) {
    return this.auth.deleteAccountByCredentials(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Put('account')
  async updateAccount(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const userId = (req as any).user.userId;
    return this.auth.updateAccount(userId, dto.email, dto.password);
  }

  @Put('update')
  async updateByCredentials(@Body() dto: UpdateSimpleDto) {
    return this.auth.updateAccountByCredentials(
      dto.currentEmail,
      dto.currentPassword,
      dto.newEmail,
      dto.newPassword,
    );
  }

  @Post('2fa/enable')
  async enable2FA(@Body() dto: Enable2FADto) {
    return this.auth.enable2FA(dto.email, dto.password);
  }

  @Post('2fa/verify')
  async verify2FA(@Body() dto: Verify2FADto) {
    return this.auth.verify2FA(dto.email, dto.code);
  }

  @Post('2fa/disable')
  async disable2FA(@Body() dto: Disable2FADto) {
    return this.auth.disable2FA(dto.email, dto.password, dto.code);
  }
}

