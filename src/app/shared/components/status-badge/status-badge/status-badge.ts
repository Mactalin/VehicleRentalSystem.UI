import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EnumLabelPipe } from '../../../pipes/enum-label.pipe';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

const TONES: Record<string, Tone> = {
  // Vehicle status
  Available: 'success',
  Reserved: 'warning',
  Rented: 'info',
  Maintenance: 'danger',

  // Maintenance status
  Scheduled: 'info',
  InProgress: 'warning',
  Completed: 'success',
  Cancelled: 'neutral',

  // Generic
  Active: 'success',
  Inactive: 'neutral',
  Expired: 'danger',
  ExpiringSoon: 'warning',

  // Roles
  Admin: 'primary',
  Manager: 'info',
  Staff: 'success',
  Customer: 'neutral',

    // Bookings
  Pending: 'warning',
  Confirmed: 'info',
  PickedUp: 'primary',
  Returned: 'warning',

  // Customers, documents, payments, invoices (Mac)
  Verified: 'success',
  Rejected: 'danger',
  Suspended: 'warning',
  Blocked: 'danger',
  Success: 'success',
  Failed: 'danger',
  Refunded: 'neutral',
  Processed: 'success',
  Paid: 'success',
  Draft: 'neutral',
  Issued: 'info',
};

@Component({
  selector: 'app-status-badge',
  imports: [EnumLabelPipe],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadge {
  status = input.required<string>();
  label = input<string>();   // optional custom text; defaults to the formatted status

  tone = computed<Tone>(() => TONES[this.status()] ?? 'neutral');
}