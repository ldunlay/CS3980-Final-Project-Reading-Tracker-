import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="auth-view">
      <section class="auth-card">
        <h1>Access Denied</h1>
        <h2>You do not have permission to view this page.</h2>
        <a class="btn btn-primary w-100 mt-3" routerLink="/">Go Home</a>
      </section>
    </main>
  `,
})
export class AccessDeniedComponent {}
