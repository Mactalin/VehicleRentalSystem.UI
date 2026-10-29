import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingDto } from '../../../core/models/booking.models';
import { SettlementDto } from '../../../core/models/payment.models';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { methodLabel } from '../../../core/utils/payment.util';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-payment-settlement',
  imports: [RouterLink, DatePipe, CurrencyPipe, PageHeader, StatusBadge, EnumLabelPipe],
  templateUrl: './payment-settlement.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentSettlement implements OnInit {
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);

  // Bound from /payments/booking/:bookingId/settlement
  bookingId = input.required<string>();

  methodLabel = methodLabel;

  booking = signal<BookingDto | null>(null);
  settlement = signal<SettlementDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  closed = computed(() => {
    const status = this.booking()?.status;
    return status === 'Cancelled' || status === 'Expired' || status === 'Completed';
  });

  hasInvoice = computed(() => this.booking()?.status === 'Completed');

  ngOnInit() {
    const id = +this.bookingId();

    forkJoin({
      booking: this.bookingService.getById(id),
      settlement: this.paymentService.getSettlement(id)
    }).subscribe({
      next: ({ booking, settlement }) => {
        this.booking.set(booking);
        this.settlement.set(settlement);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}