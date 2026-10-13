import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';

const newPasswordsMatch: ValidatorFn = group => {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmNewPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
};

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, PageHeader],
  templateUrl: './change-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePassword {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmNewPassword: ['', Validators.required]
    },
    { validators: newPasswordsMatch }
  );

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  showPassword = signal(false);

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.auth.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset();
        this.loading.set(false);
        this.success.set(true);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}