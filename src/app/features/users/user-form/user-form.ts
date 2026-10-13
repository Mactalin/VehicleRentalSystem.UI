import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoleName } from '../../../core/models/enums';
import { UserService } from '../../../core/services/user.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeader],
  templateUrl: './user-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private users = inject(UserService);

  roles: RoleName[] = ['Staff', 'Manager', 'Admin', 'Customer'];

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phone: ['', Validators.pattern(/^$|^[0-9+\-\s()]{7,20}$/)],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    role: ['Staff' as RoleName, Validators.required]
  });

  saving = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();

    this.users.create({
      ...raw,
      fullName: raw.fullName.trim(),
      email: raw.email.trim(),
      phone: raw.phone.trim() || undefined
    }).subscribe({
      next: () => this.router.navigateByUrl('/users'),
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}