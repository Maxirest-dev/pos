import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarCardComponent } from '../../../../shared/components/avatar-card/avatar-card.component';
import { AuthService } from '../../../../core/services/auth.service';
import { PosUser } from '../../../../core/models';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [AvatarCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-selector">
      <div class="user-selector__logo">
        <img src="/logo.png" alt="Maxirest" class="logo-img" />
      </div>

      <h1 class="user-selector__title">¿Quién anda ahí?</h1>

      <div class="user-selector__carousel">
        <div class="user-selector__grid">
          @for (user of allUsers(); track user.id) {
            <app-avatar-card [user]="user" (selected)="onUserSelected($event)" />
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 24px;
      gap: 28px;
      background: linear-gradient(135deg, #01033E 0%, #0A0E4A 50%, #01033E 100%);
    }
    .user-selector__logo {
      position: absolute;
      top: 24px;
      left: 28px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-img {
      height: 32px;
      width: auto;
      object-fit: contain;
    }
    .user-selector__title {
      color: #fff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 32px;
    }
    .user-selector__carousel {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
    }
    .user-selector__carousel::-webkit-scrollbar {
      height: 8px;
    }
    .user-selector__carousel::-webkit-scrollbar-track {
      background: transparent;
    }
    .user-selector__carousel::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
    .user-selector__carousel::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.35);
    }
    .user-selector__grid {
      display: flex;
      gap: 12px;
      flex-wrap: nowrap;
      padding: 4px 12px 12px;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .user-selector__title { font-size: 24px; }
      .user-selector__grid { gap: 8px; }
    }
  `],
})
export class UserSelectorComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly allUsers = computed(() => this.authService.getUsers());

  onUserSelected(user: PosUser): void {
    this.authService.selectUser(user.id);
    this.router.navigate(['/login/pin']);
  }
}
