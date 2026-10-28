import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerDto } from '../../../core/models/customer.models';
import { KycDocumentType } from '../../../core/models/enums';
import { CustomerService } from '../../../core/services/customer.service';
import { toLocalInput } from '../../../core/utils/date.util';
import { isHttpUrl } from '../../../core/utils/url.util';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

// yyyy-MM-dd strings compare correctly as plain text
function licenceDates(group: AbstractControl): ValidationErrors | null {
  const issue = group.get('issueDate')?.value as string;
  const expiry = group.get('expiryDate')?.value as string;
  if (!issue || !expiry) return null;

  const today = toLocalInput(new Date()).slice(0, 10);
  const errors: ValidationErrors = {};
  if (issue >= expiry) errors['order'] = true;
  if (expiry <= today) errors['expired'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-customer-documents',
  imports: [ReactiveFormsModule, DatePipe, PageHeader, LoadingSpinner, StatusBadge, EnumLabelPipe],
  templateUrl: './customer-documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDocuments implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private customerService = inject(CustomerService);

  kycTypes: KycDocumentType[] = ['Aadhaar', 'Passport', 'VoterId', 'PanCard'];
  isUrl = isHttpUrl;

  customer = signal<CustomerDto | null>(null);
  loading = signal(true);
  savingKyc = signal(false);
  savingLicence = signal(false);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  kycForm = this.fb.nonNullable.group({
    documentType: ['Aadhaar' as KycDocumentType, Validators.required],
    documentNumber: ['', [Validators.required, Validators.maxLength(50)]],
    filePath: ['', [Validators.required, Validators.maxLength(500)]]
  });

  licenceForm = this.fb.nonNullable.group(
    {
      licenceNumber: ['', [Validators.required, Validators.maxLength(30)]],
      issuingAuthority: ['', Validators.maxLength(150)],
      vehicleClasses: ['', Validators.maxLength(100)],
      issueDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      filePath: ['', [Validators.required, Validators.maxLength(500)]]
    },
    { validators: licenceDates }
  );

  get k() { return this.kycForm.controls; }
  get l() { return this.licenceForm.controls; }

  ngOnInit() {
    this.customerService.getMyStatus().subscribe({
      next: status => {
        // No rental profile yet: that comes first
        if (!status.hasProfile) {
          this.router.navigate(['/customer/profile'], { queryParams: { required: 1 } });
          return;
        }
        this.load();
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  private load() {
    this.customerService.getMine().subscribe({
      next: customer => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  addKyc() {
    const customer = this.customer();
    if (!customer) return;

    if (this.kycForm.invalid) {
      this.kycForm.markAllAsTouched();
      return;
    }

    this.savingKyc.set(true);
    this.error.set(null);
    this.message.set(null);

    const raw = this.kycForm.getRawValue();
    this.customerService.addKyc(customer.id, {
      documentType: raw.documentType,
      documentNumber: raw.documentNumber.trim(),
      filePath: raw.filePath.trim()
    }).subscribe({
      next: () => {
        this.kycForm.reset({ documentType: 'Aadhaar', documentNumber: '', filePath: '' });
        this.message.set('Your ID document was submitted for review.');
        this.savingKyc.set(false);
        this.load();
      },
      error: err => {
        this.error.set(err.message);
        this.savingKyc.set(false);
      }
    });
  }

  addLicence() {
    const customer = this.customer();
    if (!customer) return;

    if (this.licenceForm.invalid) {
      this.licenceForm.markAllAsTouched();
      return;
    }

    this.savingLicence.set(true);
    this.error.set(null);
    this.message.set(null);

    const raw = this.licenceForm.getRawValue();
    this.customerService.addLicence(customer.id, {
      licenceNumber: raw.licenceNumber.trim(),
      issuingAuthority: raw.issuingAuthority.trim(),
      vehicleClasses: raw.vehicleClasses.trim(),
      issueDate: raw.issueDate,
      expiryDate: raw.expiryDate,
      filePath: raw.filePath.trim()
    }).subscribe({
      next: () => {
        this.licenceForm.reset();
        this.message.set('Your driving licence was submitted for review.');
        this.savingLicence.set(false);
        this.load();
      },
      error: err => {
        this.error.set(err.message);
        this.savingLicence.set(false);
      }
    });
  }
}