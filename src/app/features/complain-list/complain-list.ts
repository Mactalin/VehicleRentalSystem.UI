import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Complaint, ComplaintStatus } from '../../core/models/complaint';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintService } from '../../core/services/complaintservice';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './complain-list.html',
  styleUrls: ['./complain-list.css']
})
export class ComplaintListComponent implements OnInit {
  complaints: Complaint[] = [];
  loading = signal(true);

  // Modal State
  showModal = false;
  selectedComplaint?: Complaint;
  adminResponse = '';
  submitting = false;
  error = '';

  constructor(private service: ComplaintService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.complaints = data; this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getBadgeClass(status: ComplaintStatus): string {
    switch (status) {
      case 'Pending': return 'vr-badge-warning';
      case 'InProgress': return 'vr-badge-info';
      case 'Resolved': return 'vr-badge-success';
      case 'Closed': return 'vr-badge-neutral';
      default: return 'vr-badge-neutral';
    }
  }

  openRespondModal(c: Complaint): void {
    this.selectedComplaint = c;
    this.adminResponse = c.adminResponse || '';
    this.error = '';
    this.showModal = true;
  }

  submitResponse(): void {
    if (!this.selectedComplaint || !this.adminResponse) return;
    this.submitting = true;

    const adminUserId = this.auth.user()?.id || 1;

    this.service.respond(this.selectedComplaint.id, {
      adminResponse: this.adminResponse,
      adminUserId
    }).subscribe({
      next: () => { this.showModal = false; this.loadComplaints(); this.submitting = false; },
      error: (err) => { this.error = err?.error?.detail || 'Failed to respond.'; this.submitting = false; }
    });
  }

  resolve(id: number): void {
    if (confirm('Mark this complaint as Resolved?')) {
      this.service.resolve(id).subscribe(() => this.loadComplaints());
    }
  }
}
