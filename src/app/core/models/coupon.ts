export type DiscountType = 'Percentage' | 'Fixed';
export type CouponStatus = 'Active' | 'Expired' | 'UsedUp' | 'Disabled';

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  validFrom: string;
  validTo: string;
  maxUses?: number;
  usedCount: number;
  maxUsesPerCustomer?: number;
  status: CouponStatus;
  isActive: boolean;
}

export interface CreateCoupon {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  validFrom: string;
  validTo: string;
  maxUses?: number;
  maxUsesPerCustomer?: number;
}

export interface ValidateCoupon {
  code: string;
  orderAmount: number;
  customerId?: number;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  discountAmount: number;
  couponId?: number;
  code?: string;
}
