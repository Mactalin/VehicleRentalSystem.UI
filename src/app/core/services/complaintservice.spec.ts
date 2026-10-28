import { TestBed } from '@angular/core/testing';
import { Complaintservice } from './complaintservice';

describe('Complaintservice', () => {
  let service: Complaintservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Complaintservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
