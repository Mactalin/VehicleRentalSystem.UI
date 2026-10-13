import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryDto } from '../../../core/models/category.models';
import { CategoryService } from '../../../core/services/category.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge/status-badge';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-category-list',
  imports: [RouterLink, CurrencyPipe, PageHeader, StatusBadge, LoadingSpinner],
  templateUrl: './category-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryList implements OnInit {
  private categoryService = inject(CategoryService);
  private confirm = inject(ConfirmService);

  categories = signal<CategoryDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.categoryService.getAll().subscribe({
      next: list => { this.categories.set(list); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  async deactivate(c: CategoryDto) {
    const ok = await this.confirm.confirm({
      title: 'Deactivate category',
      message: `${c.name} will no longer be offered for new vehicles. A category that still has active vehicles can't be deactivated.`,
      confirmText: 'Deactivate'
    });
    if (!ok) return;

    this.clearMessages();
    this.categoryService.delete(c.id).subscribe({
      next: () => { this.success.set(`${c.name} was deactivated.`); this.load(); },
      error: err => this.error.set(err.message)
    });
  }

  activate(c: CategoryDto) {
    this.clearMessages();
    this.categoryService
      .update(c.id, { name: c.name, description: c.description, isActive: true })
      .subscribe({
        next: () => { this.success.set(`${c.name} was activated.`); this.load(); },
        error: err => this.error.set(err.message)
      });
  }

  private clearMessages() {
    this.error.set(null);
    this.success.set(null);
  }
}