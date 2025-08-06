import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap, map, startWith, finalize } from 'rxjs/operators';
import { User, UserFilters, UserRole } from '../../models';
import { UserService, LoadingService } from '../../services';

@Component({
  selector: 'app-user-list-container',
  templateUrl: './user-list-container.component.html',
  styleUrls: ['./user-list-container.component.scss'],
})
export class UserListContainerComponent implements OnInit {
  private readonly filtersSubject = new BehaviorSubject<UserFilters>({});
  private readonly LOADING_KEY = 'user-list';

  users$: Observable<User[]>;
  loading$: Observable<boolean>;
  isGlobalLoading$: Observable<boolean>;

  filters: UserFilters = {};
  selectedUser: User | null = null;
  showForm = false;

  readonly userRoles = Object.values(UserRole);

  constructor(
    private userService: UserService,
    private loadingService: LoadingService,
  ) {
    this.loading$ = this.loadingService.isLoading(this.LOADING_KEY);
    this.isGlobalLoading$ = this.loadingService.globalLoading$;

    // Combine filters with user data to get filtered results
    this.users$ = combineLatest([
      this.userService.getUsers().pipe(
        map(response => response.data),
        startWith([])
      ),
      this.filtersSubject.asObservable()
    ]).pipe(
      switchMap(([users, filters]) =>
        this.userService.filterUsers(filters).pipe(
          startWith(users)
        )
      )
    );
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  // User CRUD Operations
  onCreateUser(): void {
    this.selectedUser = null;
    this.showForm = true;
  }

  onEditUser(user: User): void {
    this.selectedUser = user;
    this.showForm = true;
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.loadingService.startLoading(`delete-user-${user.id}`);

      this.userService.deleteUser(user.id)
        .pipe(
          finalize(() => this.loadingService.stopLoading(`delete-user-${user.id}`)),
        )
        .subscribe();
    }
  }

  onToggleUserStatus(user: User): void {
    const newStatus = !user.isActive;

    this.loadingService.startLoading(`toggle-user-${user.id}`);

    this.userService.updateUser({
      id: user.id,
      isActive: newStatus
    })
      .pipe(
        finalize(() => this.loadingService.stopLoading(`toggle-user-${user.id}`)),
      )
      .subscribe();
  }

  // Form Operations
  onFormSubmit(userData: any): void {
    const isEditing = !!this.selectedUser;
    const operation$ = isEditing
      ? this.userService.updateUser(userData)
      : this.userService.createUser(userData);

    this.loadingService.startLoading('form-submit');

    operation$
      .pipe(
        finalize(() => this.loadingService.stopLoading('form-submit')),
      )
      .subscribe();
  }

  onFormCancel(): void {
    this.closeForm();
  }

  // Filter Operations
  onSearchChange(searchTerm: string): void {
    this.updateFilters({ searchTerm: searchTerm || undefined });
  }

  onRoleFilterChange(role: UserRole | ''): void {
    this.updateFilters({ role: role || undefined });
  }

  onStatusFilterChange(isActive: boolean | ''): void {
    this.updateFilters({ isActive: isActive === '' ? undefined : isActive });
  }

  onClearFilters(): void {
    this.filters = {};
    this.filtersSubject.next({});
  }

  // Helper Methods
  isUserLoading(userId: string): Observable<boolean> {
    return combineLatest([
      this.loadingService.isLoading(`delete-user-${userId}`),
      this.loadingService.isLoading(`toggle-user-${userId}`)
    ]).pipe(
      map(([deleting, toggling]) => deleting || toggling)
    );
  }

  get isFormLoading(): Observable<boolean> {
    return this.loadingService.isLoading('form-submit');
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.searchTerm || this.filters.role || this.filters.isActive !== undefined);
  }

  private loadUsers(): void {
    this.loadingService.startLoading(this.LOADING_KEY);

    this.userService.getUsers()
      .pipe(
        finalize(() => this.loadingService.stopLoading(this.LOADING_KEY)),
      )
      .subscribe();
  }

  private updateFilters(newFilters: Partial<UserFilters>): void {
    this.filters = { ...this.filters, ...newFilters };
    this.filtersSubject.next(this.filters);
  }

  private closeForm(): void {
    this.showForm = false;
    this.selectedUser = null;
  }
}
