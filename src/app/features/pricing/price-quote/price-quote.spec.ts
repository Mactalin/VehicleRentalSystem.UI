import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceQuote } from './price-quote';

describe('PriceQuote', () => {
  let component: PriceQuote;
  let fixture: ComponentFixture<PriceQuote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceQuote],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceQuote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
