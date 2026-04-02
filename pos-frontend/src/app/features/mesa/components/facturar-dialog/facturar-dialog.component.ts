import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';

type TipoFactura = 'factura-a' | 'factura-b' | 'ticket';

interface FacturaOption {
  id: TipoFactura;
  label: string;
  detalle: string;
  icon: string;
}

@Component({
  selector: 'app-facturar-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <button class="dialog__close" (click)="cancelar.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="dialog__header">
          <span class="dialog__icon">🧾</span>
          <h3 class="dialog__title">Facturar</h3>
        </div>

        <span class="dialog__label">Selecciona el tipo de comprobante</span>

        <div class="dialog__options">
          @for (opt of opciones; track opt.id) {
            <button
              class="option-card"
              [class.option-card--selected]="selected() === opt.id"
              (click)="selected.set(opt.id)"
            >
              <div class="option-card__left">
                <span class="option-card__icon">{{ opt.icon }}</span>
                <div class="option-card__info">
                  <span class="option-card__label">{{ opt.label }}</span>
                  <span class="option-card__detalle">{{ opt.detalle }}</span>
                </div>
              </div>
              <div class="option-card__radio" [class.option-card__radio--active]="selected() === opt.id"></div>
            </button>
          }
        </div>

        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" [disabled]="!selected()" (click)="confirmar.emit()">Emitir</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 440px; max-width: 95vw; padding: 24px; position: relative; animation: slideUp 0.2s ease-out; }
    .dialog__close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 6px; }
    .dialog__close:hover { color: #374151; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__label { font-size: 12px; font-weight: 600; color: #6B7280; display: block; margin-bottom: 12px; }

    .dialog__options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .option-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px; border-radius: 12px; border: 1.5px solid #E5E7EB;
      background: #fff; cursor: pointer; font-family: inherit; transition: border-color 0.12s;
    }
    .option-card:hover { border-color: #F27920; }
    .option-card--selected { border-color: #F27920; background: #FFF7ED; }
    .option-card__left { display: flex; align-items: center; gap: 12px; }
    .option-card__icon { font-size: 28px; }
    .option-card__info { display: flex; flex-direction: column; }
    .option-card__label { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .option-card__detalle { font-size: 11px; color: #9CA3AF; }
    .option-card__radio {
      width: 20px; height: 20px; border-radius: 50%;
      border: 2px solid #D1D5DB; transition: border-color 0.12s;
    }
    .option-card__radio--active {
      border: 6px solid #F27920;
    }

    .dialog__footer { display: flex; justify-content: flex-end; gap: 10px; }
    .btn { padding: 10px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--cancel { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--cancel:hover { background: #F9FAFB; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }
    .btn--confirm:disabled { opacity: 0.4; cursor: not-allowed; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class FacturarDialogComponent {
  confirmar = output<void>();
  cancelar = output<void>();
  readonly selected = signal<TipoFactura | null>(null);

  readonly opciones: FacturaOption[] = [
    { id: 'factura-a', label: 'Factura A', detalle: 'Comprobante fiscal — Responsable Inscripto', icon: '🅰️' },
    { id: 'factura-b', label: 'Factura B', detalle: 'Comprobante fiscal — Consumidor Final', icon: '🅱️' },
    { id: 'ticket', label: 'Ticket', detalle: 'Comprobante no fiscal', icon: '🧾' },
  ];
}
