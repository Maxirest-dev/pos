import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-comensales-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <h2 class="dialog__title">¿Cuántos comensales?</h2>

        <div class="dialog__counter">
          <button class="counter-btn" (click)="decrement()" [disabled]="cantidad() <= 1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <span class="counter-value">{{ cantidad() }}</span>
          <button class="counter-btn" (click)="increment()" [disabled]="cantidad() >= 20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <div class="dialog__actions">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" (click)="confirmar.emit(cantidad())">Abrir mesa</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      animation: fadeIn 0.15s ease-out;
    }
    .dialog {
      background: #fff;
      border-radius: 16px;
      padding: 32px 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      min-width: 300px;
      animation: slideUp 0.2s ease-out;
    }
    .dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }
    .dialog__counter {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .counter-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid #E5E7EB;
      background: #fff;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .counter-btn:hover:not(:disabled) {
      border-color: #F27920;
      background: #FFF7ED;
    }
    .counter-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .counter-value {
      font-size: 42px;
      font-weight: 800;
      color: #1a1a1a;
      min-width: 60px;
      text-align: center;
    }
    .dialog__actions {
      display: flex;
      gap: 12px;
      width: 100%;
    }
    .btn {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .btn--cancel {
      border: 1px solid #E5E7EB;
      background: #fff;
      color: #6B7280;
    }
    .btn--cancel:hover { background: #F9FAFB; }
    .btn--confirm {
      border: none;
      background: #F27920;
      color: #fff;
    }
    .btn--confirm:hover { background: #E06D15; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ComensalesDialogComponent {
  readonly cantidad = signal(2);
  confirmar = output<number>();
  cancelar = output<void>();

  increment(): void { this.cantidad.update(v => Math.min(20, v + 1)); }
  decrement(): void { this.cantidad.update(v => Math.max(1, v - 1)); }
}
