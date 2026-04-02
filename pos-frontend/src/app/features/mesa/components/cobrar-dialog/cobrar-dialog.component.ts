import { Component, input, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

type MedioPago = 'efectivo' | 'transferencia' | 'qr' | 'billetera' | 'credito' | 'debito';

interface MedioPagoOption {
  id: MedioPago;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-cobrar-dialog',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <button class="dialog__close" (click)="cancelar.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="dialog__header">
          <span class="dialog__icon">💰</span>
          <h3 class="dialog__title">Cobrar</h3>
        </div>

        <!-- Monto -->
        <div class="dialog__monto-section">
          <span class="dialog__monto-label">Importe a cobrar</span>
          <div class="dialog__monto-input-wrap">
            <span class="dialog__monto-sign">$</span>
            <input
              class="dialog__monto-input"
              type="text"
              [value]="montoInput()"
              (input)="onMontoChange($event)"
            />
          </div>
          @if (esParcial()) {
            <span class="dialog__monto-parcial">Cobro parcial — Total: \${{ total() | number:'1.0-0' }}</span>
          }
        </div>

        <!-- Medios de pago -->
        <span class="dialog__section-label">Medio de pago</span>
        <div class="dialog__medios">
          @for (medio of medios; track medio.id) {
            <button
              class="medio-card"
              [class.medio-card--selected]="selectedMedio() === medio.id"
              (click)="selectedMedio.set(medio.id)"
            >
              <span class="medio-card__icon">{{ medio.icon }}</span>
              <span class="medio-card__label">{{ medio.label }}</span>
            </button>
          }
        </div>

        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" [disabled]="!selectedMedio()" (click)="confirmar.emit()">Cobrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 480px; max-width: 95vw; padding: 24px; position: relative; animation: slideUp 0.2s ease-out; }
    .dialog__close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 6px; }
    .dialog__close:hover { color: #374151; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }

    /* Monto */
    .dialog__monto-section { margin-bottom: 20px; text-align: center; }
    .dialog__monto-label { font-size: 12px; font-weight: 600; color: #6B7280; display: block; margin-bottom: 8px; }
    .dialog__monto-input-wrap {
      display: inline-flex; align-items: center; gap: 4px;
      border: 2px solid #E5E7EB; border-radius: 12px; padding: 10px 20px;
      transition: border-color 0.15s;
    }
    .dialog__monto-input-wrap:focus-within { border-color: #F27920; }
    .dialog__monto-sign { font-size: 24px; font-weight: 800; color: #1a1a1a; }
    .dialog__monto-input {
      border: none; outline: none; font-size: 28px; font-weight: 800; color: #1a1a1a;
      width: 160px; text-align: center; font-family: inherit;
    }
    .dialog__monto-parcial { display: block; margin-top: 6px; font-size: 12px; color: #F27920; font-weight: 500; }

    /* Medios */
    .dialog__section-label { font-size: 12px; font-weight: 600; color: #6B7280; display: block; margin-bottom: 10px; }
    .dialog__medios { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .medio-card {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 16px 8px; border-radius: 12px; border: 1.5px solid #E5E7EB;
      background: #fff; cursor: pointer; font-family: inherit; transition: border-color 0.12s;
    }
    .medio-card:hover { border-color: #F27920; }
    .medio-card--selected { border-color: #F27920; background: #FFF7ED; }
    .medio-card__icon { font-size: 28px; }
    .medio-card__label { font-size: 11px; font-weight: 600; color: #374151; text-align: center; }

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
export class CobrarDialogComponent {
  total = input.required<number>();
  confirmar = output<void>();
  cancelar = output<void>();

  readonly montoInput = signal('');
  readonly selectedMedio = signal<MedioPago | null>(null);

  readonly esParcial = signal(false);

  readonly medios: MedioPagoOption[] = [
    { id: 'efectivo', label: 'Efectivo', icon: '💵' },
    { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
    { id: 'qr', label: 'QR', icon: '📱' },
    { id: 'billetera', label: 'Billetera virtual', icon: '👛' },
    { id: 'credito', label: 'Tarjeta crédito', icon: '💳' },
    { id: 'debito', label: 'Tarjeta débito', icon: '💳' },
  ];

  ngOnInit(): void {
    this.montoInput.set(this.total().toLocaleString('es-AR'));
  }

  onMontoChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.montoInput.set(raw);
    const num = parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0;
    this.esParcial.set(num < this.total() && num > 0);
  }
}
