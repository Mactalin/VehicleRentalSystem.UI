import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InvoiceDto } from '../../../core/models/payment.models';
import { InvoiceService } from '../../../core/services/invoice.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';

@Component({
  selector: 'app-invoice-view',
  imports: [RouterLink, DatePipe, CurrencyPipe, PercentPipe, PageHeader, StatusBadge],
  templateUrl: './invoice-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceView implements OnInit {
  private invoiceService = inject(InvoiceService);

  // Bound from /payments/booking/:bookingId/invoice
  bookingId = input.required<string>();

  invoice = signal<InvoiceDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.invoiceService.getByBooking(+this.bookingId()).subscribe({
      next: invoice => {
        this.invoice.set(invoice);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  print() {
    window.print();
  }
}