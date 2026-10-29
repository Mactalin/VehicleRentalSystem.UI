import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingDto } from '../../../core/models/booking.models';
import { PaymentMethod, PaymentType } from '../../../core/models/enums';
import { SettlementDto } from '../../../core/models/payment.models';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { methodLabel } from '../../../core/utils/payment.util';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

interface DueItem {
  type: PaymentType;
  label: string;
  note: string;
  amount: number;
}

@Component({
  selector: 'app-payment-pay',
  imports: [RouterLink, DatePipe, CurrencyPipe, PageHeader, StatusBadge, EnumLabelPipe],
  templateUrl: './payment-pay.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentPay implements OnInit {
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);
  private auth = inject(AuthService);

  // Bound from /payments/booking/:bookingId/pay
  bookingId = input.required<string>();

  methodLabel = methodLabel;

  booking = signal<BookingDto | null>(null);
  settlement = signal<SettlementDto | null>(null);
  method = signal<PaymentMethod>('Upi');

  loading = signal(true);
  paying = signal<PaymentType | null>(null);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  // Cash is taken at the counter, so only staff are offered it. The API enforces this too.
  methods = computed<{ value: PaymentMethod; label: string }[]>(() => {
    const online: { value: PaymentMethod; label: string }[] = [
      { value: 'Upi', label: 'UPI' },
      { value: 'Card', label: 'Card' },
      { value: 'NetBanking', label: 'Net banking' }
    ];
    return this.auth.hasRole('Admin', 'Manager', 'Staff')
      ? [...online, { value: 'Cash', label: 'Cash at counter' }]
      : online;
  });

  closed = computed(() => {
    const status = this.booking()?.status;
    return status === 'Cancelled' || status === 'Expired' || status === 'Completed';
  });

  // A Pending booking is only held until pendingExpiresAt
  lapsed = computed(() => {
    const b = this.booking();
    return !!b && b.status === 'Pending' && !!b.pendingExpiresAt && Date.parse(b.pendingExpiresAt) <= Date.now();
  });

  // Mirrors the amounts the API will charge for each payment type
  dues = computed<DueItem[]>(() => {
    const b = this.booking();
    const s = this.settlement();
    if (!b || !s || this.closed() || this.lapsed()) return [];

    const items: DueItem[] = [];

    const advanceAmount = b.advanceAmount ?? 0;
    if (b.status === 'Pending' && s.rentalPaid === 0 && advanceAmount > 0) {
      items.push({
        type: 'Advance', label: 'Advance payment',
        note: 'Confirms your booking', amount: advanceAmount
      });
    }

    if (s.rentalBalance > 0) {
      items.push({
        type: 'Full',
        label: s.rentalPaid > 0 ? 'Remaining rental balance' : 'Full rental amount',
        note: s.rentalPaid > 0 ? 'The rest of your rental charge' : 'Pay everything now instead of the advance',
        amount: s.rentalBalance
      });
    }

    if (b.status === 'Confirmed' && b.securityDeposit > 0 && s.depositPaid === 0) {
      items.push({
        type: 'SecurityDeposit', label: 'Security deposit',
        note: 'Refundable, required before pickup', amount: b.securityDeposit
      });
    }

    if (b.status === 'Returned' && s.lateFeeDue > 0) {
      items.push({
        type: 'LateFee', label: 'Late return charge',
        note: 'Not covered by your deposit', amount: s.lateFeeDue
      });
    }

    if (b.status === 'Returned' && s.damageChargeDue > 0) {
      items.push({
        type: 'DamageCharge', label: 'Damage charge',
        note: 'Not covered by your deposit', amount: s.damageChargeDue
      });
    }

    return items;
  });

  ngOnInit() { this.load(true); }

  private load(showSpinner: boolean) {
    if (showSpinner) this.loading.set(true);
    const id = +this.bookingId();

    forkJoin({
      booking: this.bookingService.getById(id),
      settlement: this.paymentService.getSettlement(id)
    }).subscribe({
      next: ({ booking, settlement }) => {
        this.booking.set(booking);
        this.settlement.set(settlement);
        this.loading.set(false);
        this.paying.set(null);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
        this.paying.set(null);
      }
    });
  }

  pay(item: DueItem) {
    const booking = this.booking();
    if (!booking || this.paying()) return;

    this.paying.set(item.type);
    this.error.set(null);
    this.message.set(null);

    this.paymentService.create({ bookingId: booking.id, type: item.type, method: this.method() }).subscribe({
      next: () => {
        this.message.set(`${item.label} paid.`);
        this.load(false);
      },
      error: err => {
        this.error.set(err.message);
        this.paying.set(null);
      }
    });
  }
}