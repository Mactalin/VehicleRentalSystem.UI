import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { BookingDto, CancellationPreviewDto } from '../../../core/models/booking.models';
import { BranchDto } from '../../../core/models/branch.models';
import { SettlementDto } from '../../../core/models/payment.models';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { BranchService } from '../../../core/services/branch.service';
import { PaymentService } from '../../../core/services/payment.service';
import { methodLabel } from '../../../core/utils/payment.util';
import { isHttpUrl } from '../../../core/utils/url.util';
import { BookingTimeline } from '../../../shared/components/booking-timeline/booking-timeline/booking-timeline';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-booking-details',
  imports: [
    RouterLink, DatePipe, CurrencyPipe, PageHeader, StatusBadge,
    EnumLabelPipe, BookingTimeline
  ],
  templateUrl: './booking-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingDetails implements OnInit {
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);
  private branchService = inject(BranchService);
  private confirm = inject(ConfirmService);
  private auth = inject(AuthService);

  // Bound from /bookings/:id
  id = input.required<string>();

  methodLabel = methodLabel;

  booking = signal<BookingDto | null>(null);
  settlement = signal<SettlementDto | null>(null);
  branches = signal<BranchDto[]>([]);

  loading = signal(true);
  busy = signal(false);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  // Cancel panel
  cancelling = signal(false);
  preview = signal<CancellationPreviewDto | null>(null);
  cancelReason = signal('');

  isStaff = computed(() => this.auth.hasRole('Admin', 'Manager', 'Staff'));

  // A Pending booking is only held until pendingExpiresAt
  lapsed = computed(() => {
    const b = this.booking();
    return !!b && b.status === 'Pending' && !!b.pendingExpiresAt && Date.parse(b.pendingExpiresAt) <= Date.now();
  });

  private open = computed(() => {
    const s = this.booking()?.status;
    return s === 'Pending' || s === 'Confirmed';
  });

  canModify = computed(() => this.open() && !this.lapsed());
  canCancel = computed(() => this.open() && !this.lapsed());

  canPay = computed(() => {
    const s = this.booking()?.status;
    return !!s && !['Cancelled', 'Expired', 'Completed'].includes(s) && !this.lapsed();
  });

  canPickup = computed(() => this.isStaff() && this.booking()?.status === 'Confirmed');
  canReturn = computed(() => this.isStaff() && this.booking()?.status === 'PickedUp');
  canComplete = computed(() => this.isStaff() && this.booking()?.status === 'Returned');

  outstanding = computed(() => this.settlement()?.totalDue ?? 0);

  ngOnInit() {
    const id = +this.id();

    forkJoin({
      booking: this.bookingService.getById(id),
      settlement: this.paymentService.getSettlement(id),
      // Branch names are a nicety, so a failure here must not break the page
      branches: this.branchService.getAll().pipe(catchError(() => of([] as BranchDto[])))
    }).subscribe({
      next: ({ booking, settlement, branches }) => {
        this.booking.set(booking);
        this.settlement.set(settlement);
        this.branches.set(branches);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  private reload() {
    const id = +this.id();

    forkJoin({
      booking: this.bookingService.getById(id),
      settlement: this.paymentService.getSettlement(id)
    }).subscribe({
      next: ({ booking, settlement }) => {
        this.booking.set(booking);
        this.settlement.set(settlement);
        this.busy.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.busy.set(false);
      }
    });
  }

  branchName(id?: number | null): string {
    if (id == null) return 'Branch not set';
    return this.branches().find(b => b.id === id)?.name ?? `Branch #${id}`;
  }

  photoLinks(value?: string): string[] {
    return (value ?? '').split(',').map(s => s.trim()).filter(s => isHttpUrl(s));
  }

  // ---------- Cancel ----------

  startCancel() {
    this.error.set(null);
    this.message.set(null);
    this.busy.set(true);

    this.bookingService.getCancelPreview(+this.id()).subscribe({
      next: p => {
        this.preview.set(p);
        this.cancelReason.set('');
        this.cancelling.set(true);
        this.busy.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.busy.set(false);
      }
    });
  }

  closeCancel() {
    this.cancelling.set(false);
  }

  async confirmCancel() {
    const reason = this.cancelReason().trim();
    if (!reason) {
      this.error.set('Please tell us why the booking is being cancelled.');
      return;
    }

    const refund = this.preview()?.refundAmount ?? 0;
    const ok = await this.confirm.confirm({
      title: 'Cancel this booking?',
      message: refund > 0
        ? `\u20B9${refund.toFixed(2)} will be refunded. This cannot be undone.`
        : 'No refund applies to this cancellation. This cannot be undone.',
      confirmText: 'Cancel booking',
      cancelText: 'Keep booking'
    });
    if (!ok) return;

    this.busy.set(true);
    this.error.set(null);

    this.bookingService.cancel(+this.id(), { reason }).subscribe({
      next: result => {
        this.message.set(`Booking cancelled. Refund: \u20B9${result.refundAmount.toFixed(2)}.`);
        this.cancelling.set(false);
        this.reload();
      },
      error: err => {
        this.error.set(err.message);
        this.busy.set(false);
      }
    });
  }

  // ---------- Complete (staff) ----------

  async complete() {
    if (this.outstanding() > 0) {
      this.error.set('The outstanding amount must be paid before the rental can be completed.');
      return;
    }

    const ok = await this.confirm.confirm({
      title: 'Complete this rental?',
      message: 'The remaining deposit is refunded, the invoice is created and the booking is closed.',
      confirmText: 'Complete rental',
      tone: 'primary'
    });
    if (!ok) return;

    this.busy.set(true);
    this.error.set(null);
    this.message.set(null);

    this.bookingService.complete(+this.id()).subscribe({
      next: () => {
        this.message.set('Rental completed. The invoice is ready.');
        this.reload();
      },
      error: err => {
        this.error.set(err.message);
        this.busy.set(false);
      }
    });
  }
}