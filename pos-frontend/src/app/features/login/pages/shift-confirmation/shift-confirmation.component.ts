import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ShiftService } from '../../../../core/services/shift.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ShiftType, SHIFT_OPTIONS } from '../../../../core/models';

@Component({
  selector: 'app-shift-confirmation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shift-confirm">
      <div class="shift-confirm__logo">
        <img src="/logo.png" alt="Maxirest" class="logo-img" />
      </div>

      <div class="shift-confirm__card">
        <!-- Back -->
        <button class="shift-confirm__back" (click)="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <h2 class="shift-confirm__title">Confirma los datos del turno</h2>

        <button class="shift-confirm__details-card" (click)="openEditor()">
          <!-- Calendar badge -->
          <div class="detail-item__calendar">
            <div class="calendar-badge__header">
              <span class="calendar-badge__day-name">{{ dayNameShort() }}</span>
            </div>
            <div class="calendar-badge__body">
              <span class="calendar-badge__day-number">{{ dayNumber() }}</span>
            </div>
          </div>

          <!-- Shift icon + label -->
          <div class="detail-item__shift">
            @switch (selectedShift()) {
              @case ('MANANA') {
                <svg class="detail-item__shift-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F27920" stroke-width="1.5">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              }
              @case ('TARDE') {
                <svg class="detail-item__shift-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
                  <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                </svg>
              }
              @case ('NOCHE') {
                <svg class="detail-item__shift-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="1.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              }
            }
            <span class="detail-item__shift-label">{{ shiftOption()?.label }}</span>
          </div>
        </button>

        <button class="shift-confirm__btn" (click)="openShift()">
          Abrir
        </button>
      </div>
    </div>

    <!-- Shift Editor Dialog (overlay) -->
    @if (showEditor()) {
      <div class="dialog-backdrop" (click)="closeEditor()">
        <div class="dialog-card" (click)="$event.stopPropagation()">
          <div class="dialog-content">
            <!-- Calendar -->
            <div class="calendar">
              <div class="calendar__header">
                <button class="calendar__nav" (click)="prevMonth()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span class="calendar__title">{{ monthYearLabel() }}</span>
                <button class="calendar__nav" (click)="nextMonth()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
              <div class="calendar__weekdays">
                @for (day of weekdays; track day) {
                  <span class="calendar__weekday">{{ day }}</span>
                }
              </div>
              <div class="calendar__days">
                @for (day of calendarDays(); track $index) {
                  @if (day === 0) {
                    <span class="calendar__day calendar__day--empty"></span>
                  } @else {
                    <button
                      class="calendar__day"
                      [class.calendar__day--today]="isToday(day)"
                      [class.calendar__day--selected]="isSelected(day)"
                      (click)="selectDay(day)"
                    >
                      {{ day }}
                    </button>
                  }
                }
              </div>
            </div>

            <!-- Shifts -->
            <div class="shifts">
              @for (shift of shiftOptions; track shift.tipo) {
                <button
                  class="shift-option"
                  [class.shift-option--selected]="selectedShift() === shift.tipo"
                  (click)="selectShift(shift.tipo)"
                >
                  <span class="shift-option__icon">{{ shift.icon }}</span>
                  <div class="shift-option__info">
                    <span class="shift-option__label">{{ shift.label }}</span>
                    <span class="shift-option__time">{{ shift.horario }}</span>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* === Confirmation screen === */
    .shift-confirm {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 24px;
      background: linear-gradient(135deg, #01033E 0%, #0A0E4A 50%, #01033E 100%);
    }
    .shift-confirm__logo {
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
    .shift-confirm__card {
      background: #fff;
      border-radius: 16px;
      padding: 32px 40px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      min-width: 300px;
      position: relative;
    }
    .shift-confirm__back {
      position: absolute;
      top: 14px;
      left: 14px;
      background: none;
      border: none;
      color: #bbb;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      transition: color 0.15s, background 0.15s;
    }
    .shift-confirm__back:hover {
      color: #333;
      background: #f5f5f5;
    }
    .shift-confirm__title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0;
    }
    .shift-confirm__details-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 24px;
      border-radius: 14px;
      border: 1.5px solid #ebebeb;
      background: #fff;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    .shift-confirm__details-card:hover {
      border-color: #ddd;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    /* Calendar badge - dark style matching Pencil */
    .detail-item__calendar {
      width: 68px;
      height: 68px;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .calendar-badge__header {
      background: #01033E;
      padding: 4px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 3px solid #F27920;
    }
    .calendar-badge__day-name {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #fff;
    }
    .calendar-badge__body {
      background: #fff;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e5e5e5;
      border-top: none;
      border-radius: 0 0 12px 12px;
    }
    .calendar-badge__day-number {
      font-size: 26px;
      font-weight: 700;
      color: #01033E;
      line-height: 1;
    }

    /* Shift icon + label */
    .detail-item__shift {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .detail-item__shift-svg {
      display: block;
    }
    .detail-item__shift-label {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }

    .shift-confirm__btn {
      padding: 10px 40px;
      border-radius: 10px;
      border: none;
      background: #F27920;
      color: #fff;
      font-size: 14px;
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

    /* === Dialog overlay === */
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      animation: fadeIn 0.15s ease-out;
    }
    .dialog-card {
      background: #fff;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      max-width: 600px;
      width: 90%;
      animation: slideUp 0.2s ease-out;
    }
    .dialog-content {
      display: flex;
      gap: 32px;
      align-items: flex-start;
    }

    /* === Calendar (inside dialog) === */
    .calendar {
      flex: 1;
      min-width: 280px;
    }
    .calendar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .calendar__title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .calendar__nav {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #666;
      border-radius: 6px;
    }
    .calendar__nav:hover {
      background: #f5f5f5;
    }
    .calendar__weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      margin-bottom: 8px;
    }
    .calendar__weekday {
      font-size: 12px;
      color: #999;
      font-weight: 500;
      padding: 4px 0;
    }
    .calendar__days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .calendar__day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #333;
      border: none;
      background: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .calendar__day:hover:not(.calendar__day--empty) {
      background: #f0f0f0;
    }
    .calendar__day--today {
      color: #F27920;
      font-weight: 700;
    }
    .calendar__day--selected {
      background: #F27920 !important;
      color: #fff !important;
      font-weight: 600;
    }
    .calendar__day--empty {
      cursor: default;
    }

    /* === Shifts (inside dialog) === */
    .shifts {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 180px;
    }
    .shift-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1.5px solid #e5e5e5;
      background: #fff;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .shift-option:hover {
      border-color: #F27920;
    }
    .shift-option--selected {
      border-color: #F27920;
      background: #FFF7ED;
    }
    .shift-option__icon {
      font-size: 24px;
    }
    .shift-option__info {
      display: flex;
      flex-direction: column;
    }
    .shift-option__label {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .shift-option__time {
      font-size: 12px;
      color: #F27920;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 600px) {
      .shift-confirm__card {
        padding: 28px 24px;
        min-width: auto;
        width: 100%;
        max-width: 360px;
      }
      .dialog-content {
        flex-direction: column;
      }
      .calendar { min-width: auto; }
      .shifts {
        flex-direction: row;
        min-width: auto;
      }
      .shift-option {
        flex: 1;
        flex-direction: column;
        text-align: center;
      }
    }
  `],
})
export class ShiftConfirmationComponent {
  private readonly shiftService = inject(ShiftService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly shiftOptions = SHIFT_OPTIONS;
  readonly weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  readonly showEditor = signal(false);
  readonly viewDate = signal(new Date());

  readonly selectedDate = this.shiftService.selectedDate;
  readonly selectedShift = this.shiftService.selectedShiftType;
  readonly shiftOption = this.shiftService.selectedShiftOption;

  private readonly dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  readonly dayName = computed(() => this.dayNames[this.selectedDate().getDay()]);
  readonly dayNameShort = computed(() => this.dayNames[this.selectedDate().getDay()].toUpperCase().slice(0, 3));
  readonly dayNumber = computed(() => this.selectedDate().getDate());

  readonly monthYearLabel = computed(() => {
    const d = this.viewDate();
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  });

  readonly calendarDays = computed(() => {
    const d = this.viewDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: number[] = [];
    for (let i = 0; i < firstDay; i++) days.push(0);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  });

  openEditor(): void {
    this.viewDate.set(new Date(this.selectedDate().getFullYear(), this.selectedDate().getMonth(), 1));
    this.showEditor.set(true);
  }

  closeEditor(): void {
    this.showEditor.set(false);
  }

  isToday(day: number): boolean {
    const today = new Date();
    const v = this.viewDate();
    return day === today.getDate() && v.getMonth() === today.getMonth() && v.getFullYear() === today.getFullYear();
  }

  isSelected(day: number): boolean {
    const sel = this.selectedDate();
    const v = this.viewDate();
    return day === sel.getDate() && v.getMonth() === sel.getMonth() && v.getFullYear() === sel.getFullYear();
  }

  selectDay(day: number): void {
    const v = this.viewDate();
    this.shiftService.selectDate(new Date(v.getFullYear(), v.getMonth(), day));
  }

  selectShift(tipo: ShiftType): void {
    this.shiftService.selectShiftType(tipo);
    this.closeEditor();
  }

  prevMonth(): void {
    this.viewDate.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    this.viewDate.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  goBack(): void {
    this.shiftService.reset();
    this.router.navigate(['/login/pin']);
  }

  openShift(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.shiftService.openShift(user.id);
    this.router.navigate(['/salon']);
  }
}
