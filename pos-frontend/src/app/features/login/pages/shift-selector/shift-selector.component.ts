import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ShiftService } from '../../../../core/services/shift.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ShiftType, SHIFT_OPTIONS } from '../../../../core/models';

@Component({
  selector: 'app-shift-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shift-selector">
      <div class="shift-selector__logo">
        <img src="/logo.png" alt="Maxirest" class="logo-img" />
      </div>

      <div class="shift-selector__card">
        <div class="shift-selector__content">
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
  `,
  styles: [`
    .shift-selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 24px;
    }
    .shift-selector__logo {
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
    .shift-selector__card {
      background: #fff;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
    }
    .shift-selector__content {
      display: flex;
      gap: 32px;
      align-items: flex-start;
    }

    /* Calendar */
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

    /* Shifts */
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

    @media (max-width: 600px) {
      .shift-selector__content {
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
export class ShiftSelectorComponent {
  private readonly shiftService = inject(ShiftService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly shiftOptions = SHIFT_OPTIONS;
  readonly weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  readonly viewDate = signal(new Date());
  readonly selectedDate = this.shiftService.selectedDate;
  readonly selectedShift = this.shiftService.selectedShiftType;

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
    if (this.selectedShift()) {
      this.router.navigate(['/login/confirmar']);
    }
  }

  selectShift(tipo: ShiftType): void {
    this.shiftService.selectShiftType(tipo);
    const sel = this.selectedDate();
    const today = new Date();
    const hasDateSelected = sel.getDate() !== today.getDate() ||
      sel.getMonth() !== today.getMonth() ||
      sel.getFullYear() !== today.getFullYear() ||
      true; // always navigate when shift is selected, date defaults to today
    this.router.navigate(['/login/confirmar']);
  }

  prevMonth(): void {
    this.viewDate.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    this.viewDate.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
}
