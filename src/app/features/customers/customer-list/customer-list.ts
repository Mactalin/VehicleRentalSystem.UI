import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerSummaryDto } from '../../../core/models/customer.models';
import { CustomerStatus, VerificationStatus } from '../../../core/models/enums';
import { CustomerService } from '../../../core/services/customer.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';

const PAGE_SIZE = 15;

@Component({
  selector: 'app-customer-list',
  imports: [RouterLink, DatePipe, PageHeader, LoadingSpinner, StatusBadge],
  templateUrl: './customer-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerList implements OnInit {
  private customerService = inject(CustomerService);

  verifications: VerificationStatus[] = ['Pending', 'Verified', 'Rejected'];
  statuses: CustomerStatus[] = ['Active', 'Suspended', 'Blocked'];

  customers = signal<CustomerSummaryDto[]>([]);
  page = signal(1);
  totalPages = signal(0);
  totalCount = signal(0);

  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  verification = signal<VerificationStatus | ''>('');
  status = signal<CustomerStatus | ''>('');

  ngOnInit() { this.load(1); }

  load(page: number) {
    this.loading.set(true);
    this.error.set(null);

    this.customerService.getAll({
      page,
      pageSize: PAGE_SIZE,
      search: this.search().trim() || undefined,
      verification: this.verification() || undefined,
      status: this.status() || undefined
    }).subscribe({
      next: r => {
        this.customers.set(r.items);
        this.page.set(r.page);
        this.totalPages.set(r.totalPages);
        this.totalCount.set(r.totalCount);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onSearch(event: Event) {
    event.preventDefault();
    this.load(1);
  }

  setVerification(value: string) { this.verification.set(value as VerificationStatus | ''); this.load(1); }
  setStatus(value: string) { this.status.set(value as CustomerStatus | ''); this.load(1); }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.load(page);
  }

  clear() {
    this.search.set('');
    this.verification.set('');
    this.status.set('');
    this.load(1);
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
  }
}