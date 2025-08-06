import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, CreateUserRequest, UpdateUserRequest, UserRole } from '../../models';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user?: User;
  @Input() loading = false;
  @Input() submitButtonText = 'Save';
  @Input() showCancelButton = true;

  @Output() formSubmit = new EventEmitter<CreateUserRequest | UpdateUserRequest>();
  @Output() formCancel = new EventEmitter<void>();

  userForm!: FormGroup;
  readonly userRoles = Object.values(UserRole);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.userForm) {
      this.populateForm();
    }
  }

  get isEditMode(): boolean {
    return !!this.user;
  }

  get formTitle(): string {
    return this.isEditMode ? 'Edit User' : 'Create New User';
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      role: [UserRole.USER, [Validators.required]],
      isActive: [true]
    });

    this.populateForm();
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        role: this.user.role,
        isActive: this.user.isActive
      });
    } else {
      this.userForm.reset({
        firstName: '',
        lastName: '',
        email: '',
        role: UserRole.USER,
        isActive: true
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.loading) {
      const formValue = this.userForm.value;

      if (this.isEditMode) {
        const updateRequest: UpdateUserRequest = {
          id: this.user!.id,
          ...formValue
        };
        this.formSubmit.emit(updateRequest);
      } else {
        const createRequest: CreateUserRequest = formValue;
        this.formSubmit.emit(createRequest);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.userForm.get(fieldName);

    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        const requiredLength = control.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${requiredLength} characters`;
      }
    }

    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      role: 'Role'
    };
    return displayNames[fieldName] || fieldName;
  }

  getRoleDisplayName(role: UserRole): string {
    const roleDisplayNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.USER]: 'User',
      [UserRole.MODERATOR]: 'Moderator'
    };
    return roleDisplayNames[role];
  }
}
