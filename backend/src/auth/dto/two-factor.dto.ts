import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class Enable2FADto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class Verify2FADto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  code: string;
}

export class Disable2FADto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  code: string;
}

export class LoginWith2FADto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  twoFactorCode?: string;
}
