import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User, UserRole } from '../../models';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() showActions = true;
  @Input() loading = false;

  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<User>();
  @Output() toggleStatus = new EventEmitter<User>();

  readonly UserRole = UserRole;

  get fullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  get roleDisplayName(): string {
    const roleMap: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.USER]: 'User',
      [UserRole.MODERATOR]: 'Moderator'
    };
    return roleMap[this.user.role];
  }

  get statusClass(): string {
    return this.user.isActive ? 'user-card__status--active' : 'user-card__status--inactive';
  }

  get statusText(): string {
    return this.user.isActive ? 'Active' : 'Inactive';
  }

  get roleClass(): string {
    const roleClassMap: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'user-card__role--admin',
      [UserRole.USER]: 'user-card__role--user',
      [UserRole.MODERATOR]: 'user-card__role--moderator'
    };
    return roleClassMap[this.user.role];
  }

  onEdit(): void {
    if (!this.loading) {
      this.edit.emit(this.user);
    }
  }

  onDelete(): void {
    if (!this.loading) {
      this.delete.emit(this.user);
    }
  }

  onToggleStatus(): void {
    if (!this.loading) {
      this.toggleStatus.emit(this.user);
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }
}
