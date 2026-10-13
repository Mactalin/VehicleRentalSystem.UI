import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperatingHours } from './operating-hours';

describe('OperatingHours', () => {
  let component: OperatingHours;
  let fixture: ComponentFixture<OperatingHours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatingHours],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatingHours);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
