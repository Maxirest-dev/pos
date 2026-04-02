import { Routes } from '@angular/router';

export const MESA_ROUTES: Routes = [
  {
    path: ':numero',
    loadComponent: () => import('./mesa.component').then(m => m.MesaComponent),
  },
];
