import { Component, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-numeric-keypad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="keypad">
      @for (row of rows; track $index) {
        <div class="keypad-row">
          @for (key of row; track key.value) {
            <button
              class="keypad-btn"
              [class.keypad-btn--empty]="key.value === ''"
              [class.keypad-btn--delete]="key.value === 'delete'"
              [disabled]="key.value === ''"
              (click)="onKeyPress(key.value)"
            >
              @if (key.value === 'delete') {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/>
                  <line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              } @else {
                {{ key.label }}
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .keypad {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 280px;
    }
    .keypad-row {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .keypad-btn {
      width: 72px;
      height: 56px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      font-size: 22px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, transform 0.1s;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .keypad-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }
    .keypad-btn:active:not(:disabled) {
      transform: scale(0.95);
      background: rgba(255, 255, 255, 0.2);
    }
    .keypad-btn--empty {
      visibility: hidden;
    }
    .keypad-btn--delete {
      color: rgba(255, 255, 255, 0.7);
    }
    .keypad-btn:disabled {
      cursor: default;
    }
  `],
})
export class NumericKeypadComponent {
  keyPress = output<string>();

  readonly rows = [
    [{ value: '7', label: '7' }, { value: '8', label: '8' }, { value: '9', label: '9' }],
    [{ value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }],
    [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }],
    [{ value: '', label: '' }, { value: '0', label: '0' }, { value: 'delete', label: '' }],
  ];

  onKeyPress(value: string): void {
    if (value) {
      this.keyPress.emit(value);
    }
  }
}
