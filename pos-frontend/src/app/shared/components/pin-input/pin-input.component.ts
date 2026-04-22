import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pin-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pin-dots">
      @for (i of digits; track i) {
        <div class="pin-dot" [class.pin-dot--filled]="i < length()" [class.pin-dot--error]="error()">
          <div class="pin-dot__inner"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .pin-dots {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    .pin-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.2s;
    }
    .pin-dot__inner {
      width: 0;
      height: 0;
      border-radius: 50%;
      background: #fff;
      transition: width 0.15s, height 0.15s;
    }
    .pin-dot--filled .pin-dot__inner {
      width: 10px;
      height: 10px;
    }
    .pin-dot--filled {
      border-color: rgba(255, 255, 255, 0.7);
    }
    .pin-dot--error {
      border-color: #EF4444;
    }
    .pin-dot--error .pin-dot__inner {
      background: #EF4444;
    }
  `],
})
export class PinInputComponent {
  length = input<number>(0);
  error = input<boolean>(false);
  readonly digits = [0, 1, 2, 3];
}
