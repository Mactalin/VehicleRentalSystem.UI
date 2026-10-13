import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserDto } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';

@Component({
  selector: 'app-my-profile',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, PageHeader, StatusBadge, LoadingSpinner],
  templateUrl: './my-profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyProfile implements OnInit {
  private fb = inject(FormBuilder);
  private users = inject(UserService);
  private auth = inject(AuthService);

  profile = signal<UserDto | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    phone: ['', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]]
  });

  initials = computed(() =>
    (this.profile()?.fullName ?? '')
      .split(' ').filter(Boolean).slice(0, 2)
      .map(p => p[0].toUpperCase()).join('') || '?'
  );

  get f() { return this.form.controls; }

  ngOnInit() {
    this.users.getProfile().subscribe({
      next: user => {
        this.profile.set(user);
        this.form.patchValue({ fullName: user.fullName, phone: user.phone ?? '' });
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    const { fullName, phone } = this.form.getRawValue();

    this.users.updateProfile({ fullName, phone: phone || undefined }).subscribe({
      next: user => {
        this.profile.set(user);
        this.auth.updateUser(user);   // refreshes the name in the top bar
        this.form.markAsPristine();
        this.saving.set(false);
        this.success.set(true);
      },
      error: err => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }

  reset() {
    const user = this.profile();
    if (!user) return;
    this.form.reset({ fullName: user.fullName, phone: user.phone ?? '' });
    this.success.set(false);
    this.error.set(null);
  }
}