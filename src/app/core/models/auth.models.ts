import { RoleName } from './enums';

export interface RegisterDto {
  fullName: string; email: string; phone?: string;
  password: string; confirmPassword: string;
}
export interface LoginDto { email: string; password: string; }
export interface ChangePasswordDto {
  currentPassword: string; newPassword: string; confirmNewPassword: string;
}
export interface UserDto {
  id: number; fullName: string; email: string; phone?: string;
  role: RoleName; isActive: boolean; createdAt: string; lastLoginAt?: string;
}
export interface AuthResponseDto { token: string; user: UserDto; }