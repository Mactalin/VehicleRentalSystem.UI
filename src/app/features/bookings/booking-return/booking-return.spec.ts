import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingReturn } from './booking-return';

describe('BookingReturn', () => {
  let component: BookingReturn;
  let fixture: ComponentFixture<BookingReturn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingReturn],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingReturn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
