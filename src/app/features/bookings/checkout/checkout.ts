import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingDto, BookingQuoteDto } from '../../../core/models/booking.models';
import { BranchDto } from '../../../core/models/branch.models';
import { PaymentMethod, PaymentType } from '../../../core/models/enums';
import { VehicleDto } from '../../../core/models/vehicle.models';
import { BookingService } from '../../../core/services/booking.service';
import { BranchService } from '../../../core/services/branch.service';
import { PaymentService } from '../../../core/services/payment.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { PriceBreakdown } from '../../../shared/components/price-breakdown/price-breakdown/price-breakdown';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-checkout',
  imports: [
    RouterLink, DatePipe, CurrencyPipe, NgTemplateOutlet,
    PageHeader, LoadingSpinner, PriceBreakdown, StatusBadge
  ],
  templateUrl: './checkout.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Checkout implements OnInit {
  private vehicleService = inject(VehicleService);
  private branchService = inject(BranchService);
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);

  // Bound from /book/:vehicleId?from=...&to=...  (UTC ISO strings)
  vehicleId = input.required<string>();
  from = input<string>();
  to = input<string>();

  methods: { value: PaymentMethod; label: string }[] = [
    { value: 'Upi', label: 'UPI' },
    { value: 'Card', label: 'Card' },
    { value: 'NetBanking', label: 'Net banking' }
  ];

  vehicle = signal<VehicleDto | null>(null);
  branches = signal<BranchDto[]>([]);
  quote = signal<BookingQuoteDto | null>(null);
  booking = signal<BookingDto | null>(null);

  dropBranchId = signal(0);
  method = signal<PaymentMethod>('Upi');

  loading = signal(true);
  creating = signal(false);
  paying = signal(false);
  error = signal<string | null>(null);

  advancePaid = signal(false);
  depositPaid = signal(false);

  // Countdown for the 15 minute payment window
  private now = signal(Date.now());

  remainingMs = computed(() => {
    const expires = this.booking()?.pendingExpiresAt;
    return expires ? Math.max(0, Date.parse(expires) - this.now()) : 0;
  });

  expired = computed(() => {
    const b = this.booking();
    return !!b && b.status === 'Pending' && this.remainingMs() === 0;
  });

  countdown = computed(() => {
    const total = Math.floor(this.remainingMs() / 1000);
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  });

  urgent = computed(() => this.remainingMs() > 0 && this.remainingMs() < 120_000);

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  ngOnInit() {
    const startAt = this.from();
    const endAt = this.to();

    if (!startAt || !endAt || isNaN(Date.parse(startAt)) || isNaN(Date.parse(endAt))) {
      this.error.set('Pickup and return times are missing. Please start from the search page.');
      this.loading.set(false);
      return;
    }

    const vehicleId = +this.vehicleId();

    forkJoin({
      vehicle: this.vehicleService.getById(vehicleId),
      branches: this.branchService.getAll(),
      quote: this.bookingService.getQuote({ vehicleId, startAt, endAt })
    }).subscribe({
      next: ({ vehicle, branches, quote }) => {
        this.vehicle.set(vehicle);
        this.branches.set(branches);
        this.quote.set(quote);
        this.dropBranchId.set(vehicle.branchId);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  createBooking() {
    const vehicle = this.vehicle();
    if (!vehicle || this.creating()) return;

    this.creating.set(true);
    this.error.set(null);

    this.bookingService.create({
      vehicleId: vehicle.id,
      dropBranchId: this.dropBranchId() || undefined,
      startAt: this.from()!,
      endAt: this.to()!
    }).subscribe({
      next: booking => {
        this.booking.set(booking);
        this.creating.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.creating.set(false);
      }
    });
  }

  pay(type: PaymentType) {
    const booking = this.booking();
    if (!booking || this.paying()) return;

    this.paying.set(true);
    this.error.set(null);

    this.paymentService.create({ bookingId: booking.id, type, method: this.method() }).subscribe({
      next: () => {
        if (type === 'Advance') this.advancePaid.set(true);
        if (type === 'SecurityDeposit') this.depositPaid.set(true);

        // Paying the advance confirms the booking, so reload it to get the new status
        this.bookingService.getById(booking.id).subscribe({
          next: fresh => { this.booking.set(fresh); this.paying.set(false); },
          error: err => { this.error.set(err.message); this.paying.set(false); }
        });
      },
      error: err => {
        this.error.set(err.message);
        this.paying.set(false);
      }
    });
  }
}