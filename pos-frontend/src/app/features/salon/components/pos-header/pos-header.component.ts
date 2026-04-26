import { Component, inject, signal, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
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
