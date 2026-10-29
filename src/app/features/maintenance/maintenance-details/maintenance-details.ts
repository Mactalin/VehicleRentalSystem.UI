import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MaintenanceDto } from '../../../core/models/maintenance.models';
import { AuthService } from '../../../core/services/auth.service';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-maintenance-details',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, CurrencyPipe, PageHeader, StatusBadge],
  templateUrl: './maintenance-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenanceDetails implements OnInit {
  private fb = inject(FormBuilder);
  private maintenance = inject(MaintenanceService);
  private confirm = inject(ConfirmService);
  private router = inject(Router);
  auth = inject(AuthService);

  id = input.required<string>();   // bound from /maintenance/:id

  record = signal<MaintenanceDto | null>(null);
  totalCost = signal<number | null>(null);
  loading = signal(true);
  busy = signal(false);
  showComplete = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  canDelete = computed(() => this.auth.hasRole('Admin', 'Manager'));

  completeForm = this.fb.nonNullable.group({
    completedDate: ['', Validators.required],
    cost: [0, [Validators.required, Validators.min(0), Validators.max(10000000)]]
  });

  get cf() { return this.completeForm.controls; }

  ngOnInit() { this.load(); }

  load() {
    this.maintenance.getById(+this.id()).subscribe({
      next: r => {
        this.record.set(r);
        this.loading.set(false);
        this.maintenance.getTotalCost(r.vehicleId).subscribe(total => this.totalCost.set(total));
      },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  start() {
    this.run(this.maintenance.updateStatus(+this.id(), 'InProgress'), 'Job started. The vehicle is now in maintenance.');
  }

  async cancel() {
    const ok = await this.confirm.confirm({
      title: 'Cancel maintenance',
      message: 'The job will be marked as cancelled. If it was in progress, the vehicle becomes available again.',
      confirmText: 'Cancel job',
      cancelText: 'Keep it'
    });
    if (ok) this.run(this.maintenance.updateStatus(+this.id(), 'Cancelled'), 'Maintenance cancelled.');
  }

  openComplete() {
    const r = this.record();
    this.completeForm.reset({
      completedDate: new Date().toLocaleDateString('en-CA'),   // today as yyyy-MM-dd
      cost: r?.cost ?? 0
    });
    this.error.set(null);
    this.showComplete.set(true);
  }

  closeComplete() { this.showComplete.set(false); }

  complete() {
    if (this.completeForm.invalid) {
      this.completeForm.markAllAsTouched();
      return;
    }
    this.run(
      this.maintenance.complete(+this.id(), this.completeForm.getRawValue()),
      'Maintenance completed.',
      () => this.showComplete.set(false)
    );
  }

  async remove() {
    const r = this.record();
    if (!r) return;

    const ok = await this.confirm.confirm({
      title: 'Delete record',
      message: 'This maintenance record will be permanently deleted.',
      confirmText: 'Delete'
    });
    if (!ok) return;

    this.maintenance.delete(r.id).subscribe({
      next: () => this.router.navigateByUrl('/maintenance'),
      error: err => this.error.set(err.message)
    });
  }

  private run(request$: import('rxjs').Observable<unknown>, message: string, onDone?: () => void) {
    this.busy.set(true);
    this.error.set(null);
    this.success.set(null);

    request$.subscribe({
      next: () => {
        onDone?.();
        this.busy.set(false);
        this.success.set(message);
        this.load();
      },
      error: err => {
        this.error.set(err.message);
        this.busy.set(false);
      }
    });
  }
}