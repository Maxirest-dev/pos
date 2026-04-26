import { Component, signal, computed, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ShiftService } from '../../../../core/services/shift.service';

type Paso = 'confirmar' | 'recuento' | 'diferencia' | 'validado';

interface BilleteRow {
  valor: number;
  cantidad: number;
}

@Component({
  selector: 'app-cerrar-turno-dialog',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <button class="dialog__close" (click)="cancelar.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <!-- PASO 1: Confirmar cierre -->
        @if (paso() === 'confirmar') {
          <h3 class="dialog__title dialog__title--orange">Cerrando turno...</h3>

          <div class="turno-info">
            <div class="turno-info__calendar">
              <div class="cal-header">{{ dayNameShort() }}</div>
              <div class="cal-body">{{ dayNumber() }}</div>
            </div>
            <div class="turno-info__shift">
              <span class="turno-info__shift-icon">{{ shiftIcon() }}</span>
              <span class="turno-info__shift-sub">Turno</span>
              <span class="turno-info__shift-label">{{ shiftLabel() }}</span>
            </div>
            <div class="turno-info__saldo">
              <button class="recuento-btn" (click)="paso.set('recuento')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F27920" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Recuento caja
              </button>
              <span class="turno-info__saldo-sub">Saldo recaudado</span>
              <span class="turno-info__saldo-monto">\${{ saldoRecaudado | number:'1.0-0' }}</span>
            </div>
          </div>

          <button class="btn btn--confirm-lg" (click)="onCerrarTurno()">Cerrar turno</button>
        }

        <!-- PASO 2: Recuento de caja -->
        @if (paso() === 'recuento') {
          <div class="dialog__header-left">
            <h3 class="dialog__title">Recuento de caja</h3>
          </div>

          <table class="billetes-table">
            <thead>
              <tr>
                <th>BILLETES</th>
                <th>CANTIDAD</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              @for (row of billetes(); track row.valor) {
                <tr>
                  <td class="billetes-table__valor">\${{ row.valor | number:'1.0-0' }}</td>
                  <td>
                    <div class="qty-control">
                      <button class="qty-btn" (click)="updateBillete(row.valor, -1)">−</button>
                      <span class="qty-value">{{ row.cantidad }}</span>
                      <button class="qty-btn" (click)="updateBillete(row.valor, 1)">+</button>
                    </div>
                  </td>
                  <td class="billetes-table__total">\${{ row.valor * row.cantidad | number:'1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>

          <div class="recuento-total">
            <span class="recuento-total__label">TOTAL</span>
            <span class="recuento-total__monto">\${{ totalRecuento() | number:'1.0-0' }}</span>
          </div>

          <div class="dialog__footer">
            <button class="btn btn--secondary" (click)="resetBilletes()">Reiniciar conteo</button>
            <button class="btn btn--confirm" (click)="onGuardarRecuento()">Guardar</button>
          </div>
        }

        <!-- PASO 3: Diferencia detectada -->
        @if (paso() === 'diferencia') {
          <div class="dialog__header-left">
            <h3 class="dialog__title">Caja</h3>
          </div>

          <div class="diferencia-alert">
            <span class="diferencia-alert__icon">⚠️</span>
            <p class="diferencia-alert__text">Se detectó una diferencia entre el saldo de caja y el recuento realizado de:</p>
            <span class="diferencia-alert__monto">\${{ diferencia() | number:'1.0-0' }}</span>
          </div>

          <div class="dialog__footer">
            <button class="btn btn--secondary" (click)="paso.set('confirmar')">Continuar</button>
            <button class="btn btn--confirm" (click)="paso.set('recuento')">Revisar conteo</button>
          </div>
        }

        <!-- PASO 4: Validado -->
        @if (paso() === 'validado') {
          <div class="dialog__header-left">
            <h3 class="dialog__title">Recuento de caja</h3>
          </div>

          <div class="validado-msg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>El saldo de tu caja se validó correctamente.</span>
          </div>

          <div class="dialog__footer">
            <button class="btn btn--secondary" (click)="cancelar.emit()">Cancelar</button>
            <button class="btn btn--confirm" (click)="cerrarConfirmado.emit()">Continuar</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 500px; max-width: 95vw; padding: 28px; position: relative; animation: slideUp 0.2s ease-out; display: flex; flex-direction: column; align-items: center; gap: 20px; max-height: 90vh; overflow-y: auto; }
    .dialog__close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 6px; z-index: 1; }
    .dialog__close:hover { color: #374151; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__title--orange { color: #F27920; }
    .dialog__header-left { display: flex; align-items: center; gap: 10px; align-self: flex-start; }
    .dialog__icon { font-size: 24px; }

    /* Turno info */
    .turno-info { display: flex; align-items: center; gap: 20px; padding: 16px; border: 1px solid #E5E7EB; border-radius: 14px; width: 100%; }
    .turno-info__calendar { width: 68px; height: 68px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
    .cal-header { background: #01033E; padding: 4px 0; text-align: center; font-size: 9px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.8px; border-top: 3px solid #F27920; }
    .cal-body { background: #fff; flex: 1; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #01033E; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px; height: 44px; }
    .turno-info__shift { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .turno-info__shift-icon { font-size: 24px; }
    .turno-info__shift-sub { font-size: 10px; color: #9CA3AF; }
    .turno-info__shift-label { font-size: 16px; font-weight: 700; color: #1a1a1a; }
    .turno-info__saldo { display: flex; flex-direction: column; align-items: center; gap: 4px; margin-left: auto; }
    .recuento-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; border: 1.5px solid #F27920; background: #fff; color: #F27920; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .recuento-btn:hover { background: #FFF7ED; }
    .turno-info__saldo-sub { font-size: 10px; color: #9CA3AF; }
    .turno-info__saldo-monto { font-size: 20px; font-weight: 800; color: #1a1a1a; }

    .btn--confirm-lg { padding: 12px 48px; border-radius: 12px; border: none; background: #F27920; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--confirm-lg:hover { background: #E06D15; }

    /* Billetes table */
    .billetes-table { width: 100%; border-collapse: collapse; }
    .billetes-table th { font-size: 10px; font-weight: 600; color: #9CA3AF; text-align: left; padding: 6px 8px; border-bottom: 1px solid #E5E7EB; letter-spacing: 0.5px; }
    .billetes-table th:last-child { text-align: right; }
    .billetes-table td { padding: 6px 8px; border-bottom: 1px solid #F3F4F6; }
    .billetes-table__valor { font-size: 13px; font-weight: 600; color: #374151; }
    .billetes-table__total { font-size: 13px; font-weight: 600; color: #1a1a1a; text-align: right; }
    .qty-control { display: flex; align-items: center; gap: 6px; }
    .qty-btn { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #E5E7EB; background: #fff; color: #374151; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .qty-btn:hover { border-color: #F27920; color: #F27920; }
    .qty-value { font-size: 14px; font-weight: 700; min-width: 20px; text-align: center; }

    /* Recuento total */
    .recuento-total { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-top: 8px; border-top: 2px solid #E5E7EB; }
    .recuento-total__label { font-size: 12px; font-weight: 700; color: #F27920; }
    .recuento-total__monto { font-size: 22px; font-weight: 800; color: #F27920; }

    /* Diferencia */
    .diferencia-alert { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; width: 100%; text-align: center; }
    .diferencia-alert__icon { font-size: 32px; }
    .diferencia-alert__text { font-size: 13px; color: #92400E; margin: 0; line-height: 1.5; }
    .diferencia-alert__monto { font-size: 28px; font-weight: 800; color: #D97706; }

    /* Validado */
    .validado-msg { display: flex; align-items: center; gap: 10px; padding: 20px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; width: 100%; }
    .validado-msg span { font-size: 14px; color: #065F46; font-weight: 500; }

    /* Footer */
    .dialog__footer { display: flex; gap: 10px; width: 100%; justify-content: flex-end; }
    .btn { padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--secondary { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--secondary:hover { background: #F9FAFB; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class CerrarTurnoDialogComponent {
  private readonly shiftService = inject(ShiftService);
  cancelar = output<void>();
  cerrarConfirmado = output<void>();

  readonly paso = signal<Paso>('confirmar');
  readonly saldoRecaudado = 255000;

  readonly billetes = signal<BilleteRow[]>([
    { valor: 20000, cantidad: 1 },
    { valor: 10000, cantidad: 1 },
    { valor: 5000, cantidad: 0 },
    { valor: 2000, cantidad: 1 },
    { valor: 1000, cantidad: 1 },
    { valor: 500, cantidad: 0 },
    { valor: 200, cantidad: 1 },
    { valor: 100, cantidad: 1 },
    { valor: 50, cantidad: 0 },
  ]);

  readonly totalRecuento = computed(() =>
    this.billetes().reduce((sum, b) => sum + b.valor * b.cantidad, 0)
  );

  readonly diferencia = computed(() =>
    Math.abs(this.saldoRecaudado - this.totalRecuento())
  );

  private readonly selectedDate = this.shiftService.selectedDate;
  private readonly shiftOption = this.shiftService.selectedShiftOption;
  private readonly dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

  readonly dayNameShort = computed(() => this.dayNames[this.selectedDate().getDay()]);
  readonly dayNumber = computed(() => this.selectedDate().getDate());
  readonly shiftLabel = computed(() => this.shiftOption()?.label ?? 'Tarde');
  readonly shiftIcon = computed(() => this.shiftOption()?.icon ?? '🌤️');

  updateBillete(valor: number, delta: number): void {
    this.billetes.update(list =>
      list.map(b => b.valor === valor ? { ...b, cantidad: Math.max(0, b.cantidad + delta) } : b)
    );
  }

  resetBilletes(): void {
    this.billetes.update(list => list.map(b => ({ ...b, cantidad: 0 })));
  }

  onGuardarRecuento(): void {
    if (this.totalRecuento() === this.saldoRecaudado) {
      this.paso.set('validado');
    } else {
      this.paso.set('diferencia');
    }
  }

  onCerrarTurno(): void {
    this.cerrarConfirmado.emit();
  }
}
