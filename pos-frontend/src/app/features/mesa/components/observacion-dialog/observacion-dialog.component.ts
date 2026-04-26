import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';

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

export interface ObservacionDialogResult {
  predefinidas: string[];
  nota: string;
}

@Component({
  selector: 'app-observacion-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog__header">
          <h3 class="dialog__title">Observaciones de la mesa</h3>
        </div>

        <div class="dialog__chips">
          @for (obs of observacionesPrimarias; track obs.id) {
            <button type="button" class="chip" [class.chip--selected]="isSelected(obs.id)" (click)="toggle(obs.id)">
              <span class="chip__icon">{{ obs.icon }}</span>
              <span class="chip__label">{{ obs.label }}</span>
            </button>
          }
          <button type="button"
                  class="chip chip--otros"
                  [class.chip--selected]="hasSecundariasSelected()"
                  (click)="otrosExpandido.update(v => !v)">
            <span class="chip__label">Otros</span>
            <svg class="chip__chevron"
                 [class.chip__chevron--open]="otrosExpandido()"
                 width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        @if (otrosExpandido()) {
          <div class="dialog__chips dialog__chips--secundarios">
            @for (obs of observacionesSecundarias; track obs.id) {
              <button type="button" class="chip" [class.chip--selected]="isSelected(obs.id)" (click)="toggle(obs.id)">
                <span class="chip__icon">{{ obs.icon }}</span>
                <span class="chip__label">{{ obs.label }}</span>
              </button>
            }
          </div>
        }

        <span class="dialog__sublabel">Nota adicional</span>
        <textarea class="dialog__textarea" placeholder="Agregar nota..." rows="3" #obs></textarea>

        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" (click)="onAceptar(obs.value)">Aceptar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; padding: 16px; }
    .dialog { background: #fff; border-radius: 16px; width: 480px; max-width: 100%; max-height: 90vh; overflow-y: auto; padding: 24px; animation: slideUp 0.2s ease-out; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }

    .dialog__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    .dialog__chips--secundarios { animation: slideDown 0.18s ease-out; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 12px; border-radius: 999px;
      border: 1.5px solid #E5E7EB; background: #fff; color: #374151;
      font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer;
      transition: border-color 0.12s, background 0.12s, color 0.12s;
    }
    .chip:hover { border-color: #F27920; background: #FFF7ED; }
    .chip--selected { border-color: #F27920; background: #F27920; color: #fff; }
    .chip--selected:hover { background: #E06D15; border-color: #E06D15; }
    .chip__icon { font-size: 14px; line-height: 1; }
    .chip__label { line-height: 1.1; }
    .chip--otros { background: #F9FAFB; border-style: dashed; color: #6B7280; }
    .chip--otros:hover { background: #FFF7ED; color: #374151; }
    .chip__chevron { transition: transform 0.2s; }
    .chip__chevron--open { transform: rotate(180deg); }

    .dialog__sublabel {
      display: block; font-size: 11px; font-weight: 700; color: #6B7280;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin: 16px 0 8px;
    }
    .dialog__textarea {
      width: 100%; padding: 12px; border: 1.5px solid #E5E7EB; border-radius: 10px;
      font-size: 14px; font-family: inherit; color: #374151;
      outline: none; resize: vertical; box-sizing: border-box;
    }
    .dialog__textarea:focus { border-color: #F27920; }
    .dialog__textarea::placeholder { color: #9CA3AF; }

    .dialog__footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
    .btn { padding: 10px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--cancel { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--cancel:hover { background: #F9FAFB; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slideDown { from { transform: translateY(-6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ObservacionDialogComponent {
  confirmar = output<ObservacionDialogResult>();
  cancelar = output<void>();

  readonly observacionesPrimarias = OBSERVACIONES_PRIMARIAS;
  readonly observacionesSecundarias = OBSERVACIONES_SECUNDARIAS;
  readonly selected = signal<Set<string>>(new Set());
  readonly otrosExpandido = signal(false);

  isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  hasSecundariasSelected(): boolean {
    const sel = this.selected();
    return OBSERVACIONES_SECUNDARIAS.some(o => sel.has(o.id));
  }

  toggle(id: string): void {
    this.selected.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  onAceptar(nota: string): void {
    this.confirmar.emit({
      predefinidas: Array.from(this.selected()),
      nota: nota.trim(),
    });
  }
}
