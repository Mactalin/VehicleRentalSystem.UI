import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpiringDocumentDto } from '../../../core/models/vehicle.models';
import { VehicleService } from '../../../core/services/vehicle.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-expiring-documents',
  imports: [RouterLink, DatePipe, PageHeader, StatusBadge, EnumLabelPipe],
  templateUrl: './expiring-documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpiringDocuments implements OnInit {
  private vehicles = inject(VehicleService);

  windows = [15, 30, 60, 90];

  items = signal<ExpiringDocumentDto[]>([]);
  withinDays = signal(30);
  loading = signal(true);
  error = signal<string | null>(null);

  expiredCount = computed(() => this.items().filter(i => i.daysToExpiry < 0).length);
  soonCount = computed(() => this.items().filter(i => i.daysToExpiry >= 0).length);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.vehicles.getExpiringDocuments(this.withinDays()).subscribe({
      next: list => { this.items.set(list); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  setWindow(value: string) {
    this.withinDays.set(+value);
    this.load();
  }

  // Badge tone and text for how urgent a document is
  state(d: ExpiringDocumentDto): { status: string; label: string } {
    const days = d.daysToExpiry;
    if (days < 0) {
      const ago = Math.abs(days);
      return { status: 'Expired', label: `Expired ${ago} ${ago === 1 ? 'day' : 'days'} ago` };
    }
    if (days === 0) return { status: 'Expired', label: 'Expires today' };
    return { status: 'ExpiringSoon', label: `${days} ${days === 1 ? 'day' : 'days'} left` };
  }
}