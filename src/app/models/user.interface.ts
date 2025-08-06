export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
  isActive?: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export interface UserFilters {
  searchTerm?: string;
  role?: UserRole;
  isActive?: boolean;
}
