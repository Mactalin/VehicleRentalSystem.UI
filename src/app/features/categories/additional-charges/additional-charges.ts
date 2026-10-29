import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdditionalChargeDto } from '../../../core/models/category.models';
import { AdditionalChargeType } from '../../../core/models/enums';
import { CategoryService } from '../../../core/services/category.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-additional-charges',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, PageHeader, StatusBadge, EnumLabelPipe],
  templateUrl: './additional-charges.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdditionalCharges implements OnInit {
  private fb = inject(FormBuilder);
  private categories = inject(CategoryService);
  private confirm = inject(ConfirmService);

  chargeTypes: AdditionalChargeType[] = ['LateFee', 'ExtraKm', 'Cleaning', 'Fuel', 'Damage', 'Other'];

  charges = signal<AdditionalChargeDto[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    chargeType: ['LateFee' as AdditionalChargeType, Validators.required],
    amount: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]],
    description: ['', Validators.maxLength(300)],
    isActive: [true]
  });

  get f() { return this.form.controls; }

  ngOnInit() { this.load(); }

  load() {
    this.categories.getAdditionalCharges().subscribe({
      next: list => { this.charges.set(list); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({ name: '', chargeType: 'LateFee', amount: 0, description: '', isActive: true });
    this.clearMessages();
    this.showForm.set(true);
  }

  openEdit(c: AdditionalChargeDto) {
    this.editingId.set(c.id);
    this.form.reset({
      name: c.name,
      chargeType: c.chargeType,
      amount: c.amount,
      description: c.description ?? '',
      isActive: c.isActive
    });
    this.clearMessages();
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dto = { ...raw, name: raw.name.trim(), description: raw.description.trim() || undefined };

    const id = this.editingId();
    const request$ = id
      ? this.categories.updateAdditionalCharge(id, dto)
      : this.categories.addAdditionalCharge(dto);

    this.saving.set(true);
    this.clearMessages();

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.success.set(id ? 'Charge updated.' : 'Charge added.');
        this.load();
      },
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }

  async remove(c: AdditionalChargeDto) {
    const ok = await this.confirm.confirm({
      title: 'Delete charge',
      message: `Remove "${c.name}"? This can't be undone.`,
      confirmText: 'Delete'
    });
    if (!ok) return;

    this.clearMessages();
    this.categories.deleteAdditionalCharge(c.id).subscribe({
      next: () => { this.success.set('Charge deleted.'); this.load(); },
      error: err => this.error.set(err.message)
    });
  }

  private clearMessages() {
    this.error.set(null);
    this.success.set(null);
  }
}