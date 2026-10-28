import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { BranchDto } from '../../../core/models/branch.models';
import { CategoryDto } from '../../../core/models/category.models';
import { FuelType, TransmissionType } from '../../../core/models/enums';
import { SaveVehicleDto } from '../../../core/models/vehicle.models';
import { BranchService } from '../../../core/services/branch.service';
import { CategoryService } from '../../../core/services/category.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';

@Component({
  selector: 'app-vehicle-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeader, LoadingSpinner],
  templateUrl: './vehicle-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);
  private categoryService = inject(CategoryService);
  private branchService = inject(BranchService);

  // Bound from /vehicles/:id/edit; undefined on /vehicles/new
  id = input<string>();

  fuelTypes: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  transmissions: TransmissionType[] = ['Manual', 'Automatic'];

  categories = signal<CategoryDto[]>([]);
  branches = signal<BranchDto[]>([]);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    registrationNumber: ['', [Validators.required, Validators.maxLength(20)]],
    categoryId: [0, [Validators.min(1)]],
    branchId: [0, [Validators.min(1)]],
    make: ['', [Validators.required, Validators.maxLength(100)]],
    model: ['', [Validators.required, Validators.maxLength(100)]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1990), Validators.max(2100)]],
    color: ['', Validators.maxLength(50)],
    fuelType: ['Petrol' as FuelType, Validators.required],
    transmission: ['Manual' as TransmissionType, Validators.required],
    seatingCapacity: [5, [Validators.required, Validators.min(1), Validators.max(60)]],
    odometerKm: [0, [Validators.required, Validators.min(0)]],
    dailyRate: [0, [Validators.required, Validators.min(0)]]
  });

  get f() { return this.form.controls; }
  get isEdit() { return !!this.id(); }

  ngOnInit() {
    const id = this.id();

    forkJoin({
      categories: this.categoryService.getAll(),
      branches: this.branchService.getAll(),
      vehicle: id ? this.vehicleService.getById(+id) : of(null)
    }).subscribe({
      next: ({ categories, branches, vehicle }) => {
        // Hide deactivated categories, except the one this vehicle already uses
        this.categories.set(categories.filter(c => c.isActive || c.id === vehicle?.categoryId));
        this.branches.set(branches);

        if (vehicle) {
          this.form.patchValue({ ...vehicle, color: vehicle.color ?? '' });
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
    const dto: SaveVehicleDto = {
      ...raw,
      registrationNumber: raw.registrationNumber.trim().toUpperCase(),
      make: raw.make.trim(),
      model: raw.model.trim(),
      color: raw.color.trim() || undefined
    };

    const id = this.id();
    const request$ = id
      ? this.vehicleService.update(+id, dto)
      : this.vehicleService.create(dto);

    request$.subscribe({
      next: vehicle => this.router.navigate(['/vehicles', vehicle.id]),
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}