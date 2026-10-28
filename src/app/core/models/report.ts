export interface RevenueReport {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  totalBookings: number;
  dataPoints: RevenueDataPoint[];
}
export interface RevenueDataPoint {
  date: string;
  amount: number;
  bookingCount: number;
}

export interface BookingReport {
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  byStatus: BookingStatusCount[];
}
export interface BookingStatusCount { status: string; count: number; }

export interface VehicleUtilization {
  vehicleId: number;
  registrationNumber: string;
  vehicleName: string;
  categoryName: string;
  totalBookings: number;
  utilizationRate: number;
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  verifiedCustomers: number;
  topCustomers: TopCustomer[];
}
export interface TopCustomer {
  customerId: number;
  fullName: string;
  bookingCount: number;
  totalSpent: number;
}

export interface PaymentReport {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  totalTransactions: number;
  dataPoints: PaymentDataPoint[];
}
export interface PaymentDataPoint { date: string; amount: number; count: number; }

export interface MaintenanceReport {
  totalMaintenanceRecords: number;
  totalExpense: number;
  byVehicle: MaintenanceExpense[];
}
export interface MaintenanceExpense {
  vehicleId: number;
  registrationNumber: string;
  totalCost: number;
  recordCount: number;
}

export interface BranchPerformance {
  branchId: number;
  branchName: string;
  city: string;
  totalBookings: number;
  totalRevenue: number;
  vehiclesAvailable: number;
}
