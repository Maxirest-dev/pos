import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.routes').then(m => m.LOGIN_ROUTES),
  },
  {
    path: 'salon',
    loadChildren: () => import('./features/salon/salon.routes').then(m => m.SALON_ROUTES),
  },
  {
    path: 'mesa',
    loadChildren: () => import('./features/mesa/mesa.routes').then(m => m.MESA_ROUTES),
  },
  {
    path: 'caja',
    loadComponent: () => import('./features/caja/caja.component').then(m => m.CajaComponent),
  },
  {
    path: 'estadisticas',
    loadComponent: () => import('./features/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent),
  },
  {
    path: 'historial',
    loadComponent: () => import('./features/historial/historial.component').then(m => m.HistorialComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
