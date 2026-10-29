import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RevenueReport, BookingReport, VehicleUtilization } from '../../core/models/report';
import { ReportService } from '../../core/services/reportservice';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './report.html',
  styleUrls: ['./report.css']
})
export class ReportsComponent implements OnInit {
  loading = signal(true);

  // Date Range
  fromDate = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  toDate = new Date().toISOString().slice(0, 10);

  revenue?: RevenueReport;
  bookings?: BookingReport;
  utilization: VehicleUtilization[] = [];

  constructor(private service: ReportService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);

    // Fetch Revenue
    this.service.getRevenue(this.fromDate, this.toDate).subscribe(res => {
      this.revenue = res;

      // Fetch Bookings
      this.service.getBookings(this.fromDate, this.toDate).subscribe(b => {
        this.bookings = b;

        // Fetch Utilization
        this.service.getVehicleUtilization().subscribe(u => {
          this.utilization = u;
          this.loading.set(false);
        });
      });
    });
  }
}
