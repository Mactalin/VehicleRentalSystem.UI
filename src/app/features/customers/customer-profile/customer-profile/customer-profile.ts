import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { CreateCustomerDto, CustomerDto } from '../../../../core/models/customer.models';
import { AuthService } from '../../../../core/services/auth.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge/status-badge';

// The API rejects customers under 18, so check it here too
function adult(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  const limit = new Date();
  limit.setFullYear(limit.getFullYear() - 18);
  return new Date(value) > limit ? { underage: true } : null;
}

@Component({
  selector: 'app-customer-profile',
  imports: [ReactiveFormsModule, RouterLink, PageHeader, LoadingSpinner, StatusBadge],
  templateUrl: './customer-profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerProfile implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private auth = inject(AuthService);

  // /customer/profile?required=1 comes from the guard when a customer tries to book without a profile
  required = input<string>();

  customer = signal<CustomerDto | null>(null);
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal<string | null>(null);

  maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  })();

  initials = computed(() => {
    const name = this.customer()?.fullName ?? this.auth.user()?.fullName ?? '';
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
  });

  displayName = computed(() => this.customer()?.fullName ?? this.auth.user()?.fullName ?? 'Your name');

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,20}$/)]],
    dateOfBirth: ['', [Validators.required, adult]],
    address: ['', [Validators.required, Validators.maxLength(300)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    state: ['', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', [Validators.required, Validators.maxLength(20)]]
  });

  get f() { return this.form.controls; }
  get isEdit() { return !!this.customer(); }

  ngOnInit() {
    this.customerService.getMyStatus().pipe(
      switchMap(status => (status.hasProfile ? this.customerService.getMine() : of(null)))
    ).subscribe({
      next: customer => {
        if (customer) {
          this.customer.set(customer);
          this.form.patchValue(customer);
        } else {
          // Start from what the account already knows
          const user = this.auth.user();
          this.form.patchValue({ fullName: user?.fullName ?? '', phone: user?.phone ?? '' });
        }
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const dto: CreateCustomerDto = {
      fullName: raw.fullName.trim(),
      phone: raw.phone.trim(),
      dateOfBirth: raw.dateOfBirth,
      address: raw.address.trim(),
      city: raw.city.trim(),
      state: raw.state.trim(),
      postalCode: raw.postalCode.trim()
    };

    const existing = this.customer();
    const request$ = existing
      ? this.customerService.update(existing.id, dto)
      : this.customerService.register(dto);

    request$.subscribe({
      next: customer => {
        this.customer.set(customer);
        this.saving.set(false);

        // A new profile still needs documents, so move straight on
        if (!existing) this.router.navigate(['/customer/documents']);
        else this.saved.set(true);
      },
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}