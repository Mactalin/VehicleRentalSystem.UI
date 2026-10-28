import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentSettlement } from './payment-settlement';

describe('PaymentSettlement', () => {
  let component: PaymentSettlement;
  let fixture: ComponentFixture<PaymentSettlement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSettlement],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentSettlement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
