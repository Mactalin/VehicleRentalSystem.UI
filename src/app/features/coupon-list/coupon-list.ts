import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../core/services/couponservice';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';
import { Coupon, CouponValidationResult, DiscountType, CreateCoupon } from '../../core/models/coupon';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './coupon-list.html',
  styleUrls: ['./coupon-list.css']
})
export class CouponListComponent implements OnInit {
  coupons: Coupon[] = [];
  loading = true;

  // Validation Widget State
  validateCode = '';
  validateAmount = 1000;
  validating = false;
  validationResult?: CouponValidationResult;

  // Modal State
  showModal = false;
  submitting = false;
  error = '';

  discountTypes: DiscountType[] = ['Percentage', 'Fixed'];
  model: CreateCoupon = {
    code: '', description: '', discountType: 'Percentage', discountValue: 10,
    maxDiscountAmount: undefined, minOrderAmount: 0,
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
    maxUses: undefined, maxUsesPerCustomer: undefined
  };

  constructor(private service: CouponService) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => { this.coupons = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  validateCoupon(): void {
    if (!this.validateCode) return;
    this.validating = true;
    this.validationResult = undefined;
    this.service.validate({ code: this.validateCode, orderAmount: this.validateAmount }).subscribe({
      next: (res) => { this.validationResult = res; this.validating = false; },
      error: () => { this.validating = false; }
    });
  }

  openAddModal(): void {
    this.model = {
      code: '', description: '', discountType: 'Percentage', discountValue: 10,
      maxDiscountAmount: undefined, minOrderAmount: 0,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      maxUses: undefined, maxUsesPerCustomer: undefined
    };
    this.error = '';
    this.showModal = true;
  }

  save(): void {
    this.submitting = true;
    this.error = '';
    this.service.create(this.model).subscribe({
      next: () => { this.showModal = false; this.loadCoupons(); this.submitting = false; },
      error: (err) => { this.error = err?.error?.detail || 'Failed to create coupon.'; this.submitting = false; }
    });
  }

  delete(id: number): void {
    if (confirm('Delete this coupon?')) {
      this.service.delete(id).subscribe(() => this.loadCoupons());
    }
  }
}
