import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { User, CreateUserRequest, UpdateUserRequest, ApiResponse, UserFilters } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  private readonly mockUsers: User[] = [];

  constructor() {
    this.usersSubject.next([...this.mockUsers]);
  }

  getUsers(): Observable<ApiResponse<User[]>> {
    return of({
      data: this.usersSubject.value,
      success: true,
      message: 'Users retrieved successfully'
    }).pipe(delay(800)); // Simulate API delay
  }

  getUserById(id: string): Observable<ApiResponse<User | null>> {
    const user = this.usersSubject.value.find(u => u.id === id);
    return of({
      data: user || null,
      success: !!user,
      message: user ? 'User found' : 'User not found'
    }).pipe(delay(500));
  }

  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    const newUser: User = {
      id: this.generateId(),
      ...userData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Simulate email validation
    if (this.usersSubject.value.some(u => u.email === userData.email)) {
      return throwError(() => ({
        message: 'Email already exists',
        code: 'EMAIL_EXISTS'
      }));
    }

    return of({
      data: newUser,
      success: true,
      message: 'User created successfully'
    }).pipe(
      delay(1000),
      tap(response => {
        const currentUsers = this.usersSubject.value;
        this.usersSubject.next([...currentUsers, response.data]);
      })
    );
  }

  updateUser(userData: UpdateUserRequest): Observable<ApiResponse<User>> {
    const currentUsers = this.usersSubject.value;
    const userIndex = currentUsers.findIndex(u => u.id === userData.id);

    if (userIndex === -1) {
      return throwError(() => ({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      }));
    }

    const updatedUser: User = {
      ...currentUsers[userIndex],
      ...userData,
      updatedAt: new Date()
    };

    return of({
      data: updatedUser,
      success: true,
      message: 'User updated successfully'
    }).pipe(
      delay(800),
      tap(response => {
        const newUsers = [...currentUsers];
        newUsers[userIndex] = response.data;
        this.usersSubject.next(newUsers);
      })
    );
  }

  deleteUser(id: string): Observable<ApiResponse<null>> {
    const currentUsers = this.usersSubject.value;
    const userExists = currentUsers.some(u => u.id === id);

    if (!userExists) {
      return throwError(() => ({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      }));
    }

    return of({
      data: null,
      success: true,
      message: 'User deleted successfully'
    }).pipe(
      delay(600),
      tap(() => {
        const filteredUsers = currentUsers.filter(u => u.id !== id);
        this.usersSubject.next(filteredUsers);
      })
    );
  }

  filterUsers(filters: UserFilters): Observable<User[]> {
    return this.usersSubject.pipe(
      map(users => this.applyFilters(users, filters))
    );
  }

  private applyFilters(users: User[], filters: UserFilters): User[] {
    return users.filter(user => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.role && user.role !== filters.role) {
        return false;
      }

      if (filters.isActive !== undefined && user.isActive !== filters.isActive) {
        return false;
      }

      return true;
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
