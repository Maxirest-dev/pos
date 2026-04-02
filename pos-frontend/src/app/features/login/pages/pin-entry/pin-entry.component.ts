import { Component, signal, computed, inject, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { NumericKeypadComponent } from '../../../../shared/components/numeric-keypad/numeric-keypad.component';
import { PinInputComponent } from '../../../../shared/components/pin-input/pin-input.component';
import { AuthService } from '../../../../core/services/auth.service';
import { MOCK_PIN } from '../../data/mock-users.data';

@Component({
  selector: 'app-pin-entry',
  standalone: true,
  imports: [NumericKeypadComponent, PinInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pin-entry">
      <div class="pin-entry__logo">
        <img src="/logo.png" alt="Maxirest" class="logo-img" />
      </div>

      <button class="pin-entry__back" (click)="goBack()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>

      <div class="pin-entry__user">
        <div class="pin-entry__avatar">
          <span class="pin-entry__emoji">{{ user()?.avatar }}</span>
        </div>
        <h1 class="pin-entry__greeting">Hola, {{ user()?.nombre }}</h1>
        <p class="pin-entry__subtitle">Ingresá tu PIN para continuar</p>
      </div>

      <app-pin-input [length]="pin().length" [error]="hasError()" />

      @if (errorMessage()) {
        <p class="pin-entry__error">{{ errorMessage() }}</p>
      }

      <app-numeric-keypad (keyPress)="onKeyPress($event)" />

      <button
        class="pin-entry__verify"
        [disabled]="pin().length < 6 || isBlocked()"
        (click)="verify()"
      >
        Verificar
      </button>

      <div class="pin-entry__forgot">
        <span class="forgot-label">¿Olvidaste tu PIN?</span>
        <button class="forgot-link">Recuperar acceso</button>
      </div>

      <p class="pin-entry__hint">PIN de prueba: {{ mockPin }}</p>
    </div>
  `,
  styles: [`
    .pin-entry {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 24px;
      gap: 20px;
      position: relative;
      background: linear-gradient(135deg, #01033E 0%, #0A0E4A 50%, #01033E 100%);
    }
    .pin-entry__logo {
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
    .pin-entry__back {
      position: absolute;
      top: 120px;
      left: 50%;
      transform: translateX(calc(-50% - 140px));
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: color 0.15s;
    }
    .pin-entry__back:hover {
      color: #fff;
    }
    .pin-entry__user {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .pin-entry__avatar {
      width: 88px;
      height: 88px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pin-entry__emoji {
      font-size: 42px;
      line-height: 1;
    }
    .pin-entry__greeting {
      color: #fff;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
    .pin-entry__subtitle {
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      margin: 0;
    }
    .pin-entry__error {
      color: #EF4444;
      font-size: 13px;
      margin: 0;
      text-align: center;
    }
    .pin-entry__verify {
      padding: 12px 48px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }
    .pin-entry__verify:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }
    .pin-entry__verify:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .pin-entry__forgot {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    .forgot-label {
      color: rgba(255, 255, 255, 0.4);
      font-size: 13px;
    }
    .forgot-link {
      background: none;
      border: none;
      color: #F27920;
      font-size: 13px;
      cursor: pointer;
      padding: 0;
      font-weight: 500;
    }
    .forgot-link:hover {
      text-decoration: underline;
    }
    .pin-entry__hint {
      color: rgba(255, 255, 255, 0.25);
      font-size: 12px;
      margin: 0;
    }

    @media (max-width: 600px) {
      .pin-entry__back {
        top: 80px;
        left: 16px;
        transform: none;
      }
    }
  `],
})
export class PinEntryComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly pin = signal('');
  readonly user = this.authService.currentUser;
  readonly errorMessage = this.authService.loginError;
  readonly hasError = computed(() => this.errorMessage() !== '');
  readonly isBlocked = computed(() => this.user()?.bloqueado ?? false);
  readonly mockPin = MOCK_PIN;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isBlocked()) return;

    if (event.key >= '0' && event.key <= '9') {
      this.onKeyPress(event.key);
    } else if (event.key === 'Backspace') {
      this.onKeyPress('delete');
    } else if (event.key === 'Enter') {
      this.verify();
    } else if (event.key === 'Escape') {
      this.goBack();
    }
  }

  onKeyPress(key: string): void {
    if (this.isBlocked()) return;

    if (key === 'delete') {
      this.pin.update(p => p.slice(0, -1));
    } else if (this.pin().length < 6) {
      this.pin.update(p => p + key);
    }
  }

  verify(): void {
    if (this.pin().length !== 6) return;

    const valid = this.authService.validatePin(this.pin());
    if (valid) {
      this.router.navigate(['/login/confirmar']);
    } else {
      this.pin.set('');
    }
  }

  goBack(): void {
    this.authService.clearSelection();
    this.router.navigate(['/login']);
  }
}
