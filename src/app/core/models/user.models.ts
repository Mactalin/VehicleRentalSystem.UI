import { RoleName } from './enums';

export type { UserDto } from './auth.models';

export interface UpdateProfileDto {
  fullName: string;
  phone?: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: RoleName;
}

export interface UpdateUserRoleDto {
  role: RoleName;
}