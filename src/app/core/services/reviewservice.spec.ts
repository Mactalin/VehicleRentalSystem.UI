import { TestBed } from '@angular/core/testing';
import { Reviewservice } from './reviewservice';

describe('Reviewservice', () => {
  let service: Reviewservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reviewservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
