import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { DocumentType } from '../../../core/models/enums';
import { VehicleDocumentDto } from '../../../core/models/vehicle.models';
import { VehicleService } from '../../../core/services/vehicle.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';
import { ConfirmService } from '../../../shared/services/confirm.service';

// The API requires the expiry date to be after the issue date
const expiryAfterIssue: ValidatorFn = group => {
  const issue = group.get('issueDate')?.value;
  const expiry = group.get('expiryDate')?.value;
  return issue && expiry && expiry <= issue ? { dateOrder: true } : null;
};

@Component({
  selector: 'app-vehicle-documents',
  imports: [ReactiveFormsModule, DatePipe, StatusBadge, EnumLabelPipe],
  templateUrl: './vehicle-documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleDocuments {
  private fb = inject(FormBuilder);
  private vehicles = inject(VehicleService);
  private confirm = inject(ConfirmService);

  vehicleId = input.required<number>();
  documents = input.required<VehicleDocumentDto[]>();
  canManage = input<boolean>(false);
  changed = output<void>();

  documentTypes: DocumentType[] = [
    'RegistrationCertificate', 'Insurance', 'PollutionCertificate', 'Permit', 'Other'
  ];

  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group(
    {
      documentType: ['Insurance' as DocumentType, Validators.required],
      documentNumber: ['', [Validators.required, Validators.maxLength(100)]],
      issueDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      fileUrl: ['', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/.+)?$/i)]]
    },
    { validators: expiryAfterIssue }
  );

  get f() { return this.form.controls; }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({ documentType: 'Insurance', documentNumber: '', issueDate: '', expiryDate: '', fileUrl: '' });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(d: VehicleDocumentDto) {
    this.editingId.set(d.id);
    this.form.reset({
      documentType: d.documentType,
      documentNumber: d.documentNumber,
      issueDate: d.issueDate,
      expiryDate: d.expiryDate,
      fileUrl: d.fileUrl ?? ''
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dto = {
      ...raw,
      documentNumber: raw.documentNumber.trim(),
      fileUrl: raw.fileUrl.trim() || undefined
    };

    const id = this.editingId();
    const request$ = id
      ? this.vehicles.updateDocument(this.vehicleId(), id, dto)
      : this.vehicles.addDocument(this.vehicleId(), dto);

    this.saving.set(true);
    this.error.set(null);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.changed.emit();
      },
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }

  async remove(d: VehicleDocumentDto) {
    const ok = await this.confirm.confirm({
      title: 'Delete document',
      message: `Remove ${d.documentNumber} from this vehicle?`,
      confirmText: 'Delete'
    });
    if (!ok) return;

    this.vehicles.deleteDocument(this.vehicleId(), d.id).subscribe({
      next: () => this.changed.emit(),
      error: err => this.error.set(err.message)
    });
  }

  // Badge tone and text for a document's expiry state
  docState(d: VehicleDocumentDto): { status: string; label: string } {
    if (d.isExpired) return { status: 'Expired', label: 'Expired' };
    if (d.daysToExpiry <= 30) return { status: 'ExpiringSoon', label: `Expires in ${d.daysToExpiry} days` };
    return { status: 'Active', label: 'Valid' };
  }
}