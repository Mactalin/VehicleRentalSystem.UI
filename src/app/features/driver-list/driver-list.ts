import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DriverService } from '../../core/services/driverservice';
import { Driver } from '../../core/models/driver';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './driver-list.html',
  styleUrls: ['./driver-list.css']
})
export class DriverListComponent implements OnInit {
  drivers = signal<Driver[] | null>(null);
  loadError = signal('');
  actionError = signal('');
  searchTerm = signal('');
  filteredDrivers = computed(() => {
    const drivers = this.drivers() ?? [];
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return drivers;

    return drivers.filter(driver =>
      driver.fullName.toLowerCase().includes(term) ||
      driver.licenseNumber.toLowerCase().includes(term) ||
      driver.phone.includes(term)
    );
  });

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loadError.set('');
    this.driverService.getAll().subscribe({
      next: (data) => {
        this.drivers.set(data);
      },
      error: (err) => {
        this.loadError.set(err?.name === 'TimeoutError'
          ? 'Loading drivers took longer than 3 seconds. Please try again.'
          : err?.message || 'Could not load drivers.');
      }
    });
  }

  deleteDriver(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete driver ${name}?`)) {
      this.actionError.set('');
      this.driverService.delete(id).subscribe({
        next: () => this.loadDrivers(),
        error: (err) => {
          this.actionError.set(err?.name === 'TimeoutError'
            ? 'Deleting the driver took longer than 3 seconds. Check the list before trying again.'
            : err?.message || 'Could not delete driver.');
        }
      });
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Available': return 'vr-badge-success';
      case 'OnDuty': return 'vr-badge-primary';
      case 'OffDuty': return 'vr-badge-warning';
      default: return 'vr-badge-neutral';
    }
  }
}
