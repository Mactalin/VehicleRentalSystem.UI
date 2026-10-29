import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BranchDto } from '../../../core/models/branch.models';
import { CategoryDto } from '../../../core/models/category.models';
import { VehicleStatus } from '../../../core/models/enums';
import { VehicleDto } from '../../../core/models/vehicle.models';
import { AuthService } from '../../../core/services/auth.service';
import { BranchService } from '../../../core/services/branch.service';
import { CategoryService } from '../../../core/services/category.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-vehicle-list',
  imports: [RouterLink, DecimalPipe, PageHeader, StatusBadge, EnumLabelPipe],
  templateUrl: './vehicle-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleList implements OnInit {
  private vehicleService = inject(VehicleService);
  private categoryService = inject(CategoryService);
  private branchService = inject(BranchService);
  auth = inject(AuthService);

  statuses: VehicleStatus[] = ['Available', 'Reserved', 'Rented', 'Maintenance'];

  vehicles = signal<VehicleDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  branches = signal<BranchDto[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  // filters
  search = signal('');
  status = signal<VehicleStatus | ''>('');
  branchId = signal<number | null>(null);
  categoryId = signal<number | null>(null);
  includeInactive = signal(false);

  canManage = computed(() => this.auth.hasRole('Admin', 'Manager'));
  canSeeInactive = computed(() => this.auth.hasRole('Admin', 'Manager', 'Staff'));

  // The text search runs in the browser; the other filters are sent to the API
  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.vehicles();
    return this.vehicles().filter(v =>
      `${v.registrationNumber} ${v.make} ${v.model}`.toLowerCase().includes(q));
  });

  ngOnInit() {
    this.categoryService.getAll().subscribe(c => this.categories.set(c));
    this.branchService.getAll().subscribe(b => this.branches.set(b));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.vehicleService.getAll({
      status: this.status() || undefined,
      branchId: this.branchId() ?? undefined,
      categoryId: this.categoryId() ?? undefined,
      includeInactive: this.includeInactive()
    }).subscribe({
      next: list => { this.vehicles.set(list); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  setStatus(value: string) { this.status.set(value as VehicleStatus | ''); this.load(); }
  setBranch(value: string) { this.branchId.set(value ? +value : null); this.load(); }
  setCategory(value: string) { this.categoryId.set(value ? +value : null); this.load(); }
  setInactive(checked: boolean) { this.includeInactive.set(checked); this.load(); }

  clearFilters() {
    this.search.set('');
    this.status.set('');
    this.branchId.set(null);
    this.categoryId.set(null);
    this.includeInactive.set(false);
    this.load();
  }
}