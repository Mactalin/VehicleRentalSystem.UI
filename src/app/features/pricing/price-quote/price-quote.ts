import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { PriceQuoteDto } from '../../../core/models/category.models';
import { VehicleDto } from '../../../core/models/vehicle.models';
import { PricingService } from '../../../core/services/pricing.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';

const MAX_DAYS = 365;

// yyyy-MM-ddTHH:mm in local time, the format <input type="datetime-local"> uses
function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const validRange: ValidatorFn = group => {
  const from = group.get('from')?.value;
  const to = group.get('to')?.value;
  if (!from || !to) return null;

  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (ms <= 0) return { order: true };
  if (ms / 86_400_000 > MAX_DAYS) return { tooLong: true };
  return null;
};

@Component({
  selector: 'app-price-quote',
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe, PageHeader, StatusBadge],
  templateUrl: './price-quote.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceQuote implements OnInit {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private pricing = inject(PricingService);

  // Bound from /pricing?vehicleId=5
  vehicleId = input<string>();

  vehicles = signal<VehicleDto[]>([]);
  quote = signal<PriceQuoteDto | null>(null);
  loadingVehicles = signal(true);
  calculating = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group(
    {
      vehicleId: [0, [Validators.min(1)]],
      from: ['', Validators.required],
      to: ['', Validators.required]
    },
    { validators: validRange }
  );

  get f() { return this.form.controls; }

  ngOnInit() {
    // Defaults: pickup at the next full hour, return 24 hours later
    const start = new Date();
    start.setHours(start.getHours() + 1, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 3_600_000);

    this.form.patchValue({
      from: toLocalInput(start),
      to: toLocalInput(end),
      vehicleId: this.vehicleId() ? +this.vehicleId()! : 0
    });

    this.vehicleService.getAll().subscribe({
      next: list => { this.vehicles.set(list); this.loadingVehicles.set(false); },
      error: err => { this.error.set(err.message); this.loadingVehicles.set(false); }
    });
  }

  calculate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.calculating.set(true);
    this.error.set(null);

    const { vehicleId, from, to } = this.form.getRawValue();

    this.pricing.getQuote(vehicleId, from, to).subscribe({
      next: q => { this.quote.set(q); this.calculating.set(false); },
      error: err => {
        this.quote.set(null);
        this.error.set(err.message);
        this.calculating.set(false);
      }
    });
  }

  // e.g. "1 week, 2 days, 3 hours"
  durationParts(q: PriceQuoteDto): string[] {
    const part = (n: number, one: string) => (n > 0 ? [`${n} ${one}${n === 1 ? '' : 's'}`] : []);
    return [...part(q.weeks, 'week'), ...part(q.days, 'day'), ...part(q.hours, 'hour')];
  }

  // 1.25 -> "+25%", 0.9 -> "-10%"
  percent(multiplier: number): string {
    const pct = Math.round((multiplier - 1) * 100);
    return pct > 0 ? `+${pct}%` : `${pct}%`;
  }

  // The vehicle status shown beside the quote
  selectedVehicle(): VehicleDto | undefined {
    return this.vehicles().find(v => v.id === this.quote()?.vehicleId);
  }
}