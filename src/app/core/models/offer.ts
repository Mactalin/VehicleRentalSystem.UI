export interface Offer {
  id: number;
  title: string;
  description?: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerImageUrl?: string;
}

export interface CreateOffer {
  title: string;
  description?: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  bannerImageUrl?: string;
}

export interface UpdateOffer extends CreateOffer {
  isActive: boolean;
}
