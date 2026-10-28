import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingDto, PickupDto } from '../../../core/models/booking.models';
import { BookingService } from '../../../core/services/booking.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { InspectionForm } from '../inspection-form/inspection-form';

@Component({
  selector: 'app-booking-pickup',
  imports: [RouterLink, DatePipe, PageHeader, LoadingSpinner, StatusBadge, InspectionForm],
  templateUrl: './booking-pickup.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingPickup implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  // Bound from /bookings/:id/pickup
  id = input.required<string>();

  booking = signal<BookingDto | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  canPickup = computed(() => this.booking()?.status === 'Confirmed');

  depositPaid = computed(() => {
    const b = this.booking();
    return !b || b.securityDeposit <= 0
      || b.payments.some(p => p.type === 'SecurityDeposit' && p.status === 'Success');
  });

  ngOnInit() {
    this.bookingService.getById(+this.id()).subscribe({
      next: booking => { this.booking.set(booking); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  submit(value: PickupDto) {
    this.saving.set(true);
    this.error.set(null);

    this.bookingService.pickup(+this.id(), value).subscribe({
      next: () => this.router.navigate(['/bookings', this.id()]),
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}