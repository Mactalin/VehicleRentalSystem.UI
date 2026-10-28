export type ComplaintStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Closed';

export interface Complaint {
  id: number;
  customerId: number;
  customerName?: string;
  bookingId?: number;
  category: string;
  description: string;
  status: ComplaintStatus;
  adminResponse?: string;
  handledByUserId?: number;
  respondedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface CreateComplaint {
  customerId: number;
  bookingId?: number;
  category: string;
  description: string;
}

export interface RespondToComplaint {
  adminResponse: string;
  adminUserId: number;
}
