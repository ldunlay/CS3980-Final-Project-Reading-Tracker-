import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { signin_url, signup_url } from '../../api-urls';
import { AppUser } from '../models/app-user.model';

interface SigninResponse {
  message?: string;
  username?: string;
  role?: string;
  access_token?: string;
  expiry?: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

const STORAGE_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userSignal = signal<AppUser | null>(this.readStoredUser());

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => {
    const user = this.userSignal();
    return !!user && user.expiry.getTime() > Date.now();
  });

  signin(email: string, password: string): Observable<SigninResponse> {
    const body = new URLSearchParams({
      username: email,
      password,
    });

    return this.http.post<SigninResponse>(signin_url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).pipe(
      tap((response) => {
        const user: AppUser = {
          username: response.username || email.toLowerCase(),
          role: response.role || 'reader',
          access_token: response.access_token || '',
          expiry: response.expiry ? new Date(response.expiry) : this.defaultExpiry(),
        };

        this.setUser(user);
      }),
    );
  }

  signup(data: SignupRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(signup_url, data);
  }

  setUser(user: AppUser): void {
    this.userSignal.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
    void this.router.navigateByUrl('/auth/signin');
  }

  private readStoredUser(): AppUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AppUser & { expiry: string };
      return {
        ...parsed,
        expiry: new Date(parsed.expiry),
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private defaultExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 8);
    return expiry;
  }
}
