import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { MaintenanceType } from '../../../core/models/enums';
import { MaintenanceDto, SaveMaintenanceDto } from '../../../core/models/maintenance.models';
import { VehicleDto } from '../../../core/models/vehicle.models';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';

@Component({
  selector: 'app-maintenance-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeader, LoadingSpinner],
  templateUrl: './maintenance-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenanceForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private maintenance = inject(MaintenanceService);
  private vehicleService = inject(VehicleService);

  // Bound from /maintenance/:id/edit and from ?vehicleId=... on /maintenance/new
  id = input<string>();
  vehicleId = input<string>();

  types: MaintenanceType[] = ['Service', 'Repair'];

  vehicles = signal<VehicleDto[]>([]);
  record = signal<MaintenanceDto | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    vehicleId: [0, [Validators.min(1)]],
    type: ['Service' as MaintenanceType, Validators.required],
    scheduledDate: ['', Validators.required],
    cost: [0, [Validators.required, Validators.min(0), Validators.max(10000000)]],
    vendorName: ['', Validators.maxLength(150)],
    description: ['', [Validators.required, Validators.maxLength(500)]]
  });

  get f() { return this.form.controls; }
  get isEdit() { return !!this.id(); }

  ngOnInit() {
    const id = this.id();

    forkJoin({
      vehicles: this.vehicleService.getAll(),
      record: id ? this.maintenance.getById(+id) : of(null)
    }).subscribe({
      next: ({ vehicles, record }) => {
        this.vehicles.set(vehicles);

        if (record) {
          this.record.set(record);
          this.form.patchValue({
            vehicleId: record.vehicleId,
            type: record.type,
            scheduledDate: record.scheduledDate,
            cost: record.cost,
            vendorName: record.vendorName ?? '',
            description: record.description
          });

          // The API allows editing only while the record is still Scheduled
          if (record.status !== 'Scheduled') {
            this.form.disable();
            this.error.set('Only scheduled records can be edited.');
          }
        } else if (this.vehicleId()) {
          this.form.patchValue({ vehicleId: +this.vehicleId()! });
        }

        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const dto: SaveMaintenanceDto = {
      ...raw,
      description: raw.description.trim(),
      vendorName: raw.vendorName.trim() || undefined
    };

    const id = this.id();
    const request$ = id
      ? this.maintenance.update(+id, dto)
      : this.maintenance.create(dto);

    request$.subscribe({
      next: r => this.router.navigate(['/maintenance', r.id]),
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}