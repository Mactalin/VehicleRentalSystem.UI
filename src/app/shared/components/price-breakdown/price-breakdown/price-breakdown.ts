import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BookingQuoteDto } from '../../../../core/models/booking.models';

@Component({
  selector: 'app-price-breakdown',
  imports: [CurrencyPipe],
  templateUrl: './price-breakdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceBreakdown {
  quote = input.required<BookingQuoteDto>();

  unit = computed(() => (this.quote().rateType === 'Hourly' ? 'hour' : 'day'));
}