import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BranchDto } from '../../../core/models/branch.models';
import { CategoryDto } from '../../../core/models/category.models';
import { FuelType, TransmissionType } from '../../../core/models/enums';
import { VehicleSearchRequest, VehicleSearchResultDto } from '../../../core/models/vehicle-search.models';
import { BranchService } from '../../../core/services/branch.service';
import { CategoryService } from '../../../core/services/category.service';
import { VehicleSearchService } from '../../../core/services/vehicle-search.service';
import { localInputFromNow, toUtcIso } from '../../../core/utils/date.util';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-vehicle-search',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, PageHeader, LoadingSpinner],
  templateUrl: './vehicle-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleSearch implements OnInit {
  private fb = inject(FormBuilder);
  private searchService = inject(VehicleSearchService);
  private categoryService = inject(CategoryService);
  private branchService = inject(BranchService);

  fuelTypes: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  transmissions: TransmissionType[] = ['Manual', 'Automatic'];
  minDate = localInputFromNow(0);

  categories = signal<CategoryDto[]>([]);
  branches = signal<BranchDto[]>([]);

  results = signal<VehicleSearchResultDto[]>([]);
  page = signal(1);
  totalPages = signal(0);
  totalCount = signal(0);

  // The dates used for the last search, passed on to the detail page
  searched = signal<{ from?: string; to?: string }>({});

  loading = signal(true);
  error = signal<string | null>(null);

  form = this.fb.group({
    from: [''],
    to: [''],
    branchId: [0],
    categoryId: [0],
    fuelType: ['' as FuelType | ''],
    transmission: ['' as TransmissionType | ''],
    minSeatingCapacity: [null as number | null],
    minPrice: [null as number | null],
    maxPrice: [null as number | null]
  });

  ngOnInit() {
    this.categoryService.getAll().subscribe(c => this.categories.set(c.filter(x => x.isActive)));
    this.branchService.getAll().subscribe(b => this.branches.set(b));
    this.search();
  }

  detailQuery() {
    const s = this.searched();
    return s.from && s.to ? { from: s.from, to: s.to } : {};
  }

  search() {
    this.run(1);
  }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.run(page);
  }

  clear() {
    this.form.reset({
      from: '', to: '', branchId: 0, categoryId: 0, fuelType: '', transmission: '',
      minSeatingCapacity: null, minPrice: null, maxPrice: null
    });
    this.run(1);
  }

  private run(page: number) {
    const request = this.buildRequest(page);
    if (!request) return;

    this.loading.set(true);
    this.error.set(null);

    this.searchService.search(request).subscribe({
      next: r => {
        this.results.set(r.items);
        this.page.set(r.page);
        this.totalPages.set(r.totalPages);
        this.totalCount.set(r.totalCount);
        this.searched.set({ from: request.from, to: request.to });
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  private buildRequest(page: number): VehicleSearchRequest | null {
    const v = this.form.getRawValue();

    if (!!v.from !== !!v.to) {
      this.error.set('Choose both a pickup and a return time, or leave both empty.');
      return null;
    }

    let from: string | undefined;
    let to: string | undefined;

    if (v.from && v.to) {
      const start = new Date(v.from);
      const end = new Date(v.to);

      if (start.getTime() < Date.now() - 5 * 60_000) {
        this.error.set('The pickup time cannot be in the past.');
        return null;
      }
      if (end <= start) {
        this.error.set('The return time must be after the pickup time.');
        return null;
      }
      from = toUtcIso(v.from);
      to = toUtcIso(v.to);
    }

    if (v.minPrice != null && v.maxPrice != null && v.minPrice > v.maxPrice) {
      this.error.set('The minimum price cannot be higher than the maximum price.');
      return null;
    }

    return {
      from,
      to,
      branchId: v.branchId || undefined,
      categoryId: v.categoryId || undefined,
      fuelType: v.fuelType || undefined,
      transmission: v.transmission || undefined,
      minSeatingCapacity: v.minSeatingCapacity ?? undefined,
      minPrice: v.minPrice ?? undefined,
      maxPrice: v.maxPrice ?? undefined,
      page,
      pageSize: PAGE_SIZE
    };
  }
}