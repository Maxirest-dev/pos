import { Component, signal, input, output, ChangeDetectionStrategy } from '@angular/core';

interface ObservacionPredefinida {
  id: string;
  label: string;
  icon: string;
}

const OBSERVACIONES_PRIMARIAS: ObservacionPredefinida[] = [
  { id: 'celiaco', label: 'Celíaco / Sin TACC', icon: '🌾' },
  { id: 'lactosa', label: 'Intolerante a lactosa', icon: '🥛' },
  { id: 'vegetariano', label: 'Vegetariano', icon: '🥗' },
  { id: 'vegano', label: 'Vegano', icon: '🌱' },
];

const OBSERVACIONES_SECUNDARIAS: ObservacionPredefinida[] = [
  { id: 'alergia-nueces', label: 'Alergia a frutos secos', icon: '🥜' },
  { id: 'alergia-mariscos', label: 'Alergia a mariscos', icon: '🦐' },
  { id: 'diabetico', label: 'Diabético', icon: '🍬' },
  { id: 'embarazada', label: 'Embarazada', icon: '🤰' },
  { id: 'bebe', label: 'Bebé / Sillita', icon: '👶' },
];

export interface ComensalesDialogResult {
  cantidad: number;
  observaciones: string[];
}

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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <span class="counter-value">{{ cantidad() }}</span>
          <button class="counter-btn" (click)="increment()" [disabled]="cantidad() >= 20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        @if (showObservaciones()) {
        <div class="dialog__obs">
          <span class="dialog__obs-label">Observaciones de la mesa <span class="dialog__obs-hint">(opcional)</span></span>
          <div class="dialog__chips">
            @for (obs of observacionesPrimarias; track obs.id) {
              <button
                type="button"
                class="chip"
                [class.chip--selected]="isSelected(obs.id)"
                (click)="toggleObservacion(obs.id)"
              >
                <span class="chip__icon">{{ obs.icon }}</span>
                <span class="chip__label">{{ obs.label }}</span>
              </button>
            }
            <button
              type="button"
              class="chip chip--otros"
              [class.chip--selected]="hasSecundariasSelected()"
              (click)="otrosExpandido.update(v => !v)"
            >
              <span class="chip__label">Otros</span>
              <svg
                class="chip__chevron"
                [class.chip__chevron--open]="otrosExpandido()"
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          @if (otrosExpandido()) {
            <div class="dialog__chips dialog__chips--secundarios">
              @for (obs of observacionesSecundarias; track obs.id) {
                <button
                  type="button"
                  class="chip"
                  [class.chip--selected]="isSelected(obs.id)"
                  (click)="toggleObservacion(obs.id)"
                >
                  <span class="chip__icon">{{ obs.icon }}</span>
                  <span class="chip__label">{{ obs.label }}</span>
                </button>
              }
            </div>
          }
        </div>
        }

        <div class="dialog__actions">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" (click)="onConfirmar()">{{ showObservaciones() ? 'Abrir mesa' : 'Aceptar' }}</button>
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
      padding: 16px;
    }
    .dialog {
      background: #fff;
      border-radius: 16px;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 22px;
      width: 480px;
      max-width: 100%;
      max-height: 90vh;
      overflow-y: auto;
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
      gap: 36px;
      padding: 4px 0 8px;
    }
    .counter-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 2px solid #E5E7EB;
      background: #fff;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s, transform 0.1s;
    }
    .counter-btn:hover:not(:disabled) {
      border-color: #F27920;
      background: #FFF7ED;
    }
    .counter-btn:active:not(:disabled) {
      transform: scale(0.94);
    }
    .counter-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .counter-value {
      font-size: 64px;
      font-weight: 800;
      color: #1a1a1a;
      min-width: 90px;
      text-align: center;
      line-height: 1;
    }

    /* Observaciones */
    .dialog__obs {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-top: 1px solid #F0F0F0;
      padding-top: 18px;
    }
    .dialog__obs-label {
      font-size: 12px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dialog__obs-hint {
      font-size: 11px;
      font-weight: 500;
      color: #9CA3AF;
      text-transform: none;
      letter-spacing: 0;
      margin-left: 4px;
    }
    .dialog__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .dialog__chips--secundarios {
      margin-top: 4px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1.5px solid #E5E7EB;
      background: #fff;
      color: #374151;
      font-size: 12px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: border-color 0.12s, background 0.12s, color 0.12s;
    }
    .chip:hover {
      border-color: #F27920;
      background: #FFF7ED;
    }
    .chip--selected {
      border-color: #F27920;
      background: #F27920;
      color: #fff;
    }
    .chip--selected:hover {
      background: #E06D15;
      border-color: #E06D15;
    }
    .chip__icon {
      font-size: 14px;
      line-height: 1;
    }
    .chip__label {
      line-height: 1.1;
    }
    .chip--otros {
      background: #F9FAFB;
      border-style: dashed;
      color: #6B7280;
    }
    .chip--otros:hover {
      background: #FFF7ED;
      color: #374151;
    }
    .chip__chevron {
      transition: transform 0.2s;
    }
    .chip__chevron--open {
      transform: rotate(180deg);
    }
    .dialog__chips--secundarios {
      animation: slideDown 0.18s ease-out;
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
    @keyframes slideDown { from { transform: translateY(-6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ComensalesDialogComponent {
  readonly showObservaciones = input<boolean>(true);
  readonly cantidad = signal(2);
  readonly selectedObs = signal<Set<string>>(new Set());
  readonly otrosExpandido = signal(false);
  readonly observacionesPrimarias = OBSERVACIONES_PRIMARIAS;
  readonly observacionesSecundarias = OBSERVACIONES_SECUNDARIAS;

  confirmar = output<ComensalesDialogResult>();
  cancelar = output<void>();

  increment(): void { this.cantidad.update(v => Math.min(20, v + 1)); }
  decrement(): void { this.cantidad.update(v => Math.max(1, v - 1)); }

  isSelected(id: string): boolean {
    return this.selectedObs().has(id);
  }

  hasSecundariasSelected(): boolean {
    const sel = this.selectedObs();
    return OBSERVACIONES_SECUNDARIAS.some(o => sel.has(o.id));
  }

  toggleObservacion(id: string): void {
    this.selectedObs.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  onConfirmar(): void {
    this.confirmar.emit({
      cantidad: this.cantidad(),
      observaciones: Array.from(this.selectedObs()),
    });
  }
}
