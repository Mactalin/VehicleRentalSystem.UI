import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingQuoteDto } from '../../../core/models/booking.models';
import { VehicleDto } from '../../../core/models/vehicle.models';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { VehicleSearchService } from '../../../core/services/vehicle-search.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { localInputFromNow, toLocalInput, toUtcIso } from '../../../core/utils/date.util';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { PriceBreakdown } from '../../../shared/components/price-breakdown/price-breakdown/price-breakdown';

@Component({
  selector: 'app-vehicle-detail',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, PageHeader, PriceBreakdown],
  templateUrl: './vehicle-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleDetail implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private vehicleService = inject(VehicleService);
  private searchService = inject(VehicleSearchService);
  private bookingService = inject(BookingService);
  private auth = inject(AuthService);

  // Bound from /search/:id?from=...&to=...  (from and to are UTC ISO strings)
  id = input.required<string>();
  from = input<string>();
  to = input<string>();

  minDate = localInputFromNow(0);
  canBook = computed(() => this.auth.hasRole('Customer'));

  vehicle = signal<VehicleDto | null>(null);
  loading = signal(true);
  checking = signal(false);
  error = signal<string | null>(null);

  availability = signal<boolean | null>(null);
  quote = signal<BookingQuoteDto | null>(null);
  range = signal<{ startAt: string; endAt: string } | null>(null);

  form = this.fb.nonNullable.group({ from: '', to: '' });

  ngOnInit() {
    // Changing a date makes the earlier result stale
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.availability.set(null);
      this.quote.set(null);
      this.range.set(null);
    });

    this.vehicleService.getById(+this.id()).subscribe({
      next: vehicle => {
        this.vehicle.set(vehicle);
        this.loading.set(false);

        const from = this.from();
        const to = this.to();
        if (from && to) {
          this.form.patchValue({ from: toLocalInput(from), to: toLocalInput(to) });
          this.check();
        }
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  check() {
    const raw = this.form.getRawValue();
    this.error.set(null);

    if (!raw.from || !raw.to) {
      this.error.set('Choose both a pickup and a return time.');
      return;
    }
    if (new Date(raw.from).getTime() < Date.now() - 5 * 60_000) {
      this.error.set('The pickup time cannot be in the past.');
      return;
    }
    if (new Date(raw.to) <= new Date(raw.from)) {
      this.error.set('The return time must be after the pickup time.');
      return;
    }

    const startAt = toUtcIso(raw.from);
    const endAt = toUtcIso(raw.to);
    const vehicleId = +this.id();

    this.checking.set(true);

    forkJoin({
      availability: this.searchService.checkAvailability(vehicleId, startAt, endAt),
      quote: this.bookingService.getQuote({ vehicleId, startAt, endAt })
    }).subscribe({
      next: ({ availability, quote }) => {
        this.availability.set(availability.isAvailable);
        this.quote.set(quote);
        this.range.set({ startAt, endAt });
        this.checking.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.checking.set(false);
      }
    });
  }

  bookNow() {
    const range = this.range();
    if (!range) return;

    this.router.navigate(['/book', this.id()], {
      queryParams: { from: range.startAt, to: range.endAt }
    });
  }
}