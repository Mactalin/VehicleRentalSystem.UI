import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReturnDto } from '../../../core/models/booking.models';

@Component({
  selector: 'app-inspection-form',
  imports: [ReactiveFormsModule],
  templateUrl: './inspection-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectionForm implements OnInit {
  private fb = inject(FormBuilder);

  mode = input.required<'pickup' | 'return'>();
  minOdometer = input(0);                    // the return reading cannot be below the pickup reading
  saving = input(false);
  submitLabel = input('Save');

  // Pickup ignores damageCharge (it is sent as 0)
  submitted = output<ReturnDto>();

  localError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    odometerReading: [0, [Validators.required, Validators.min(0)]],
    fuelLevelPercent: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
    damageNotes: ['', Validators.maxLength(1000)],
    photoUrls: ['', Validators.maxLength(2000)],
    damageCharge: [0, [Validators.min(0), Validators.max(10000000)]]
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    if (this.minOdometer() > 0) this.form.patchValue({ odometerReading: this.minOdometer() });
  }

  submit() {
    this.localError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    if (v.odometerReading < this.minOdometer()) {
      this.localError.set(`The odometer cannot be lower than the pickup reading (${this.minOdometer()} km).`);
      return;
    }

    this.submitted.emit({
      odometerReading: v.odometerReading,
      fuelLevelPercent: v.fuelLevelPercent,
      damageNotes: v.damageNotes.trim() || undefined,
      photoUrls: v.photoUrls.trim() || undefined,
      damageCharge: this.mode() === 'return' ? v.damageCharge : 0
    });
  }
}