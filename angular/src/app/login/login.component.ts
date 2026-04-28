import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-view">
      <section class="auth-card">
        <h1>Book Nook</h1>
        <h2>Sign In</h2>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label class="form-label" for="email">Email</label>
          <input id="email" class="form-control" type="email" formControlName="email">

          <label class="form-label mt-3" for="password">Password</label>
          <input id="password" class="form-control" type="password" formControlName="password">

          @if (error()) {
            <div class="alert alert-danger mt-3 mb-0">{{ error() }}</div>
          }

          <button class="btn btn-primary w-100 mt-4" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            }
            Sign In
          </button>
        </form>

        <p class="auth-link">Need an account? <a routerLink="/auth/signup">Sign up</a></p>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth
      .signin(this.form.controls.email.value, this.form.controls.password.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/'),
        error: (err) => this.error.set(err.error?.detail || 'Sign in failed.'),
      });
  }
}
