import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerReview } from './customer-review';

describe('CustomerReview', () => {
  let component: CustomerReview;
  let fixture: ComponentFixture<CustomerReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerReview],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
