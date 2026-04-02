import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';

interface DescuentoOpcion {
  id: string;
  valor: string;
  tipo: '%' | '$';
  label: string;
}

@Component({
  selector: 'app-descuento-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <button class="dialog__close" (click)="cancelar.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="dialog__header">
          <span class="dialog__icon">🏷️</span>
          <h3 class="dialog__title">Descuentos</h3>
        </div>

        <h4 class="dialog__subtitle">Descuentos disponibles</h4>
        <div class="dialog__grid">
          @for (d of opciones; track d.id) {
            <button class="card" [class.card--selected]="selected() === d.id" (click)="selected.set(d.id)">
              <span class="card__valor">{{ d.valor }}</span>
              <span class="card__label">{{ d.label }}</span>
            </button>
          }
        </div>

        <h4 class="dialog__subtitle">Descuento personalizado</h4>
        <div class="dialog__custom">
          <div class="dialog__toggle">
            <button class="toggle-btn" [class.toggle-btn--active]="customTipo() === '%'" (click)="customTipo.set('%')">%</button>
            <button class="toggle-btn" [class.toggle-btn--active]="customTipo() === '$'" (click)="customTipo.set('$')">$</button>
          </div>
          <input type="text" class="dialog__custom-input" placeholder="0.00" />
        </div>

        <div class="dialog__footer">
          <button class="btn btn--confirm" (click)="aplicar.emit()">Aplicar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 520px; max-width: 95vw; padding: 24px; position: relative; animation: slideUp 0.2s ease-out; }
    .dialog__close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 6px; }
    .dialog__close:hover { color: #374151; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__subtitle { font-size: 12px; font-weight: 600; color: #6B7280; margin: 0 0 12px 0; }
    .dialog__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 8px; border-radius: 12px; border: 1.5px solid #E5E7EB; background: #fff; cursor: pointer; font-family: inherit; transition: border-color 0.12s; }
    .card:hover { border-color: #F27920; }
    .card--selected { border-color: #F27920; background: #FFF7ED; }
    .card__valor { font-size: 18px; font-weight: 800; color: #1a1a1a; }
    .card__label { font-size: 10px; color: #9CA3AF; text-align: center; }
    .dialog__custom { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .dialog__toggle { display: flex; border-radius: 8px; overflow: hidden; border: 1.5px solid #E5E7EB; }
    .toggle-btn { padding: 8px 14px; border: none; background: #fff; color: #6B7280; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.12s; }
    .toggle-btn--active { background: #F27920; color: #fff; }
    .dialog__custom-input { flex: 1; padding: 8px 12px; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; }
    .dialog__custom-input:focus { border-color: #F27920; }
    .dialog__custom-input::placeholder { color: #D1D5DB; }
    .dialog__footer { display: flex; justify-content: flex-end; }
    .btn--confirm { padding: 10px 40px; border-radius: 10px; border: none; background: #F27920; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--confirm:hover { background: #E06D15; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class DescuentoDialogComponent {
  aplicar = output<void>();
  cancelar = output<void>();
  readonly selected = signal<string | null>(null);
  readonly customTipo = signal<'%' | '$'>('%');

  readonly opciones: DescuentoOpcion[] = [
    { id: 'd1', valor: '10%', tipo: '%', label: 'Combo' },
    { id: 'd2', valor: '15%', tipo: '%', label: 'Menores' },
    { id: 'd3', valor: '20%', tipo: '%', label: 'Diferencia' },
    { id: 'd4', valor: '25%', tipo: '%', label: 'Jubilados' },
    { id: 'd5', valor: '30%', tipo: '%', label: 'Especial' },
    { id: 'd6', valor: '$500', tipo: '$', label: 'Beneficio' },
    { id: 'd7', valor: '$1000', tipo: '$', label: 'Específico' },
    { id: 'd8', valor: '$2000', tipo: '$', label: 'Día de todo' },
  ];
}
