import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Offer, CreateOffer } from '../../core/models/offer';
import { OfferService } from '../../core/services/offerservice';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './offer-list.html',
  styleUrls: ['./offer-list.css']
})
export class OfferListComponent implements OnInit {
  offers: Offer[] = [];
  loading = signal(true);

  showModal = false;
  submitting = false;
  error = '';

  model: CreateOffer = {
    title: '', description: '', discountPercentage: 10,
    maxDiscountAmount: undefined,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    bannerImageUrl: ''
  };

  constructor(private service: OfferService) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.offers = data; this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openAddModal(): void {
    this.model = {
      title: '', description: '', discountPercentage: 10,
      maxDiscountAmount: undefined,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
      bannerImageUrl: ''
    };
    this.error = '';
    this.showModal = true;
  }

  save(): void {
    this.submitting = true;
    this.service.create(this.model).subscribe({
      next: () => { this.showModal = false; this.loadOffers(); this.submitting = false; },
      error: (err) => { this.error = err?.error?.detail || 'Failed.'; this.submitting = false; }
    });
  }

  delete(id: number): void {
    if (confirm('Delete this offer?')) {
      this.service.delete(id).subscribe(() => this.loadOffers());
    }
  }
}
