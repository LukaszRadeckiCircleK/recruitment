import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap, map, startWith, finalize } from 'rxjs/operators';
import { User, UserFilters, UserRole } from '../../models';
import { UserService, LoadingService } from '../../services';

@Component({
  selector: 'app-user-list-container',
  templateUrl: './user-list-container.component.html',
})
export class UserListContainerComponent implements OnInit {
  private filtersSubject = new BehaviorSubject<UserFilters>({});
  private LOADING_KEY = 'user-list';

  users: Observable<User[]>;
  loading: Observable<boolean>;

  filters: UserFilters = {};

  readonly userRoles = Object.values(UserRole);
  usersTitleFormatter = (usersQuantity: number) => `${usersQuantity} users found`;

  constructor(
    private userService: UserService,
    private loadingService: LoadingService,
  ) {
    this.loading = this.loadingService.isLoading(this.LOADING_KEY);

    // Combine filters with user data to get filtered results
    this.users = combineLatest([
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

  private loadUsers(): void {
    this.loadingService.startLoading(this.LOADING_KEY);

    this.userService.getUsers()
      .pipe(
        finalize(() => this.loadingService.stopLoading(this.LOADING_KEY)),
      );
  }

  private updateFilters(newFilters: Partial<UserFilters>): void {
    this.filters = { ...this.filters, ...newFilters };
    this.filtersSubject.next(this.filters);
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
      );
  }

  // Filter Operations
  onSearchChange(searchTerm: string): void {
    this.updateFilters({ searchTerm: searchTerm || undefined });
  }

  onClearFilters(): void {
    this.filters = {};
    this.filtersSubject.next({});
  }
}
