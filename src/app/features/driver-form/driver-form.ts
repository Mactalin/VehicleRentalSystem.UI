import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DriverService } from '../../core/services/driverservice';
import { NotificationService } from '../../core/services/notificationservice';
import { CreateDriver, Driver, DriverStatus, UpdateDriver } from '../../core/models/driver';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './driver-form.html',
  styleUrls: ['./driver-form.css']
})
export class DriverFormComponent implements OnInit {
  isEdit = false;
  driverId?: number;
  loading = false;
  submitting = false;
  error = '';
  notificationError = '';
  createdDriver?: Driver;

  statuses: DriverStatus[] = ['Available', 'OnDuty', 'OffDuty', 'Inactive'];

  // Ensure the object matches the backend DTO exactly
  model: any = {
    fullName: '',
    licenseNumber: '',
    phone: '',
    email: '',
    licenseExpiryDate: null, // Send null instead of empty string
    experienceYears: 0,
    chargePerDay: 0,
    chargePerHour: 0,
    status: 'Available',
    isActive: true,
    notes: ''
  };

  constructor(
    private service: DriverService,
    private notificationService: NotificationService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.driverId = +id;
      this.loading = true;
      this.service.getById(this.driverId).subscribe({
        next: (data) => {
          // Merge with existing model to ensure no undefined fields
          this.model = { ...this.model, ...data };
          this.loading = false;
        },
        error: () => { this.error = 'Could not load driver data.'; this.loading = false; }
      });
    }
  }

  onSubmit(): void {
    if (this.createdDriver) return;

    this.submitting = true;
    this.error = '';
    this.notificationError = '';

    // Create a clean payload (remove any undefined/empty-string dates)
    const payload = { ...this.model };
    if (!payload.licenseExpiryDate) payload.licenseExpiryDate = null;
    if (!payload.email) payload.email = null;

    if (this.isEdit && this.driverId) {
      this.service.update(this.driverId, payload as UpdateDriver).subscribe({
        next: () => this.router.navigate(['/drivers']),
        error: (err) => { this.error = this.extractError(err); this.submitting = false; }
      });
    } else {
      this.service.create(payload as CreateDriver).subscribe({
        next: (driver) => {
          this.createdDriver = driver;
          this.sendDriverRegistration(driver);
        },
        error: (err) => { this.error = this.extractError(err); this.submitting = false; }
      });
    }
  }

  retryNotification(): void {
    if (this.createdDriver) {
      this.submitting = true;
      this.notificationError = '';
      this.sendDriverRegistration(this.createdDriver);
    }
  }

  private sendDriverRegistration(driver: Driver): void {
    const email = driver.email?.trim();
    const phone = driver.phone?.trim();

    if (!email || !phone) {
      this.notificationError = 'Driver saved, but both an email address and phone number are required to send notifications.';
      this.submitting = false;
      return;
    }

    this.notificationService.trigger({
      userId: this.auth.currentUser()?.id || 1,
      toEmail: email,
      toPhone: phone,
      event: 'DriverRegistration',
      customMessage: `Welcome ${driver.fullName}. You have been added as a driver in the Vehicle Rental System.`
    }).subscribe({
      next: () => this.router.navigate(['/drivers']),
      error: () => {
        this.notificationError = 'Driver saved, but the email and SMS could not be sent. Please try again.';
        this.submitting = false;
      }
    });
  }

  // This will extract the EXACT error from ASP.NET Core
  private extractError(err: any): string {
    if (err?.status === 0) {
      return 'Cannot reach the API. Start the backend service or update the API URL in the environment configuration.';
    }

    if (err?.error?.errors) {
      const firstError = Object.values(err.error.errors)[0];
      if (Array.isArray(firstError)) return firstError[0];
    }
    return err?.error?.detail || err?.error?.title || 'Failed to save driver.';
  }
}
