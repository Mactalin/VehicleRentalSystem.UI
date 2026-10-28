import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../core/models/dashboard';
import { DashboardService } from '../../core/services/dashboardservice';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;
  loading = true;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        console.log('Dashboard Stats Loaded:', data); // ADD THIS
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
         console.error('❌ Dashboard Error:', err); // ADD THIS
        console.error('Failed to load dashboard stats', err);
        this.stats = undefined;
        this.error = this.getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  private getErrorMessage(err: any): string {
    if (err?.status === 0) {
      return 'Cannot reach the API. Start the backend service or update the API URL in the environment configuration.';
    }

    return err?.error?.detail || err?.error?.title || 'Unable to load dashboard data.';
  }
}
