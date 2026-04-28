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
        <h2>Create Account</h2>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label class="form-label" for="name">Name</label>
          <input id="name" class="form-control" type="text" formControlName="name">

          <label class="form-label mt-3" for="email">Email</label>
          <input id="email" class="form-control" type="email" formControlName="email">

          <label class="form-label mt-3" for="password">Password</label>
          <input id="password" class="form-control" type="password" formControlName="password">

          @if (message()) {
            <div class="alert mt-3 mb-0" [class.alert-success]="success()" [class.alert-danger]="!success()">
              {{ message() }}
            </div>
          }

          <button class="btn btn-primary w-100 mt-4" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            }
            Create Account
          </button>
        </form>

        <p class="auth-link">Already have an account? <a routerLink="/auth/signin">Sign in</a></p>
      </section>
    </main>
  `,
})
export class SignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly message = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.message.set('');

    this.auth
      .signup(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.success.set(true);
          this.message.set(res.message || 'Account created successfully.');
          setTimeout(() => void this.router.navigateByUrl('/auth/signin'), 900);
        },
        error: (err) => {
          this.success.set(false);
          this.message.set(err.error?.detail || 'Sign up failed.');
        },
      });
  }
}
