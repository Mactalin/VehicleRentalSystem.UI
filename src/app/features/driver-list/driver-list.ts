import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DriverService } from '../../core/services/driverservice';
import { Driver } from '../../core/models/driver';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './driver-list.html',
  styleUrls: ['./driver-list.css']
})
export class DriverListComponent implements OnInit {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  loading = true;
  searchTerm = '';

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading = true;
    this.driverService.getAll().subscribe({
      next: (data) => {
        this.drivers = data;
        this.filteredDrivers = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredDrivers = this.drivers.filter(d =>
      d.fullName.toLowerCase().includes(term) ||
      d.licenseNumber.toLowerCase().includes(term) ||
      d.phone.includes(term)
    );
  }

  deleteDriver(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete driver ${name}?`)) {
      this.driverService.delete(id).subscribe(() => this.loadDrivers());
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
