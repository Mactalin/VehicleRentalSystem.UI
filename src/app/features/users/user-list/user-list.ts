import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserDto } from '../../../core/models/auth.models';
import { RoleName } from '../../../core/models/enums';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink, DatePipe, PageHeader, StatusBadge, LoadingSpinner],
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserList implements OnInit {
  private userService = inject(UserService);
  private confirm = inject(ConfirmService);
  auth = inject(AuthService);

  roles: RoleName[] = ['Admin', 'Manager', 'Staff', 'Customer'];

  users = signal<UserDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  search = signal('');
  roleFilter = signal<RoleName | ''>('');
  statusFilter = signal<'' | 'active' | 'inactive'>('');

  isAdmin = computed(() => this.auth.hasRole('Admin'));
  myId = computed(() => this.auth.user()?.id ?? 0);

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return this.users().filter(u =>
      (!q || `${u.fullName} ${u.email} ${u.phone ?? ''}`.toLowerCase().includes(q)) &&
      (!role || u.role === role) &&
      (!status || (status === 'active') === u.isActive));
  });

  ngOnInit() { this.load(); }

  load() {
    this.userService.getAll().subscribe({
      next: list => { this.users.set(list); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
  }

  async changeRole(u: UserDto, select: HTMLSelectElement) {
    const role = select.value as RoleName;
    if (role === u.role) return;

    const ok = await this.confirm.confirm({
      title: 'Change role',
      message: `Change ${u.fullName} from ${u.role} to ${role}? Their permissions change the next time they sign in.`,
      confirmText: 'Change role',
      tone: 'primary'
    });

    if (!ok) {
      select.value = u.role;   // put the dropdown back
      return;
    }

    this.clearMessages();
    this.userService.updateRole(u.id, { role }).subscribe({
      next: () => { this.success.set(`${u.fullName} is now ${role}.`); this.load(); },
      error: err => { this.error.set(err.message); select.value = u.role; }
    });
  }

  async toggleActive(u: UserDto) {
    if (u.isActive) {
      const ok = await this.confirm.confirm({
        title: 'Deactivate account',
        message: `${u.fullName} will no longer be able to sign in. Their records are kept.`,
        confirmText: 'Deactivate'
      });
      if (!ok) return;
    }

    this.clearMessages();
    const request$ = u.isActive
      ? this.userService.deactivate(u.id)
      : this.userService.activate(u.id);

    request$.subscribe({
      next: () => {
        this.success.set(`${u.fullName} was ${u.isActive ? 'deactivated' : 'activated'}.`);
        this.load();
      },
      error: err => this.error.set(err.message)
    });
  }

  clearFilters() {
    this.search.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
  }

  private clearMessages() {
    this.error.set(null);
    this.success.set(null);
  }
}