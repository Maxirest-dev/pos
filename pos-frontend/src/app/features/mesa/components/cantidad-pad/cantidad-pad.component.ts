import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cantidad-pad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="pad" (click)="$event.stopPropagation()">
        <button class="pad__close" (click)="cancelar.emit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span class="pad__title">CANTIDAD</span>
        <div class="pad__display">{{ display() }}</div>
        <div class="pad__keys">
          @for (row of rows; track $index) {
            <div class="pad__row">
              @for (key of row; track key) {
                <button class="pad__key" [class.pad__key--wide]="key === '0'" (click)="onKey(key)">
                  @if (key === 'del') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
                  } @else if (key === 'ok') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  } @else {
                    {{ key }}
                  }
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: flex-end; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .pad { background: #fff; border-radius: 20px 20px 0 0; width: 280px; padding: 16px; position: relative; animation: slideUp 0.2s ease-out; box-shadow: 0 -4px 24px rgba(0,0,0,0.15); margin-bottom: 0; align-self: flex-end; margin-right: 40px; }
    .pad__close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #9CA3AF; cursor: pointer; }
    .pad__title { display: block; text-align: center; font-size: 10px; font-weight: 700; color: #9CA3AF; letter-spacing: 1px; margin-bottom: 8px; }
    .pad__display { text-align: center; font-size: 28px; font-weight: 800; color: #1a1a1a; padding: 8px; margin-bottom: 12px; border-bottom: 2px solid #F27920; }
    .pad__keys { display: flex; flex-direction: column; gap: 8px; }
    .pad__row { display: flex; gap: 8px; justify-content: center; }
    .pad__key { width: 60px; height: 48px; border-radius: 10px; border: none; background: #F3F4F6; color: #1a1a1a; font-size: 18px; font-weight: 600; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; transition: background 0.1s; }
    .pad__key:hover { background: #E5E7EB; }
    .pad__key:active { background: #D1D5DB; }
    .pad__key--wide { width: 60px; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class CantidadPadComponent {
  confirmar = output<number>();
  cancelar = output<void>();
  readonly display = signal('00.00');

  readonly rows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['.', '0', 'del'],
  ];

  onKey(key: string): void {
    if (key === 'del') {
      const v = this.display();
      this.display.set(v.length > 1 ? v.slice(0, -1) : '0');
    } else if (key === 'ok') {
      this.confirmar.emit(parseFloat(this.display()) || 1);
    } else {
      const v = this.display();
      if (v === '00.00' || v === '0') {
        this.display.set(key);
      } else {
        this.display.set(v + key);
      }
    }
  }
}
