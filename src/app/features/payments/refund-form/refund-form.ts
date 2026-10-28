import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentDto } from '../../../core/models/payment.models';
import { PaymentService } from '../../../core/services/payment.service';
import { methodLabel, refundableAmount } from '../../../core/utils/payment.util';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-refund-form',
  imports: [ReactiveFormsModule, DatePipe, CurrencyPipe, PageHeader, LoadingSpinner, StatusBadge, EnumLabelPipe],
  templateUrl: './refund-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundForm implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private confirm = inject(ConfirmService);

  // Optional: /payments/refunds?bookingId=12 opens with that booking's payments already loaded
  bookingId = input<string>();

  methodLabel = methodLabel;
  refundable = refundableAmount;

  lookup = this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]);

  form = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    reason: ['', [Validators.required, Validators.maxLength(300)]]
  });

  payments = signal<PaymentDto[]>([]);
  searched = signal<number | null>(null);
  selected = signal<PaymentDto | null>(null);

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  maxAmount = computed(() => {
    const p = this.selected();
    return p ? refundableAmount(p) : 0;
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    const id = this.bookingId();
    if (id && +id > 0) {
      this.lookup.setValue(+id);
      this.find();
    }
  }

  find() {
    if (this.lookup.invalid) {
      this.lookup.markAsTouched();
      return;
    }

    const id = this.lookup.value!;
    this.loading.set(true);
    this.error.set(null);
    this.selected.set(null);

    this.paymentService.getByBooking(id).subscribe({
      next: list => {
        this.payments.set(list);
        this.searched.set(id);
        this.loading.set(false);
      },
      error: err => {
        this.payments.set([]);
        this.searched.set(null);
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  select(payment: PaymentDto) {
    this.selected.set(payment);
    this.form.reset({ amount: refundableAmount(payment), reason: '' });
    this.error.set(null);
    this.message.set(null);
  }

  cancel() {
    this.selected.set(null);
  }

  async submit() {
    const payment = this.selected();
    if (!payment) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { amount, reason } = this.form.getRawValue();
    const max = this.maxAmount();

    if (amount > max) {
      this.error.set(`The most that can be refunded on this payment is \u20B9${max.toFixed(2)}.`);
      return;
    }

    const ok = await this.confirm.confirm({
      title: 'Issue this refund?',
      message: `\u20B9${amount.toFixed(2)} will be refunded for payment #${payment.id}. This cannot be undone.`,
      confirmText: 'Issue refund'
    });
    if (!ok) return;

    this.saving.set(true);
    this.error.set(null);
    this.message.set(null);

    this.paymentService.refund({
      paymentId: payment.id,
      amount: Math.round(amount * 100) / 100,
      reason: reason.trim()
    }).subscribe({
      next: () => {
        this.message.set(`Refunded \u20B9${amount.toFixed(2)}.`);
        this.saving.set(false);
        this.find();    // reload so the new refund shows up
      },
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}