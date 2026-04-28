import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/">Book Nook</a>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Home
          </a>
          <a routerLink="/current-books" routerLinkActive="active">Current Books</a>
          <a routerLink="/up-next" routerLinkActive="active">Up Next</a>
          <a routerLink="/finished-books" routerLinkActive="active">Finished Books</a>
          <a routerLink="/favorite-books" routerLinkActive="active">Favorite Books</a>
        </nav>
        <button type="button" class="btn btn-outline-light btn-sm" (click)="auth.logout()">
          Sign Out
        </button>
      </aside>

      <main class="content">
        <header class="topbar">
          <div>
            <span class="eyebrow">Reading Tracker</span>
            <h1>Book Nook</h1>
          </div>
          <div class="user-pill">{{ auth.user()?.username }}</div>
        </header>

        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {
  readonly auth = inject(AuthService);
}
