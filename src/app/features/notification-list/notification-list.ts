import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AppNotification, NotificationEvent } from '../../core/models/notification';
import { NotificationService } from '../../core/services/notificationservice';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './notification-list.html',
  styleUrls: ['./notification-list.css']
})
export class NotificationListComponent implements OnInit {
  notifications: AppNotification[] = [];
  loading = signal(true);
  filter: 'all' | 'unread' = 'all';

  constructor(
    private service: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    const userId = this.auth.currentUser()?.id || 1; // Fallback to 1 for testing

    this.service.getByUser(userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.service.setUnreadCount(this.unreadCount);
        this.loading.set(false);
      },
      error: () => {
        this.service.setUnreadCount(0);
        this.loading.set(false);
      }
    });
  }

  get filteredNotifications(): AppNotification[] {
    if (this.filter === 'unread') {
      return this.notifications.filter(n => !n.isRead);
    }
    return this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation();
    this.service.markAsRead(id).subscribe(() => {
      const n = this.notifications.find(x => x.id === id);
      if (n) {
        n.isRead = true;
        this.service.setUnreadCount(this.unreadCount);
      }
    });
  }

  markAllAsRead(): void {
    const userId = this.auth.currentUser()?.id || 1;
    this.service.markAllAsRead(userId).subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.service.setUnreadCount(0);
    });
  }

  getIcon(evt: NotificationEvent): string {
    switch (evt) {
      case 'BookingConfirmation': return 'bi-calendar-check text-success';
      case 'PaymentConfirmation': return 'bi-credit-card text-primary';
      case 'PickupReminder': return 'bi-car-front text-warning';
      case 'ReturnReminder': return 'bi-clock-history text-warning';
      case 'Cancellation': return 'bi-x-circle text-danger';
      case 'ReviewRequest': return 'bi-star text-warning';
      case 'DriverRegistration': return 'bi-person-check text-success';
      default: return 'bi-bell text-muted';
    }
  }
}
