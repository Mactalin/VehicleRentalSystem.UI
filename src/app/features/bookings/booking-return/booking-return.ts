import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingDto, ReturnDto, ReturnSummaryDto } from '../../../core/models/booking.models';
import { BookingService } from '../../../core/services/booking.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { InspectionForm } from '../inspection-form/inspection-form';

@Component({
  selector: 'app-booking-return',
  imports: [RouterLink, DatePipe, CurrencyPipe, PageHeader, StatusBadge, InspectionForm],
  templateUrl: './booking-return.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingReturn implements OnInit {
  private bookingService = inject(BookingService);

  // Bound from /bookings/:id/return
  id = input.required<string>();

  booking = signal<BookingDto | null>(null);
  result = signal<ReturnSummaryDto | null>(null);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  canReturn = computed(() => this.booking()?.status === 'PickedUp');

  pickupOdometer = computed(() =>
    this.booking()?.inspections.find(i => i.type === 'Pickup')?.odometerReading ?? 0);

  isLate = computed(() => {
    const b = this.booking();
    return !!b && Date.now() > Date.parse(b.endAt);
  });

  ngOnInit() {
    this.bookingService.getById(+this.id()).subscribe({
      next: booking => { this.booking.set(booking); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  submit(value: ReturnDto) {
    this.saving.set(true);
    this.error.set(null);

    this.bookingService.return(+this.id(), value).subscribe({
      next: result => {
        this.result.set(result);
        this.saving.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}