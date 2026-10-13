import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators
} from '@angular/forms';
import { DayOfWeekName, OperatingHourDto } from '../../../core/models/branch.models';
import { BranchService } from '../../../core/services/branch.service';

const DAYS: DayOfWeekName[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

type DayRow = FormGroup<{
  dayOfWeek: FormControl<DayOfWeekName>;
  isClosed: FormControl<boolean>;
  openTime: FormControl<string>;
  closeTime: FormControl<string>;
}>;

// An open day needs a closing time after the opening time (HH:mm compares correctly as text)
const closeAfterOpen: ValidatorFn = row => {
  const closed = row.get('isClosed')?.value;
  const open = row.get('openTime')?.value;
  const close = row.get('closeTime')?.value;
  return !closed && open && close && close <= open ? { timeOrder: true } : null;
};

@Component({
  selector: 'app-operating-hours',
  imports: [ReactiveFormsModule],
  templateUrl: './operating-hours.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatingHours {
  private fb = inject(FormBuilder);
  private branches = inject(BranchService);

  branchId = input.required<number>();
  hours = input<OperatingHourDto[]>([]);
  changed = output<void>();

  days = this.fb.array<DayRow>([]);
  form = this.fb.group({ days: this.days });

  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor() {
    // Rebuild the seven rows whenever saved hours arrive; missing days get 08:00 - 20:00
    effect(() => {
      const saved = this.hours();
      this.days.clear();
      for (const day of DAYS) {
        const h = saved.find(x => x.dayOfWeek === day);
        this.days.push(this.createRow(day, h));
      }
      this.form.markAsPristine();
    });
  }

  private createRow(day: DayOfWeekName, h?: OperatingHourDto): DayRow {
    return this.fb.nonNullable.group(
      {
        dayOfWeek: [day],
        isClosed: [h?.isClosed ?? false],
        openTime: [(h?.openTime ?? '08:00:00').slice(0, 5), Validators.required],
        closeTime: [(h?.closeTime ?? '20:00:00').slice(0, 5), Validators.required]
      },
      { validators: closeAfterOpen }
    );
  }

  // Copy Monday's hours to every other day
  copyMondayToAll() {
    const monday = this.days.at(0).getRawValue();
    this.days.controls.slice(1).forEach(row =>
      row.patchValue({
        isClosed: monday.isClosed,
        openTime: monday.openTime,
        closeTime: monday.closeTime
      })
    );
    this.form.markAsDirty();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    const body: OperatingHourDto[] = this.days.getRawValue();

    this.branches.setOperatingHours(this.branchId(), body).subscribe({
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