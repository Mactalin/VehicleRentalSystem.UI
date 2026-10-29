import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerDto, ReviewDocumentDto } from '../../../core/models/customer.models';
import { CustomerStatus } from '../../../core/models/enums';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { isHttpUrl } from '../../../core/utils/url.util';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

type DocKind = 'kyc' | 'licence';
interface RejectTarget { kind: DocKind; id: number; label: string; }

@Component({
  selector: 'app-customer-review',
  imports: [RouterLink, DatePipe, PageHeader, StatusBadge, EnumLabelPipe],
  templateUrl: './customer-review.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerReview implements OnInit {
  private customerService = inject(CustomerService);
  private confirm = inject(ConfirmService);
  private auth = inject(AuthService);

  // Bound from /customers/:id
  id = input.required<string>();

  statuses: CustomerStatus[] = ['Active', 'Suspended', 'Blocked'];
  isUrl = isHttpUrl;

  customer = signal<CustomerDto | null>(null);
  loading = signal(true);
  busy = signal(false);
  error = signal<string | null>(null);

  rejecting = signal<RejectTarget | null>(null);
  reason = signal('');
  newStatus = signal<CustomerStatus>('Active');

  isAdmin = computed(() => this.auth.hasRole('Admin'));

  ngOnInit() {
    this.customerService.getById(+this.id()).subscribe({
      next: customer => {
        this.customer.set(customer);
        this.newStatus.set(customer.status);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  async approve(kind: DocKind, docId: number, label: string) {
    const ok = await this.confirm.confirm({
      title: 'Approve document?',
      message: `Confirm that "${label}" is genuine and matches the customer's details.`,
      confirmText: 'Approve',
      tone: 'primary'
    });
    if (ok) this.review(kind, docId, { approve: true });
  }

  startReject(kind: DocKind, id: number, label: string) {
    this.rejecting.set({ kind, id, label });
    this.reason.set('');
    this.error.set(null);
  }

  cancelReject() {
    this.rejecting.set(null);
    this.reason.set('');
  }

  submitReject() {
    const target = this.rejecting();
    if (!target) return;

    const reason = this.reason().trim();
    if (!reason) {
      this.error.set('Enter a reason so the customer knows what to fix.');
      return;
    }
    this.review(target.kind, target.id, { approve: false, rejectionReason: reason });
  }

  async applyStatus() {
    const customer = this.customer();
    const next = this.newStatus();
    if (!customer || next === customer.status) return;

    const ok = await this.confirm.confirm({
      title: next === 'Active' ? 'Reactivate customer?' : `Set customer to ${next}?`,
      message: next === 'Active'
        ? 'This customer will be able to book vehicles again.'
        : 'This customer will not be able to make new bookings.',
      confirmText: 'Apply',
      tone: next === 'Active' ? 'primary' : 'danger'
    });
    if (!ok) return;

    this.busy.set(true);
    this.error.set(null);

    this.customerService.setStatus(customer.id, { status: next }).subscribe({
      next: updated => {
        this.customer.set(updated);
        this.busy.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.busy.set(false);
      }
    });
  }

  private review(kind: DocKind, docId: number, dto: ReviewDocumentDto) {
    const customer = this.customer();
    if (!customer) return;

    this.busy.set(true);
    this.error.set(null);

    const request$ = kind === 'kyc'
      ? this.customerService.reviewKyc(customer.id, docId, dto)
      : this.customerService.reviewLicence(customer.id, docId, dto);

    request$.subscribe({
      next: updated => {
        this.customer.set(updated);
        this.rejecting.set(null);
        this.reason.set('');
        this.busy.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.busy.set(false);
      }
    });
  }
}