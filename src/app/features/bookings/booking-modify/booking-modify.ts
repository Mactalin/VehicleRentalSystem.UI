import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingDto, BookingQuoteDto } from '../../../core/models/booking.models';
import { BookingService } from '../../../core/services/booking.service';
import { localInputFromNow, toLocalInput, toUtcIso } from '../../../core/utils/date.util';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { PriceBreakdown } from '../../../shared/components/price-breakdown/price-breakdown/price-breakdown';

@Component({
  selector: 'app-booking-modify',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CurrencyPipe, PageHeader, LoadingSpinner, PriceBreakdown],
  templateUrl: './booking-modify.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingModify implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  // Bound from /bookings/:id/modify
  id = input.required<string>();

  minDate = localInputFromNow(0);

  booking = signal<BookingDto | null>(null);
  quote = signal<BookingQuoteDto | null>(null);

  loading = signal(true);
  quoting = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    startAt: ['', Validators.required],
    endAt: ['', Validators.required],
    reason: ['', Validators.maxLength(500)]
  });

  modifiable = computed(() => {
    const status = this.booking()?.status;
    return status === 'Pending' || status === 'Confirmed';
  });

  difference = computed(() => {
    const q = this.quote();
    const b = this.booking();
    const quoteTotal = q?.totalAmount ?? q?.total ?? 0;
    return q && b ? quoteTotal - b.totalAmount : 0;
  });

  constructor() {
    // A changed date makes the earlier price preview stale
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.quote.set(null));
  }

  ngOnInit() {
    this.bookingService.getById(+this.id()).subscribe({
      next: booking => {
        this.booking.set(booking);
        this.form.patchValue({
          startAt: toLocalInput(booking.startAt),
          endAt: toLocalInput(booking.endAt)
        });
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  preview() {
    const booking = this.booking();
    const range = this.readRange();
    if (!booking || !range) return;

    this.quoting.set(true);

    this.bookingService.getQuote({ vehicleId: booking.vehicleId, ...range }).subscribe({
      next: quote => {
        this.quote.set(quote);
        this.quoting.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.quoting.set(false);
      }
    });
  }

  save() {
    const range = this.readRange();
    if (!range) return;

    this.saving.set(true);

    this.bookingService.modify(+this.id(), {
      newStartAt: range.startAt,
      newEndAt: range.endAt,
      reason: this.form.getRawValue().reason.trim() || undefined
    }).subscribe({
      next: booking => this.router.navigate(['/bookings', booking.id]),
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }

  private readRange(): { startAt: string; endAt: string } | null {
    this.error.set(null);
    const v = this.form.getRawValue();

    if (!v.startAt || !v.endAt) {
      this.form.markAllAsTouched();
      return null;
    }

    const start = new Date(v.startAt);
    const end = new Date(v.endAt);

    if (start.getTime() < Date.now() - 5 * 60_000) {
      this.error.set('The new pickup time cannot be in the past.');
      return null;
    }
    if (end <= start) {
      this.error.set('The return time must be after the pickup time.');
      return null;
    }

    return { startAt: toUtcIso(v.startAt), endAt: toUtcIso(v.endAt) };
  }
}