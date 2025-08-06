import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() debounceTime = 300;
  @Input() disabled = false;
  @Input() clearable = true;
  @Input() initialValue = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() searchClear = new EventEmitter<void>();
  @Output() searchFocus = new EventEmitter<void>();
  @Output() searchBlur = new EventEmitter<void>();

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Set initial value
    this.searchControl.setValue(this.initialValue);

    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchChange.emit(value || '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClear(): void {
    this.searchControl.setValue('');
    this.searchClear.emit();
  }

  onFocus(): void {
    this.searchFocus.emit();
  }

  onBlur(): void {
    this.searchBlur.emit();
  }

  get hasValue(): boolean {
    return !!(this.searchControl.value && this.searchControl.value.trim());
  }
}
