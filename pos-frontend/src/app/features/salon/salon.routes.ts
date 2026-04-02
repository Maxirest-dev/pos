import { Routes } from '@angular/router';

export const SALON_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./salon.component').then(m => m.SalonComponent),
  },
];
