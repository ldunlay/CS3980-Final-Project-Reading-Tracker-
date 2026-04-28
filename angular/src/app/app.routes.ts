import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./login/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'current-books',
        loadComponent: () =>
          import('./current-books/current-books.component').then((m) => m.CurrentBooksComponent),
      },
      {
        path: 'up-next',
        loadComponent: () =>
          import('./up-next/up-next.component').then((m) => m.UpNextComponent),
      },
      {
        path: 'finished-books',
        loadComponent: () =>
          import('./home/static-shelves.component').then((m) => m.FinishedBooksComponent),
      },
      {
        path: 'favorite-books',
        loadComponent: () =>
          import('./home/static-shelves.component').then((m) => m.FavoriteBooksComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./access-denied/access-denied.component').then((m) => m.AccessDeniedComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
