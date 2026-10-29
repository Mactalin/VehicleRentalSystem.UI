import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdditionalService, ServiceType, CreateAdditionalService } from '../../core/models/additional-service';
import { AdditionalServiceApi } from '../../core/services/aditionalservice';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './service-list.html',
  styleUrls: ['./service-list.css']
})
export class ServiceListComponent implements OnInit {
  services: AdditionalService[] = [];
  loading = signal(true);

  // Modal state
  showModal = false;
  isEdit = false;
  currentId?: number;
  submitting = false;
  error = '';

  serviceTypes: ServiceType[] = ['GPS', 'ChildSeat', 'ExtraInsurance', 'Accessory', 'Other'];

  model: CreateAdditionalService & { isActive: boolean } = {
    name: '',
    description: '',
    price: 0,
    type: 'GPS',
    maxQuantityPerBooking: 1,
    isActive: true
  };

  constructor(private service: AdditionalServiceApi) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.services = data; this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openAddModal(): void {
    this.isEdit = false;
    this.currentId = undefined;
    this.model = { name: '', description: '', price: 0, type: 'GPS', maxQuantityPerBooking: 1, isActive: true };
    this.error = '';
    this.showModal = true;
  }

  openEditModal(s: AdditionalService): void {
    this.isEdit = true;
    this.currentId = s.id;
    this.model = {
      name: s.name,
      description: s.description,
      price: s.price,
      type: s.type,
      maxQuantityPerBooking: s.maxQuantityPerBooking,
      isActive: s.isActive
    };
    this.error = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    this.submitting = true;
    this.error = '';

    if (this.isEdit && this.currentId) {
      this.service.update(this.currentId, this.model).subscribe({
        next: () => { this.closeModal(); this.loadServices(); this.submitting = false; },
        error: (err) => { this.error = err?.error?.detail || 'Update failed.'; this.submitting = false; }
      });
    } else {
      this.service.create(this.model).subscribe({
        next: () => { this.closeModal(); this.loadServices(); this.submitting = false; },
        error: (err) => { this.error = err?.error?.detail || 'Creation failed.'; this.submitting = false; }
      });
    }
  }

  delete(id: number): void {
    if (confirm('Delete this service?')) {
      this.service.delete(id).subscribe(() => this.loadServices());
    }
  }

  getIcon(type: ServiceType): string {
    switch(type) {
      case 'GPS': return 'bi-geo-alt';
      case 'ChildSeat': return 'bi-person-arms-up';
      case 'ExtraInsurance': return 'bi-shield-check';
      case 'Accessory': return 'bi-bag';
      default: return 'bi-box';
    }
  }
}
