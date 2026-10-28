import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingPickup } from './booking-pickup';

describe('BookingPickup', () => {
  let component: BookingPickup;
  let fixture: ComponentFixture<BookingPickup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingPickup],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPickup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
