import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentPay } from './payment-pay';

describe('PaymentPay', () => {
  let component: PaymentPay;
  let fixture: ComponentFixture<PaymentPay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPay],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentPay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
