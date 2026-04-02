import { Component, inject, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-pos-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="pos-header">
      <div class="pos-header__left">
        <div class="pos-header__logo">
          <img src="/logo.png" alt="Maxirest" class="logo-img" />
        </div>
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
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="icon-btn__badge"></span>
        </button>
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
              <button class="profile-dropdown__item" (click)="showProfile.set(false)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Mi perfil
              </button>
              <button class="profile-dropdown__item" (click)="showProfile.set(false)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Configuración
              </button>
              <button class="profile-dropdown__item" (click)="showProfile.set(false)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Ayuda
              </button>
              <div class="profile-dropdown__divider"></div>
              <button class="profile-dropdown__item profile-dropdown__item--danger" (click)="showProfile.set(false); router.navigate(['/login'])">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
      background: #01033E;
      padding: 0 16px;
      gap: 16px;
      flex-shrink: 0;
    }
    .pos-header__left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .logo-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #2A3158;
      border: 2px solid #F27920;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-circle__text {
      color: #F27920;
      font-weight: 800;
      font-size: 16px;
    }
    .logo-img {
      height: 32px;
      width: auto;
      object-fit: contain;
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
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #EF4444;
      border: 2px solid #01033E;
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
  cerrarTurno = output<void>();
}
