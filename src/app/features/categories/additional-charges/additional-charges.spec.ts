import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditionalCharges } from './additional-charges';

describe('AdditionalCharges', () => {
  let component: AdditionalCharges;
  let fixture: ComponentFixture<AdditionalCharges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalCharges],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalCharges);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
