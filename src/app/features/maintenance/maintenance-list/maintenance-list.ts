import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaintenanceDto } from '../../../core/models/maintenance.models';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';

type Tab = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Upcoming';

@Component({
  selector: 'app-maintenance-list',
  imports: [RouterLink, DatePipe, CurrencyPipe, PageHeader, StatusBadge],
  templateUrl: './maintenance-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenanceList implements OnInit {
  private maintenance = inject(MaintenanceService);

  tabs: { key: Tab; label: string }[] = [
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'InProgress', label: 'In progress' },
    { key: 'Upcoming', label: 'Due in 30 days' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' }
  ];

  tab = signal<Tab>('Scheduled');
  records = signal<MaintenanceDto[]>([]);
  search = signal('');
  loading = signal(true);
  error = signal<string | null>(null);

  // The search runs in the browser on the tab's records
  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.records();
    return this.records().filter(r =>
      `${r.registrationNumber ?? ''} ${r.description} ${r.vendorName ?? ''}`.toLowerCase().includes(q));
  });

  ngOnInit() { this.load(); }

  selectTab(tab: Tab) {
    this.tab.set(tab);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    const tab = this.tab();
    const request$ = tab === 'Upcoming'
      ? this.maintenance.getUpcoming(30)
      : this.maintenance.getByStatus(tab);

    request$.subscribe({
      next: list => { this.records.set(list); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}