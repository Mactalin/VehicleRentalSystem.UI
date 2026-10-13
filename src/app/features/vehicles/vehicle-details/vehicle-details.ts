import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VehicleStatus } from '../../../core/models/enums';
import { VehicleDto } from '../../../core/models/vehicle.models';
import { AuthService } from '../../../core/services/auth.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';
import { VehicleDocuments } from '../vehicle-documents/vehicle-documents';
import { VehicleImages } from '../vehicle-images/vehicle-images';

@Component({
  selector: 'app-vehicle-details',
  imports: [RouterLink, DecimalPipe, PageHeader, StatusBadge, LoadingSpinner, EnumLabelPipe,VehicleImages, VehicleDocuments],
  templateUrl: './vehicle-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleDetails implements OnInit {
  private vehicleService = inject(VehicleService);
  private confirm = inject(ConfirmService);
  private router = inject(Router);
  auth = inject(AuthService);

  id = input.required<string>();   // bound from the route /vehicles/:id

  statuses: VehicleStatus[] = ['Available', 'Reserved', 'Rented', 'Maintenance'];

  vehicle = signal<VehicleDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  activeImage = signal(0);

  canManage = computed(() => this.auth.hasRole('Admin', 'Manager'));
  canChangeStatus = computed(() => this.auth.hasRole('Admin', 'Manager', 'Staff'));

  currentImage = computed(() => {
    const images = this.vehicle()?.images ?? [];
    return images[this.activeImage()] ?? images.find(i => i.isPrimary) ?? images[0] ?? null;
  });

  ngOnInit() { this.load(); }

  load() {
    this.vehicleService.getById(+this.id()).subscribe({
      next: v => {
        this.vehicle.set(v);
        const primary = v.images.findIndex(i => i.isPrimary);
        this.activeImage.set(primary >= 0 ? primary : 0);
        this.loading.set(false);
      },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  changeStatus(status: string) {
    const v = this.vehicle();
    if (!v || status === v.status) return;

    this.error.set(null);
    this.success.set(null);

    this.vehicleService.updateStatus(v.id, status as VehicleStatus).subscribe({
      next: () => { this.success.set('Status updated.'); this.load(); },
      error: err => { this.error.set(err.message); this.load(); }   // reload resets the dropdown
    });
  }

  async remove() {
    const v = this.vehicle();
    if (!v) return;

    const ok = await this.confirm.confirm({
      title: 'Deactivate vehicle',
      message: `${v.registrationNumber} will be removed from the fleet. Existing records are kept.`,
      confirmText: 'Deactivate'
    });
    if (!ok) return;

    this.vehicleService.delete(v.id).subscribe({
      next: () => this.router.navigateByUrl('/vehicles'),
      error: err => this.error.set(err.message)
    });
  }

}