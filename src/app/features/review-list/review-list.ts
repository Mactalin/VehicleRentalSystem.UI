import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Review } from '../../core/models/review';
import { ReviewService } from '../../core/services/reviewservice';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './review-list.html',
  styleUrls: ['./review-list.css']
})
export class ReviewListComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;
  filterRating = 0; // 0 = all

  constructor(private service: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => { this.reviews = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStars(rating: number): string[] {
    // Returns an array like ['bi-star-fill', 'bi-star-fill', 'bi-star', ...]
    return Array(5).fill(0).map((_, i) => i < rating ? 'bi-star-fill' : 'bi-star');
  }

  deleteReview(id: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.service.delete(id).subscribe(() => this.loadReviews());
    }
  }
}
