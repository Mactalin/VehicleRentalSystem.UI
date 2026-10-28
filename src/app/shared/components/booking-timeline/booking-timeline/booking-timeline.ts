import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BookingStatus } from '../../../../core/models/enums';

const STEPS: { status: BookingStatus; label: string }[] = [
  { status: 'Pending', label: 'Booked' },
  { status: 'Confirmed', label: 'Confirmed' },
  { status: 'PickedUp', label: 'Picked up' },
  { status: 'Returned', label: 'Returned' },
  { status: 'Completed', label: 'Completed' }
];

type StepState = 'done' | 'current' | 'todo';

@Component({
  selector: 'app-booking-timeline',
  templateUrl: './booking-timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingTimeline {
  status = input.required<BookingStatus>();

  steps = computed(() => {
    const status = this.status();
    const current = STEPS.findIndex(s => s.status === status);

    return STEPS.map((s, i) => ({
      n: i + 1,
      label: s.label,
      state: (status === 'Completed' || i < current ? 'done' : i === current ? 'current' : 'todo') as StepState
    }));
  });
}