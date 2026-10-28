import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplaintListComponent } from './complain-list';

describe('ComplaintListComponent', () => {
  let component: ComplaintListComponent;
  let fixture: ComponentFixture<ComplaintListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplaintListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
