import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentDto } from '../../../core/models/payment.models';
import { CustomerService } from '../../../core/services/customer.service';
import { PaymentService } from '../../../core/services/payment.service';
import { methodLabel } from '../../../core/utils/payment.util';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-payment-history',
  imports: [RouterLink, DatePipe, CurrencyPipe, PageHeader, StatusBadge, EnumLabelPipe],
  templateUrl: './payment-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentHistory implements OnInit {
  private customerService = inject(CustomerService);
  private paymentService = inject(PaymentService);

  methodLabel = methodLabel;

  payments = signal<PaymentDto[]>([]);
  hasProfile = signal(true);
  loading = signal(true);
  error = signal<string | null>(null);

  // A payment that was later fully refunded was still paid first
  totalPaid = computed(() =>
    this.payments()
      .filter(p => p.status === 'Success' || p.status === 'Refunded')
      .reduce((sum, p) => sum + p.amount, 0));

  totalRefunded = computed(() => this.payments().reduce((sum, p) => sum + p.refundedAmount, 0));

  netPaid = computed(() => this.totalPaid() - this.totalRefunded());

  ngOnInit() {
    this.customerService.getMyStatus().subscribe({
      next: status => {
        if (!status.hasProfile || status.customerId === undefined) {
          this.hasProfile.set(false);
          this.loading.set(false);
          return;
        }

        this.paymentService.getByCustomer(status.customerId).subscribe({
          next: list => { this.payments.set(list); this.loading.set(false); },
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