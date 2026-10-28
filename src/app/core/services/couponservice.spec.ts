import { TestBed } from '@angular/core/testing';
import { Couponservice } from './couponservice';

describe('Couponservice', () => {
  let service: Couponservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Couponservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
