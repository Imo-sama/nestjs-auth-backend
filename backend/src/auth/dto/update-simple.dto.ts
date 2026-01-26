import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSimpleDto {
  @IsEmail()
  currentEmail: string;

  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsOptional()
  @IsEmail()
  newEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;
}
