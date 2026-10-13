import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleImages } from './vehicle-images';

describe('VehicleImages', () => {
  let component: VehicleImages;
  let fixture: ComponentFixture<VehicleImages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleImages],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleImages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
