export interface Review {
  id: number;
  bookingId: number;
  customerId: number;
  customerName?: string;
  vehicleId?: number;
  driverId?: number;
  driverName?: string;
  rating: number;
  comment?: string;
  isVerifiedBooking: boolean;
  postedAt: string;
}

export interface CreateReview {
  bookingId: number;
  customerId: number;
  vehicleId?: number;
  driverId?: number;
  rating: number;
  comment?: string;
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}
