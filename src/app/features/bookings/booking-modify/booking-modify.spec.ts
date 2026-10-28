import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingModify } from './booking-modify';

describe('BookingModify', () => {
  let component: BookingModify;
  let fixture: ComponentFixture<BookingModify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingModify],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingModify);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
