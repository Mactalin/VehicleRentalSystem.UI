import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BranchDto, SaveBranchDto } from '../../../core/models/branch.models';
import { BranchService } from '../../../core/services/branch.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { OperatingHours } from '../operating-hours/operating-hours';

@Component({
  selector: 'app-branch-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeader, LoadingSpinner, OperatingHours],
  templateUrl: './branch-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BranchForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private branches = inject(BranchService);

  // Bound from /branches/:id/edit; undefined on /branches/new
  id = input<string>();

  branch = signal<BranchDto | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    address: ['', [Validators.required, Validators.maxLength(300)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    state: ['', [Validators.required, Validators.maxLength(100)]],
    pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    phone: ['', Validators.pattern(/^$|^[0-9+\-\s()]{7,20}$/)],
    latitude: [null as number | null, [Validators.min(-90), Validators.max(90)]],
    longitude: [null as number | null, [Validators.min(-180), Validators.max(180)]],
    isActive: [true]
  });

  get f() { return this.form.controls; }
  get isEdit() { return !!this.id(); }

  ngOnInit() {
    const id = this.id();
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.loadBranch(+id, true);
  }

  // Called after the operating hours are saved
  reload() {
    const id = this.id();
    if (id) this.loadBranch(+id, false);
  }

  private loadBranch(id: number, fillForm: boolean) {
    this.branches.getById(id).subscribe({
      next: b => {
        this.branch.set(b);
        if (fillForm) {
          this.form.patchValue({
            ...b,
            phone: b.phone ?? '',
            latitude: b.latitude ?? null,
            longitude: b.longitude ?? null
          });
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
    this.success.set(null);

    const raw = this.form.getRawValue();
    const dto: SaveBranchDto = {
      name: raw.name.trim(),
      address: raw.address.trim(),
      city: raw.city.trim(),
      state: raw.state.trim(),
      pincode: raw.pincode.trim(),
      phone: raw.phone.trim() || undefined,
      latitude: raw.latitude ?? undefined,
      longitude: raw.longitude ?? undefined,
      isActive: raw.isActive
    };

    const id = this.id();

    if (id) {
      this.branches.update(+id, dto).subscribe({
        next: b => {
          this.branch.set(b);
          this.form.markAsPristine();
          this.saving.set(false);
          this.success.set('Branch updated.');
        },
        error: err => { this.error.set(err.message); this.saving.set(false); }
      });
    } else {
      this.branches.create(dto).subscribe({
        next: b => this.router.navigate(['/branches', b.id, 'edit']),
        error: err => { this.error.set(err.message); this.saving.set(false); }
      });
    }
  }
}