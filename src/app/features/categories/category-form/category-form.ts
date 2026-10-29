import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryDto } from '../../../core/models/category.models';
import { CategoryService } from '../../../core/services/category.service';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { PricingForm } from '../pricing-form/pricing-form';
import { SeasonalPricing } from '../seasonal-pricing/seasonal-pricing';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeader, PricingForm, SeasonalPricing],
  templateUrl: './category-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private categories = inject(CategoryService);

  // Bound from /categories/:id/edit; undefined on /categories/new
  id = input<string>();

  category = signal<CategoryDto | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    isActive: [true]
  });

  get f() { return this.form.controls; }
  get isEdit() { return !!this.id(); }

  ngOnInit() {
    const id = this.id();
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.loadCategory(+id, true);
  }

  // Called after pricing changes so the page shows the saved prices
  reload() {
    const id = this.id();
    if (id) this.loadCategory(+id, false);
  }

  private loadCategory(id: number, fillForm: boolean) {
    this.categories.getById(id).subscribe({
      next: c => {
        this.category.set(c);
        if (fillForm) {
          this.form.patchValue({ name: c.name, description: c.description ?? '', isActive: c.isActive });
        }
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
    this.success.set(null);

    const raw = this.form.getRawValue();
    const dto = {
      name: raw.name.trim(),
      description: raw.description.trim() || undefined,
      isActive: raw.isActive
    };

    const id = this.id();

    if (id) {
      this.categories.update(+id, dto).subscribe({
        next: c => {
          this.category.set(c);
          this.form.markAsPristine();
          this.saving.set(false);
          this.success.set('Category updated.');
        },
        error: err => { this.error.set(err.message); this.saving.set(false); }
      });
    } else {
      this.categories.create(dto).subscribe({
        next: c => this.router.navigate(['/categories', c.id, 'edit']),
        error: err => { this.error.set(err.message); this.saving.set(false); }
      });
    }
  }
}