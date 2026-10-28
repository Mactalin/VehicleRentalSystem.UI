import { TestBed } from '@angular/core/testing';
import { Offerservice } from './offerservice';

describe('Offerservice', () => {
  let service: Offerservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Offerservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
