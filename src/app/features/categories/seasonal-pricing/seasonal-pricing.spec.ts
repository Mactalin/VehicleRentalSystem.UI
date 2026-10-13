import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeasonalPricing } from './seasonal-pricing';

describe('SeasonalPricing', () => {
  let component: SeasonalPricing;
  let fixture: ComponentFixture<SeasonalPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonalPricing],
    }).compileComponents();

    fixture = TestBed.createComponent(SeasonalPricing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
