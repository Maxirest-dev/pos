import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ShiftService } from '../../../../core/services/shift.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-shift-confirmation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shift-confirm">
      <div class="shift-confirm__logo">
        <span class="logo-icon">m</span>
        <span class="logo-text">maxirest</span>
      </div>

      <div class="shift-confirm__card">
        <h2 class="shift-confirm__title">Confirma los datos del turno</h2>

        <div class="shift-confirm__details">
          <!-- Date -->
          <div class="detail-item">
            <div class="detail-item__calendar">
              <span class="detail-item__day-name">{{ dayName() }}</span>
              <span class="detail-item__day-number">{{ dayNumber() }}</span>
            </div>
          </div>

          <!-- Shift -->
          <div class="detail-item">
            <span class="detail-item__shift-icon">{{ shiftOption()?.icon }}</span>
            <span class="detail-item__shift-label">{{ shiftOption()?.label }}</span>
          </div>
        </div>

        <button class="shift-confirm__btn" (click)="openShift()">
          Abrir
        </button>
      </div>
    </div>
  `,
  styles: [`
    .shift-confirm {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 24px;
    }
    .shift-confirm__logo {
      position: absolute;
      top: 24px;
      left: 28px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      background: #F27920;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 18px;
    }
    .logo-text {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 600;
    }
    .shift-confirm__card {
      background: #fff;
      border-radius: 20px;
      padding: 36px 48px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      min-width: 320px;
    }
    .shift-confirm__title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }
    .shift-confirm__details {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .detail-item__calendar {
      width: 72px;
      height: 72px;
      border-radius: 14px;
      background: #F27920;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .detail-item__day-name {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-item__day-number {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
    }
    .detail-item__shift-icon {
      font-size: 36px;
    }
    .detail-item__shift-label {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .shift-confirm__btn {
      padding: 12px 48px;
      border-radius: 12px;
      border: none;
      background: #F27920;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }
    .shift-confirm__btn:hover {
      background: #E06D15;
    }
    .shift-confirm__btn:active {
      transform: scale(0.97);
    }

    @media (max-width: 600px) {
      .shift-confirm__card {
        padding: 28px 24px;
        min-width: auto;
        width: 100%;
        max-width: 360px;
      }
    }
  `],
})
export class ShiftConfirmationComponent {
  private readonly shiftService = inject(ShiftService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly selectedDate = this.shiftService.selectedDate;
  readonly shiftOption = this.shiftService.selectedShiftOption;

  private readonly dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  readonly dayName = computed(() => this.dayNames[this.selectedDate().getDay()]);
  readonly dayNumber = computed(() => this.selectedDate().getDate());

  openShift(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.shiftService.openShift(user.id);
    // Navigate to salon (future) - for now, show alert
    alert(`Turno abierto exitosamente.\n${this.dayName()} ${this.dayNumber()} - ${this.shiftOption()?.label}\nAbierto por: ${user.nombre}`);
    // this.router.navigate(['/salon']);
  }
}
