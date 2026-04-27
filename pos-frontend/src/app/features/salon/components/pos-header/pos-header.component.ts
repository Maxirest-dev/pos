import { Component, inject, signal, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface Notification {
  id: string;
  tipo: 'cocina' | 'demorado' | 'alerta' | 'mesa' | 'cuenta';
  titulo: string;
  mensaje: string;
  tiempo: string;
  read: boolean;
}

@Component({
  selector: 'app-pos-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="pos-header">
      <div class="pos-header__left">
        <a class="pos-header__logo" routerLink="/salon" routerLinkActive="pos-header__logo--active" title="Salón" aria-label="Ir al salón">
          <svg class="logo-svg" viewBox="0 0 558 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g class="wordmark">
              <path d="M281.7,96.2q-.4-6-.86-12.12t-1-11.76c-.34-3.74-.68-7-1-9.75s-.64-4.71-.91-5.85a3.63,3.63,0,0,0-1.77-2.48,7.67,7.67,0,0,0-3.68-.75,14.83,14.83,0,0,0-2.63.25,7.43,7.43,0,0,0-2.32.76q-3,7-7.42,16.86T251.3,92h-.4q-2.33-5.35-4.85-11.41T240.9,68.43q-2.62-6.06-5.25-11.21a6.18,6.18,0,0,0-2.52-2.82,7.89,7.89,0,0,0-3.94-.91,9.29,9.29,0,0,0-3.44.6,8.45,8.45,0,0,0-2.32,1.32q-.51,5.66-1.06,12.67t-1.06,14.24q-.51,7.22-.86,13.58c-.23,4.24-.44,7.82-.6,10.75s-.25,4.8-.25,5.6a3.62,3.62,0,0,0,.9,2.58,4.2,4.2,0,0,0,3.13,1,10.39,10.39,0,0,0,2.07-.2,14.32,14.32,0,0,0,1.57-.41q.51-7.26.86-13.68T228.89,89c.26-4.07.52-8.3.75-12.67s.46-9.09.66-14.14h.4q2.43,6.17,6.41,15.55t9.34,20.7a3.15,3.15,0,0,0,1.77,1.62,7.83,7.83,0,0,0,2.88.5,7.74,7.74,0,0,0,2.57-.4,7.24,7.24,0,0,0,1.87-.91q6-13.83,9.8-22.57t6.06-14.29h.4q.3,5.06.71,13t1,17.52q.55,9.54,1.16,19.33A3.5,3.5,0,0,0,276,115a4.75,4.75,0,0,0,2.68.76,8.16,8.16,0,0,0,2.32-.3,7.66,7.66,0,0,0,1.92-.91q-.11-2.83-.46-7.63C282.22,103.76,282,100.17,281.7,96.2Z"/>
              <path d="M324.71,71.16q-5.15-3.94-13.93-3.94a36.49,36.49,0,0,0-7.63.76,24.74,24.74,0,0,0-6.31,2.17q-2.93,1.41-2.93,4a3.45,3.45,0,0,0,.66,2A8.73,8.73,0,0,0,296,77.82a42.87,42.87,0,0,1,6.72-2.72,25.74,25.74,0,0,1,7.93-1.22,13.07,13.07,0,0,1,8.17,2.33c2,1.55,3,4,3,7.37v2.83l-14.33,1.41q-7.79.71-12.17,4.19t-4.39,10q0,7.06,5.2,10.8t14.69,3.74a34.4,34.4,0,0,0,9.09-1.11,31,31,0,0,0,6.46-2.43,8.38,8.38,0,0,0,2.57-2.17,5.64,5.64,0,0,0,.86-3.38V83.58Q329.86,75.09,324.71,71.16Zm-2.83,36.25a16.06,16.06,0,0,1-4,1.66,24,24,0,0,1-7,.86c-3.91,0-6.85-.7-8.84-2.12a6.8,6.8,0,0,1-3-5.85,6.54,6.54,0,0,1,2.53-5.56q2.52-1.92,7.77-2.32l12.52-1.31Z"/>
              <path d="M362.57,91.42l5.81-7q3.58-4.35,7-8.59a12,12,0,0,0,1.46-2.32,5,5,0,0,0,.46-2.12,3.13,3.13,0,0,0-1.21-2.58,5.3,5.3,0,0,0-3.33-1h-.51a2.58,2.58,0,0,0-.61.1q-3.82,5.55-7.47,10.2-3,3.89-6.44,8.27c-1.67-2.14-3.3-4.35-4.87-6.61Q349.55,75,346.52,71a12.59,12.59,0,0,0-2-2.28,4.06,4.06,0,0,0-2.72-.85,3.71,3.71,0,0,0-2.73,1.11,6,6,0,0,0-1.52,3.13q4.05,5.15,7.88,10,3.51,4.44,7.52,9.29-2.82,3.56-5.8,7c-2.7,3.13-5.25,6.31-7.68,9.54a10.69,10.69,0,0,0-1.66,2.53,4.65,4.65,0,0,0-.36,1.71,3.23,3.23,0,0,0,1.16,2.53,5.23,5.23,0,0,0,3.49,1h1.41q3.64-5.06,7.58-10.35c2.23-3,4.41-5.92,6.54-8.76q2.31,3.18,4.82,6.69l6.41,9a14.88,14.88,0,0,0,2.52,2.68,4.34,4.34,0,0,0,2.73.86,4,4,0,0,0,2.93-1.11,4.88,4.88,0,0,0,1.31-3Q374.19,106.29,370,101,366.27,96.26,362.57,91.42Z"/>
              <path d="M390.34,53.85a5.14,5.14,0,0,0-3.73,1.47,5,5,0,0,0,0,7.17A5.18,5.18,0,0,0,390.34,64a5.05,5.05,0,1,0,0-10.1Z"/>
              <path d="M393.32,68.89a4.91,4.91,0,0,0-3.18-.86,9.69,9.69,0,0,0-2.27.25,12.75,12.75,0,0,0-1.56.45v43.32a3.27,3.27,0,0,0,1.11,2.78,5.2,5.2,0,0,0,3.23.86,9.54,9.54,0,0,0,2.22-.25,11.52,11.52,0,0,0,1.51-.46V71.76A3.48,3.48,0,0,0,393.32,68.89Z"/>
              <path d="M425.85,67.22a37.71,37.71,0,0,0-10.09,1.26,26,26,0,0,0-7.17,3,9.33,9.33,0,0,0-2.88,2.68,6.86,6.86,0,0,0-.86,3.68v34.23a3.29,3.29,0,0,0,1.11,2.78,5.22,5.22,0,0,0,3.23.86,9.54,9.54,0,0,0,2.22-.25,11.76,11.76,0,0,0,1.52-.46V77.22a25.41,25.41,0,0,1,5.86-2.28A31.72,31.72,0,0,1,427,74a25.16,25.16,0,0,1,3.24.2c1.07.13,1.95.27,2.62.4a4.57,4.57,0,0,0,.81-1.46,5.64,5.64,0,0,0,.3-1.87Q433.93,67.22,425.85,67.22Z"/>
              <path d="M469.32,69.85a21.87,21.87,0,0,0-10.85-2.63,23.89,23.89,0,0,0-9,1.67,20.11,20.11,0,0,0-7.12,4.79,22.07,22.07,0,0,0-4.64,7.63,29.32,29.32,0,0,0-1.67,10.24,28.12,28.12,0,0,0,3.08,13.69,19.9,19.9,0,0,0,8.79,8.43,30.07,30.07,0,0,0,13.48,2.83,29.67,29.67,0,0,0,8-1,17.15,17.15,0,0,0,5.76-2.68,4.6,4.6,0,0,0,2.17-3.58,3.79,3.79,0,0,0-.66-2.18,6,6,0,0,0-1.76-1.66,22.39,22.39,0,0,1-5.46,3,20,20,0,0,1-7.67,1.41q-8,0-12.57-4.19a16.39,16.39,0,0,1-4.83-9l31.13-4.36a4.68,4.68,0,0,0,2.83-1.16,4.25,4.25,0,0,0,1-3.18,21.26,21.26,0,0,0-2.68-10.75A19,19,0,0,0,469.32,69.85ZM443.94,90.27q.21-7.74,4.08-12a13.36,13.36,0,0,1,10.35-4.5q6.06,0,9.49,3.59a14.23,14.23,0,0,1,3.84,9.14Z"/>
              <path d="M507.14,88.53l-7-1.72a9.85,9.85,0,0,1-5-2.47,5.53,5.53,0,0,1-1.56-3.89,5.44,5.44,0,0,1,2.72-4.85,13.35,13.35,0,0,1,7.17-1.72,22,22,0,0,1,5.56.66,21.69,21.69,0,0,1,4.39,1.62,35.33,35.33,0,0,1,3.08,1.76,4.06,4.06,0,0,0,1.77-1.51,4.22,4.22,0,0,0,.65-2.32,4.37,4.37,0,0,0-2-3.39,15.24,15.24,0,0,0-5.5-2.52,31.82,31.82,0,0,0-8.28-1q-8.88,0-13.23,3.94a12.16,12.16,0,0,0-4.34,9.29,11.46,11.46,0,0,0,2.83,7.92q2.82,3.18,9,4.7l8.39,2.22A10.2,10.2,0,0,1,511,98a6.71,6.71,0,0,1,1.76,4.79q0,7.08-10.5,7.07a20.28,20.28,0,0,1-8.28-1.61,37.87,37.87,0,0,1-6.36-3.54,4.82,4.82,0,0,0-2,1.87,4.75,4.75,0,0,0-.66,2.37q0,2.83,4.85,5.2t12.52,2.38q9,0,13.74-3.64a12,12,0,0,0,4.74-10.1,12.43,12.43,0,0,0-3.43-9.13Q514,90.14,507.14,88.53Z"/>
              <path d="M553.61,109.33a6.49,6.49,0,0,0-1.11-1.52,16.26,16.26,0,0,1-3.53,1.42,14.25,14.25,0,0,1-3.84.6,10.74,10.74,0,0,1-6.36-1.66q-2.32-1.68-2.32-5.71V76.21h14.44a2.84,2.84,0,0,0,2.22-.91,3.68,3.68,0,0,0,.81-2.53,5.85,5.85,0,0,0-.31-1.92,4.94,4.94,0,0,0-.6-1.31H536.45V57.93a3.4,3.4,0,0,0-1.06-2.78,5,5,0,0,0-3.18-.86,9.77,9.77,0,0,0-2.28.26,14,14,0,0,0-1.56.45v48q0,7.26,4.39,10.4t11.46,3.13a15.5,15.5,0,0,0,7.27-1.42q2.63-1.41,2.63-3.63A4.24,4.24,0,0,0,553.61,109.33Z"/>
            </g>
            <g class="mark">
              <path d="M161.85,52.93A82.47,82.47,0,0,0,36.57,18.86l-.07.05c-3.35,3.17-1.15,6.59-.39,7.56l.47.56L83,78.13a3.56,3.56,0,0,0,4.85.39l25.52-20.25a5.35,5.35,0,0,1,6.94,5.1V115a5.85,5.85,0,1,0,7.12.14V63.37a12.47,12.47,0,0,0-17.16-11.55,3.67,3.67,0,0,0-.88.51L86,70.87,43.49,24.05a.94.94,0,0,1-.24-.77.93.93,0,0,1,.42-.68A74.81,74.81,0,0,1,85.84,9.67h.34a75.36,75.36,0,0,1,40.07,139,5.75,5.75,0,0,0-2.49-.56,5.85,5.85,0,1,0,5.74,7A82.57,82.57,0,0,0,161.85,52.93Z"/>
              <path d="M106.61,80.67a7.08,7.08,0,0,0-7.77,1.53s0,0,0,0l-13,13.64-13-13.63a.17.17,0,0,0-.06-.06,7.08,7.08,0,0,0-7.76-1.54,7.19,7.19,0,0,0-4.37,6.69V115c0,1.42-2.34,3.39-4.65,3.39s-4.65-2-4.65-3.39V61.78a5.85,5.85,0,1,0-7.13,0V115c0,6,6.22,10.52,11.78,10.52s11.77-4.5,11.77-10.52V87.27l13.27,13.89.06.06a6.74,6.74,0,0,0,9.52,0l.06-.06,13.27-13.89v69.38a2,2,0,0,1-1.56,2,75.68,75.68,0,0,1-17,1.81A75.33,75.33,0,0,1,26,39.29H26a5.85,5.85,0,1,0-5.84-5.85,5.92,5.92,0,0,0,.17,1.41,82.55,82.55,0,0,0,84.8,130.42h0c1.32-.37,5.63-1.94,5.77-6.56,0-.15,0-.28,0-.4h0V87.35A7.18,7.18,0,0,0,106.61,80.67Z"/>
            </g>
          </svg>
        </a>
        <nav class="pos-header__nav">
          <button class="nav-item" (click)="router.navigate(['/caja'])">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            Caja
          </button>
          <button class="nav-item" (click)="router.navigate(['/estadisticas'])">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Estadísticas
          </button>
          <button class="nav-item" (click)="router.navigate(['/historial'])">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Historial
          </button>
        </nav>
      </div>

      <div class="pos-header__right">
        <div class="notif-wrap">
          <button class="icon-btn" (click)="toggleNotifications($event)" title="Notificaciones" aria-label="Notificaciones">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            @if (unreadCount() > 0) {
              <span class="icon-btn__badge">{{ unreadCount() }}</span>
            }
          </button>
          @if (showNotifications()) {
            <div class="notif-dropdown" (click)="$event.stopPropagation()">
              <div class="notif-dropdown__header">
                <div class="notif-dropdown__title">Notificaciones</div>
                @if (unreadCount() > 0) {
                  <button class="notif-dropdown__action" (click)="markAllRead()" type="button">Marcar todo como leído</button>
                }
              </div>
              <div class="notif-dropdown__divider"></div>
              <div class="notif-dropdown__list">
                @for (n of notifications(); track n.id) {
                  <button class="notif-item" [class.notif-item--unread]="!n.read" (click)="onNotificationClick(n)">
                    <span class="notif-item__icon" [class]="'notif-item__icon--' + n.tipo">
                      @switch (n.tipo) {
                        @case ('cocina') {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                        }
                        @case ('demorado') {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                        }
                        @case ('alerta') {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                        }
                        @case ('mesa') {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 10h18M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M7 14v6M17 14v6"/>
                          </svg>
                        }
                        @case ('cuenta') {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                          </svg>
                        }
                      }
                    </span>
                    <div class="notif-item__body">
                      <div class="notif-item__title">{{ n.titulo }}</div>
                      <div class="notif-item__msg">{{ n.mensaje }}</div>
                      <div class="notif-item__time">{{ n.tiempo }}</div>
                    </div>
                    @if (!n.read) {
                      <span class="notif-item__dot"></span>
                    }
                  </button>
                }
                @if (notifications().length === 0) {
                  <div class="notif-dropdown__empty">
                    <span class="notif-dropdown__empty-icon">🔔</span>
                    <span>Sin notificaciones</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
        <button class="icon-btn" title="Configuración">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <div class="profile-wrap">
          <button class="icon-btn" (click)="showProfile.set(!showProfile())">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          @if (showProfile()) {
            <div class="profile-dropdown">
              <div class="profile-dropdown__header">
                <span class="profile-dropdown__avatar">{{ user()?.avatar }}</span>
                <div class="profile-dropdown__info">
                  <span class="profile-dropdown__name">{{ user()?.nombre }}</span>
                  <span class="profile-dropdown__role">{{ user()?.tipo }}</span>
                </div>
              </div>
              <div class="profile-dropdown__divider"></div>
              <button class="profile-dropdown__item" (click)="onCambiarUsuario()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <polyline points="17 11 19 13 23 9"/>
                </svg>
                Cambiar de usuario
              </button>
              <button class="profile-dropdown__item profile-dropdown__item--danger" (click)="onCerrarSesion()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          }
        </div>
        <button class="cerrar-turno-btn" (click)="cerrarTurno.emit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Cerrar Turno
        </button>
      </div>
    </header>
  `,
  styles: [`
    .pos-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      background: linear-gradient(180deg, #0A0E4A 0%, #01033E 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.04) inset;
      padding: 0 16px;
      gap: 16px;
      flex-shrink: 0;
      position: relative;
      z-index: 10;
    }
    .pos-header__left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .pos-header__logo {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
    }
    .pos-header__logo:focus-visible {
      outline: 2px solid white;
      outline-offset: 4px;
      border-radius: 4px;
    }
    .logo-svg {
      display: block;
      height: 36px;
      width: auto;
    }
    /* Wordmark "maxirest" siempre blanco */
    .logo-svg .wordmark path {
      fill: #FFFFFF;
    }
    /* Mark (M): blanco por default, naranja cuando esta en /salon */
    .logo-svg .mark path {
      fill: #FFFFFF;
      transition: fill 0.18s ease;
    }
    .pos-header__logo--active .logo-svg .mark path {
      fill: #FF8B22;
    }
    .pos-header__nav {
      display: flex;
      gap: 4px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: none;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .pos-header__center {
      flex: 1;
      max-width: 320px;
    }
    .pos-header__search {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 14px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.4);
    }
    .search-input {
      background: none;
      border: none;
      color: #fff;
      font-size: 13px;
      outline: none;
      width: 100%;
      font-family: inherit;
    }
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.35);
    }
    .pos-header__right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .icon-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: background 0.15s;
    }
    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    .icon-btn__badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 999px;
      background: #EF4444;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      line-height: 16px;
      text-align: center;
      border: 2px solid #01033E;
      box-sizing: content-box;
      pointer-events: none;
    }

    /* Notifications dropdown */
    .notif-wrap { position: relative; }
    .notif-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 360px;
      max-height: 480px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
      border: 1px solid #E5E7EB;
      z-index: 100;
      animation: notifIn 0.14s ease-out;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    @keyframes notifIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .notif-dropdown__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 10px;
    }
    .notif-dropdown__title {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .notif-dropdown__action {
      background: none;
      border: none;
      color: #F27920;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      padding: 0;
    }
    .notif-dropdown__action:hover { color: #E06D15; text-decoration: underline; }
    .notif-dropdown__divider { height: 1px; background: #F1F5F9; }
    .notif-dropdown__list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }
    .notif-dropdown__empty {
      padding: 32px 16px;
      text-align: center;
      color: #9CA3AF;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .notif-dropdown__empty-icon { font-size: 28px; opacity: 0.5; }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.12s;
      position: relative;
    }
    .notif-item:hover { background: #F9FAFB; }
    .notif-item--unread { background: #FFF7ED; }
    .notif-item--unread:hover { background: #FFEEDB; }
    .notif-item__icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #F1F5F9;
      color: #6B7280;
    }
    .notif-item__icon--cocina { background: #ECFDF5; color: #059669; }
    .notif-item__icon--demorado { background: #FFFBEB; color: #D97706; }
    .notif-item__icon--alerta { background: #FEF2F2; color: #DC2626; }
    .notif-item__icon--mesa { background: #EFF6FF; color: #1D4ED8; }
    .notif-item__icon--cuenta { background: #FFF7ED; color: #F27920; }
    .notif-item__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .notif-item__title {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .notif-item__msg {
      font-size: 12px;
      color: #6B7280;
      line-height: 1.3;
    }
    .notif-item__time {
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 2px;
    }
    .notif-item__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #F27920;
      flex-shrink: 0;
      margin-top: 12px;
    }
    .icon-btn--avatar {
      background: rgba(255, 255, 255, 0.12);
    }
    .profile-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px 4px 4px;
      border-radius: 20px;
      border: none;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .profile-btn:hover { background: rgba(255, 255, 255, 0.14); }
    .profile-btn__name { font-size: 12px; font-weight: 600; }
    .profile-btn__chevron { transition: transform 0.2s; color: rgba(255,255,255,0.4); }
    .profile-btn__chevron--open { transform: rotate(180deg); }
    .profile-wrap {
      position: relative;
    }
    .profile-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #0A0E4A;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 6px;
      min-width: 220px;
      z-index: 100;
      box-shadow: 0 8px 28px rgba(0,0,0,0.4);
      animation: fadeIn 0.12s ease-out;
    }
    .profile-dropdown__header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
    }
    .profile-dropdown__avatar {
      font-size: 24px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .profile-dropdown__info {
      display: flex;
      flex-direction: column;
    }
    .profile-dropdown__name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }
    .profile-dropdown__role {
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .profile-dropdown__divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 4px 0;
    }
    .profile-dropdown__item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      border: none;
      border-radius: 8px;
      background: none;
      color: rgba(255,255,255,0.7);
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.12s;
    }
    .profile-dropdown__item:hover {
      background: rgba(255,255,255,0.08);
    }
    .profile-dropdown__item--danger {
      color: #F87171;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .avatar-emoji {
      font-size: 18px;
      line-height: 1;
    }
    .cerrar-turno-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 10px;
      border: none;
      background: #DC2626;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .cerrar-turno-btn:hover {
      background: #B91C1C;
    }

    @media (max-width: 768px) {
      .pos-header__nav { display: none; }
      .pos-header__center { max-width: 200px; }
    }
  `],
})
export class PosHeaderComponent {
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly user = this.authService.currentUser;
  readonly showProfile = signal(false);
  readonly showNotifications = signal(false);
  cerrarTurno = output<void>();

  readonly notifications = signal<Notification[]>([
    { id: 'n1', tipo: 'cocina',   titulo: 'Pedido listo',          mensaje: 'Mesa 7 — 2 platos listos para retirar', tiempo: 'Hace 1 min',  read: false },
    { id: 'n2', tipo: 'demorado', titulo: 'Pedido demorado',       mensaje: 'PedidosYa #142 — más de 30 minutos',     tiempo: 'Hace 5 min',  read: false },
    { id: 'n3', tipo: 'mesa',     titulo: 'Mesa 4 reservada',      mensaje: 'Reserva confirmada a las 21:30',         tiempo: 'Hace 12 min', read: false },
    { id: 'n4', tipo: 'cuenta',   titulo: 'Pedido cobrado',        mensaje: 'Mesa 3 — $12.500 cobrados con tarjeta',  tiempo: 'Hace 18 min', read: true  },
    { id: 'n5', tipo: 'alerta',   titulo: 'Stock bajo',            mensaje: 'Coca Cola 500ml — quedan 5 unidades',    tiempo: 'Hace 32 min', read: true  },
  ]);

  readonly unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    const next = !this.showNotifications();
    this.showProfile.set(false);
    this.showNotifications.set(next);
    if (next) {
      setTimeout(() => document.addEventListener('click', this.closeNotifications, { once: true }));
    }
  }

  private closeNotifications = (): void => {
    this.showNotifications.set(false);
  };

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  onNotificationClick(n: Notification): void {
    this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, read: true } : x));
  }

  onCambiarUsuario(): void {
    this.showProfile.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onCerrarSesion(): void {
    this.showProfile.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
