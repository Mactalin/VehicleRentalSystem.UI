import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notificationservice';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  showUserPopup = false;
  hasUnreadNotifications = false;
  @ViewChild('userMenu') userMenu?: ElementRef<HTMLElement>;
  private readonly subscriptions = new Subscription();

  constructor(
    public auth: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.hasUnreadNotifications = count > 0;
      })
    );

    this.subscriptions.add(
      this.auth.currentUser$.subscribe(user => {
        if (!user?.id) {
          this.notificationService.setUnreadCount(0);
          return;
        }

        this.notificationService.refreshUnreadCount(user.id).subscribe();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleUserPopup(): void {
    this.showUserPopup = !this.showUserPopup;
  }

  @HostListener('document:click', ['$event'])
  closeUserPopupOnOutsideClick(event: MouseEvent): void {
    if (this.showUserPopup && !this.userMenu?.nativeElement.contains(event.target as Node)) {
      this.showUserPopup = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeUserPopupOnEscape(): void {
    this.showUserPopup = false;
  }
}
