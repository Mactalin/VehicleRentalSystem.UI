import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BranchDto, DayOfWeekName } from '../../../core/models/branch.models';
import { AuthService } from '../../../core/services/auth.service';
import { BranchService } from '../../../core/services/branch.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';

const JS_DAYS: DayOfWeekName[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

@Component({
  selector: 'app-branch-list',
  imports: [RouterLink, PageHeader, StatusBadge],
  templateUrl: './branch-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BranchList implements OnInit {
  private branchService = inject(BranchService);
  private confirm = inject(ConfirmService);
  auth = inject(AuthService);

  branches = signal<BranchDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  search = signal('');

  canManage = computed(() => this.auth.hasRole('Admin', 'Manager'));
  canDelete = computed(() => this.auth.hasRole('Admin'));

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.branches();
    return this.branches().filter(b =>
      `${b.name} ${b.city} ${b.state} ${b.pincode}`.toLowerCase().includes(q));
  });

  ngOnInit() { this.load(); }

  load() {
    this.branchService.getAll().subscribe({
      next: list => { this.branches.set(list); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  // Today's opening hours for the card, e.g. "08:00 - 20:00" or "Closed today"
  today(b: BranchDto): { status: string; label: string } {
    const name = JS_DAYS[new Date().getDay()];
    const h = b.operatingHours.find(x => x.dayOfWeek === name);
    if (!h) return { status: 'Inactive', label: 'Hours not set' };
    if (h.isClosed) return { status: 'Expired', label: 'Closed today' };
    return { status: 'Active', label: `Today ${h.openTime.slice(0, 5)} - ${h.closeTime.slice(0, 5)}` };
  }

  async deactivate(b: BranchDto) {
    const ok = await this.confirm.confirm({
      title: 'Deactivate branch',
      message: `${b.name} will no longer be offered for pickup or drop-off. A branch that still has active vehicles can't be deactivated.`,
      confirmText: 'Deactivate'
    });
    if (!ok) return;

    this.error.set(null);
    this.success.set(null);

    this.branchService.delete(b.id).subscribe({
      next: () => { this.success.set(`${b.name} was deactivated.`); this.load(); },
      error: err => this.error.set(err.message)
    });
  }
}