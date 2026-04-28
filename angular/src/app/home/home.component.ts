import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { BooksService } from '../core/services/books.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-header">
      <div>
        <span class="eyebrow">Library</span>
        <h2>Welcome to Book Nook!</h2>
      </div>
    </section>

    <section class="welcome-panel">
      <img src="homePageImage.jpg" alt="Books and flowers on a desk">
    </section>

    @if (loading()) {
      <div class="loading-row">
        <span class="spinner-border text-primary" aria-hidden="true"></span>
      </div>
    } @else {
      <div class="summary-grid">
        <a class="summary-card" routerLink="/current-books">
          <span>Current Books</span>
          <strong>{{ currentCount() }}</strong>
        </a>
        <a class="summary-card" routerLink="/up-next">
          <span>Up Next</span>
          <strong>{{ upNextCount() }}</strong>
        </a>
      </div>
    }
  `,
})
export class HomeComponent {
  private readonly books = inject(BooksService);
  readonly loading = signal(true);
  readonly currentCount = signal(0);
  readonly upNextCount = signal(0);
  readonly totalCount = computed(() => this.currentCount() + this.upNextCount());

  constructor() {
    forkJoin({
      current: this.books.getCurrentBooks(),
      upNext: this.books.getUpNextBooks(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ current, upNext }) => {
          this.currentCount.set(current.length);
          this.upNextCount.set(upNext.length);
        },
      });
  }
}
