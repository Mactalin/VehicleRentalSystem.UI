import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleImageDto } from '../../../core/models/vehicle.models';
import { VehicleService } from '../../../core/services/vehicle.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-vehicle-images',
  imports: [ReactiveFormsModule, StatusBadge],
  templateUrl: './vehicle-images.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleImages {
  private fb = inject(FormBuilder);
  private vehicles = inject(VehicleService);
  private confirm = inject(ConfirmService);

  vehicleId = input.required<number>();
  images = input.required<VehicleImageDto[]>();
  changed = output<void>();   // parent reloads the vehicle

  form = this.fb.nonNullable.group({
    imageUrl: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/^https?:\/\/.+/i)]],
    isPrimary: [false]
  });

  busy = signal(false);
  error = signal<string | null>(null);

  get f() { return this.form.controls; }

  add() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { imageUrl, isPrimary } = this.form.getRawValue();
    this.run(this.vehicles.addImage(this.vehicleId(), imageUrl.trim(), isPrimary), () => this.form.reset());
  }

  setPrimary(image: VehicleImageDto) {
    this.run(this.vehicles.setPrimaryImage(this.vehicleId(), image.id));
  }

  async remove(image: VehicleImageDto) {
    const ok = await this.confirm.confirm({
      title: 'Delete photo',
      message: 'This photo will be removed from the vehicle.',
      confirmText: 'Delete'
    });
    if (ok) this.run(this.vehicles.deleteImage(this.vehicleId(), image.id));
  }

  private run(request$: import('rxjs').Observable<unknown>, onDone?: () => void) {
    this.busy.set(true);
    this.error.set(null);

    request$.subscribe({
      next: () => {
        onDone?.();
        this.busy.set(false);
        this.changed.emit();
      },
      error: err => {
        this.error.set(err.message);
        this.busy.set(false);
      }
    });
  }
}