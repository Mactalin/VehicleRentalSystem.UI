import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { SeasonalPricingDto } from '../../../core/models/category.models';
import { CategoryService } from '../../../core/services/category.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';

// yyyy-MM-dd strings compare correctly as text; the API allows start == end
const endNotBeforeStart: ValidatorFn = group => {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;
  return start && end && end < start ? { dateOrder: true } : null;
};

@Component({
  selector: 'app-seasonal-pricing',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, StatusBadge],
  templateUrl: './seasonal-pricing.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonalPricing implements OnInit {
  private fb = inject(FormBuilder);
  private categories = inject(CategoryService);
  private confirm = inject(ConfirmService);

  categoryId = input.required<number>();

  seasons = signal<SeasonalPricingDto[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(100)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      multiplier: [1.25, [Validators.required, Validators.min(0.1), Validators.max(10)]],
      isActive: [true]
    },
    { validators: endNotBeforeStart }
  );

  get f() { return this.form.controls; }

  ngOnInit() { this.load(); }

  load() {
    this.categories.getSeasonalPricings(this.categoryId()).subscribe({
      next: list => this.seasons.set(list),
      error: err => this.error.set(err.message)
    });
  }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({ name: '', startDate: '', endDate: '', multiplier: 1.25, isActive: true });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(s: SeasonalPricingDto) {
    this.editingId.set(s.id);
    this.form.reset({
      name: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      multiplier: s.multiplier,
      isActive: s.isActive
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dto = { ...raw, name: raw.name.trim() };

    const id = this.editingId();
    const request$ = id
      ? this.categories.updateSeasonalPricing(this.categoryId(), id, dto)
      : this.categories.addSeasonalPricing(this.categoryId(), dto);

    this.saving.set(true);
    this.error.set(null);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }

  async remove(s: SeasonalPricingDto) {
    const ok = await this.confirm.confirm({
      title: 'Delete season',
      message: `Remove "${s.name}"? Quotes for those dates will go back to the base price.`,
      confirmText: 'Delete'
    });
    if (!ok) return;

    this.categories.deleteSeasonalPricing(this.categoryId(), s.id).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err.message)
    });
  }

  // 1.25 -> "+25%", 0.9 -> "-10%"
  percent(multiplier: number): string {
    const pct = Math.round((multiplier - 1) * 100);
    return pct > 0 ? `+${pct}%` : `${pct}%`;
  }
}