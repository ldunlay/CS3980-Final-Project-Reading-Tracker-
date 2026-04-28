import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'signin',
    loadComponent: () => import('../login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('../sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'signin',
  },
];
