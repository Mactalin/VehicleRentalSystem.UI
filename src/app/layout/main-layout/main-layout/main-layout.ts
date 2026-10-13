import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { RoleName } from '../../../core/models/enums';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';

interface NavItem {
  label: string;
  path: string;
  icon: string;          // SVG path data
  roles?: RoleName[];    // omitted = every logged-in user
  exact?: boolean;
  excludes?: string[];   // paths that should not highlight this item
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const ICONS = {
  car: 'M5 17h14M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M3 17v-5l2-5h14l2 5v5M3 12h18',
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',
  quote: 'M4 4h16v16H4zM8 8h8M8 12h2M14 12h2M8 16h2M14 16h2',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
  tag: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
  users: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  fileAlert: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M12 12v4M12 18h.01',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 6h18M3 12h18M3 18h18'
};

// Add Mac's and Lenin's pages here later (Bookings, Customers, Payments, Offers, Reports...)
const NAV: NavGroup[] = [
  {
    label: 'Fleet',
    items: [
      { label: 'Vehicles', path: '/vehicles', icon: ICONS.car, excludes: ['/vehicles/expiring-documents'] },
      { label: 'Branches', path: '/branches', icon: ICONS.building },
      { label: 'Price quote', path: '/pricing', icon: ICONS.quote }
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Maintenance', path: '/maintenance', icon: ICONS.wrench, roles: ['Admin', 'Manager', 'Staff'] },
      { label: 'Document expiry', path: '/vehicles/expiring-documents', icon: ICONS.fileAlert,
        roles: ['Admin', 'Manager', 'Staff'], exact: true }
    ]
  },
  {
    label: 'Administration',
    items: [
      { label: 'Categories & pricing', path: '/categories', icon: ICONS.tag, roles: ['Admin', 'Manager'] },
      { label: 'Users', path: '/users', icon: ICONS.users, roles: ['Admin', 'Manager'] }
    ]
  }
];

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, ConfirmDialog, StatusBadge],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayout {
  auth = inject(AuthService);
  private router = inject(Router);

  icons = ICONS;
  menuOpen = signal(false);

  private url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // Only the groups and links the current role is allowed to see
  groups = computed(() => {
    const role = this.auth.role();
    return NAV
      .map(g => ({
        ...g,
        items: g.items.filter(i => !i.roles || (role !== null && i.roles.includes(role)))
      }))
      .filter(g => g.items.length > 0);
  });

  initials = computed(() => {
    const name = this.auth.user()?.fullName ?? '';
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
  });

  firstName = computed(() => (this.auth.user()?.fullName ?? '').split(' ')[0]);

  isActive(item: NavItem): boolean {
    const url = this.url().split('?')[0];
    if (item.excludes?.some(e => url === e || url.startsWith(e + '/'))) return false;
    return item.exact ? url === item.path : url === item.path || url.startsWith(item.path + '/');
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
  logout() { this.auth.logout(); }
}