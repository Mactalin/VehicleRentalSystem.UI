import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PricingDto } from '../../../core/models/category.models';
import { CategoryService } from '../../../core/services/category.service';

const MONEY = [Validators.required, Validators.min(0), Validators.max(1000000)];

@Component({
  selector: 'app-pricing-form',
  imports: [ReactiveFormsModule],
  templateUrl: './pricing-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricingForm {
  private fb = inject(FormBuilder);
  private categories = inject(CategoryService);

  categoryId = input.required<number>();
  pricing = input<PricingDto | null>(null);
  changed = output<void>();   // parent reloads the category

  form = this.fb.nonNullable.group({
    hourlyPrice: [0, MONEY],
    dailyPrice: [0, MONEY],
    weeklyPrice: [0, MONEY],
    securityDeposit: [0, MONEY]
  });

  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor() {
    // Fill the form whenever the saved pricing arrives or changes
    effect(() => {
      const p = this.pricing();
      this.form.reset({
        hourlyPrice: p?.hourlyPrice ?? 0,
        dailyPrice: p?.dailyPrice ?? 0,
        weeklyPrice: p?.weeklyPrice ?? 0,
        securityDeposit: p?.securityDeposit ?? 0
      });
    });
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    this.categories.savePricing(this.categoryId(), this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        this.changed.emit();
      },
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}