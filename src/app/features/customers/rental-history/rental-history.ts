import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingSummaryDto } from '../../../core/models/booking.models';
import { BookingStatus } from '../../../core/models/enums';
import { CustomerService } from '../../../core/services/customer.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';

type Tab = 'all' | 'upcoming' | 'active' | 'past' | 'cancelled';

const GROUPS: Record<Exclude<Tab, 'all'>, BookingStatus[]> = {
  upcoming: ['Pending', 'Confirmed'],
  active: ['PickedUp'],
  past: ['Returned', 'Completed'],
  cancelled: ['Cancelled', 'Expired']
};

@Component({
  selector: 'app-rental-history',
  imports: [RouterLink, DatePipe, CurrencyPipe, PageHeader, StatusBadge],
  templateUrl: './rental-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RentalHistory implements OnInit {
  private customerService = inject(CustomerService);

  tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'active', label: 'Active' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  bookings = signal<BookingSummaryDto[]>([]);
  tab = signal<Tab>('all');
  hasProfile = signal(true);
  loading = signal(true);
  error = signal<string | null>(null);

  filtered = computed(() => {
    const t = this.tab();
    const list = this.bookings();
    return t === 'all' ? list : list.filter(b => GROUPS[t].includes(b.status));
  });

  ngOnInit() {
    this.customerService.getMyStatus().subscribe({
      next: status => {
        if (!status.hasProfile || status.customerId === undefined) {
          this.hasProfile.set(false);
          this.loading.set(false);
          return;
        }

        this.customerService.getRentalHistory(status.customerId).subscribe({
          next: list => { this.bookings.set(list); this.loading.set(false); },
          error: err => { this.error.set(err.message); this.loading.set(false); }
        });
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}