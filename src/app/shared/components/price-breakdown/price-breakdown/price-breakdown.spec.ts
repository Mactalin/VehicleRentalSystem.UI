import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceBreakdown } from './price-breakdown';

describe('PriceBreakdown', () => {
  let component: PriceBreakdown;
  let fixture: ComponentFixture<PriceBreakdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceBreakdown],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceBreakdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
