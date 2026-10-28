import { TestBed } from '@angular/core/testing';
import { Aditionalservice } from './aditionalservice';

describe('Aditionalservice', () => {
  let service: Aditionalservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aditionalservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
