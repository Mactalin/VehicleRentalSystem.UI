import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingSummaryDto } from '../../../core/models/booking.models';
import { BookingStatus } from '../../../core/models/enums';
import { BookingService } from '../../../core/services/booking.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';

@Component({
  selector: 'app-booking-list',
  imports: [RouterLink, DatePipe, CurrencyPipe, PageHeader, StatusBadge],
  templateUrl: './booking-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingList implements OnInit {
  private bookingService = inject(BookingService);

  tabs: { status: BookingStatus; label: string }[] = [
    { status: 'Confirmed', label: 'Awaiting pickup' },
    { status: 'PickedUp', label: 'On rent' },
    { status: 'Returned', label: 'Awaiting completion' },
    { status: 'Pending', label: 'Unpaid' },
    { status: 'Completed', label: 'Completed' },
    { status: 'Cancelled', label: 'Cancelled' }
  ];

  tab = signal<BookingStatus>('Confirmed');
  bookings = signal<BookingSummaryDto[]>([]);
  search = signal('');

  loading = signal(true);
  error = signal<string | null>(null);

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.bookings().filter(b =>
      !q || `${b.bookingNumber} ${b.customerName ?? ''} ${b.vehicleName}`.toLowerCase().includes(q));

    // Upcoming work is shown soonest first, finished work newest first
    const newestFirst = this.tab() === 'Completed' || this.tab() === 'Cancelled';
    return [...list].sort((a, b) =>
      newestFirst ? Date.parse(b.startAt) - Date.parse(a.startAt) : Date.parse(a.startAt) - Date.parse(b.startAt));
  });

  ngOnInit() { this.load(); }

  setTab(status: BookingStatus) {
    this.tab.set(status);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.getByStatus(this.tab()).subscribe({
      next: list => { this.bookings.set(list); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}