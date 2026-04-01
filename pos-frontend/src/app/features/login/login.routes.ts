import { Routes } from '@angular/router';

export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-selector/user-selector.component').then(m => m.UserSelectorComponent),
  },
  {
    path: 'pin',
    loadComponent: () => import('./pages/pin-entry/pin-entry.component').then(m => m.PinEntryComponent),
  },
  {
    path: 'turno',
    loadComponent: () => import('./pages/shift-selector/shift-selector.component').then(m => m.ShiftSelectorComponent),
  },
  {
    path: 'confirmar',
    loadComponent: () => import('./pages/shift-confirmation/shift-confirmation.component').then(m => m.ShiftConfirmationComponent),
  },
];
