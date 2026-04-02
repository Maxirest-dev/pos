import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PosHeaderComponent } from '../salon/components/pos-header/pos-header.component';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [PosHeaderComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-pos-header (cerrarTurno)="router.navigate(['/salon'])" />

      <div class="page__content">
        <div class="page__header">
          <button class="back-btn" (click)="router.navigate(['/salon'])">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 class="page__title">Estado de caja</h2>
            <p class="page__subtitle">Sesión de movimientos</p>
          </div>
        </div>

        <!-- Footer totals -->
        <div class="caja-footer">
          <div class="total-pill total-pill--green">
            <span class="total-pill__label">Aporte</span>
            <span class="total-pill__icon">💵</span>
            <span class="total-pill__value">44 UDS</span>
          </div>
          <div class="total-pill total-pill--red">
            <span class="total-pill__label">Retiro</span>
            <span class="total-pill__icon">📤</span>
            <span class="total-pill__value">0 UDS</span>
          </div>
          <div class="total-pill total-pill--orange">
            <span class="total-pill__label">Saldo</span>
            <span class="total-pill__icon">💰</span>
            <span class="total-pill__value">44 UDS</span>
          </div>
          <button class="cerrar-caja-btn" (click)="showCerrarDialog.set(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            CERRAR CAJA
          </button>
        </div>

        <!-- Columns -->
        <div class="caja-columns">
          <!-- Ingresos -->
          <div class="caja-col">
            <div class="caja-col__header">
              <span class="caja-col__dot caja-col__dot--green"></span>
              <span class="caja-col__title">INGRESOS</span>
              <span class="caja-col__count">{{ ingresos().length }} movimientos</span>
              <button class="caja-col__add-btn caja-col__add-btn--green" (click)="openMovDialog('ingreso')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar
              </button>
            </div>
            <div class="caja-col__list">
              @for (mov of ingresos(); track mov.id) {
                <div class="mov-row">
                  <span class="mov-row__desc">{{ mov.desc }}</span>
                  <span class="mov-row__monto mov-row__monto--green">\${{ mov.monto | number:'1.0-0' }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Egresos -->
          <div class="caja-col">
            <div class="caja-col__header">
              <span class="caja-col__dot caja-col__dot--red"></span>
              <span class="caja-col__title">EGRESOS</span>
              <span class="caja-col__count">{{ egresos().length }} movimientos</span>
              <button class="caja-col__add-btn caja-col__add-btn--red" (click)="openMovDialog('egreso')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar
              </button>
            </div>
            @if (egresos().length === 0) {
              <div class="caja-col__list caja-col__list--empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
                </svg>
                <span class="empty-text">No hay egresos a mostrar</span>
                <span class="empty-sub">Los egresos se agregarán aquí</span>
              </div>
            } @else {
              <div class="caja-col__list">
                @for (mov of egresos(); track mov.id) {
                  <div class="mov-row">
                    <span class="mov-row__desc">{{ mov.desc }}</span>
                    <span class="mov-row__monto mov-row__monto--red">\${{ mov.monto | number:'1.0-0' }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

      </div>
    </div>

    <!-- Nuevo movimiento dialog -->
    @if (showMovDialog()) {
      <div class="backdrop" (click)="showMovDialog.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <button class="dialog-close" (click)="showMovDialog.set(false)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="dialog__header-mov">
            <span class="dialog__dot" [class.dialog__dot--green]="movTipo() === 'ingreso'" [class.dialog__dot--red]="movTipo() === 'egreso'"></span>
            <h3 class="dialog__title">Nuevo {{ movTipo() }}</h3>
          </div>

          <div class="dialog__field">
            <label class="dialog__label">Descripción</label>
            <input type="text" class="dialog__input" placeholder="Ej: Venta mesa 5, Pago proveedor..." #descInput />
          </div>

          <div class="dialog__field">
            <label class="dialog__label">Monto</label>
            <div class="dialog__monto-wrap">
              <span class="dialog__monto-sign">$</span>
              <input type="text" class="dialog__monto-input" placeholder="0" #montoInput />
            </div>
          </div>

          <div class="dialog__field">
            <label class="dialog__label">Observaciones</label>
            <input type="text" class="dialog__input" placeholder="Nota opcional..." #obsInput />
          </div>

          <div class="dialog__footer-mov">
            <button class="btn btn--cancel" (click)="showMovDialog.set(false)">Cancelar</button>
            <button class="btn btn--confirm" (click)="onCrearMov(descInput.value, montoInput.value)">Registrar</button>
          </div>
        </div>
      </div>
    }

    <!-- Cerrar caja dialog -->
    @if (showCerrarDialog()) {
      <div class="backdrop" (click)="showCerrarDialog.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog__icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3 class="dialog__title" style="color:#F27920">Estás por cerrar tu caja</h3>
          <p class="dialog__sub">Verificá el saldo recaudado</p>
          <button class="dialog__recuento">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F27920" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Recuento caja
          </button>
          <span class="dialog__saldo-label">Saldo recaudado</span>
          <span class="dialog__saldo">\$255.000.000</span>
          <div class="dialog__footer">
            <button class="btn btn--cancel" (click)="showCerrarDialog.set(false)">Cancelar</button>
            <button class="btn btn--confirm" (click)="showCerrarDialog.set(false)">Aceptar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { display: flex; flex-direction: column; height: 100vh; height: 100dvh; background: #01033E; overflow: hidden; }
    .page__content { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
    .page__header { display: flex; align-items: center; gap: 12px; }
    .back-btn { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
    .back-btn:hover { color: #fff; }
    .page__title { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
    .page__subtitle { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }

    /* Columns */
    .caja-columns { display: flex; gap: 16px; flex: 1; min-height: 0; }
    .caja-col { flex: 1; display: flex; flex-direction: column; background: #0A0E4A; border-radius: 12px; border: 1px solid #374151; overflow: hidden; }
    .caja-col__header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; }
    .caja-col__dot { width: 10px; height: 10px; border-radius: 50%; }
    .caja-col__dot--green { background: #10B981; }
    .caja-col__dot--red { background: #EF4444; }
    .caja-col__title { font-size: 12px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
    .caja-col__count { font-size: 11px; color: rgba(255,255,255,0.35); margin-left: auto; }
    .caja-col__list { flex: 1; padding: 8px 0; overflow-y: auto; }
    .caja-col__list--empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 32px; }
    .empty-text { font-size: 13px; color: rgba(255,255,255,0.3); }
    .empty-sub { font-size: 11px; color: rgba(255,255,255,0.15); }
    .mov-row { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .mov-row__desc { font-size: 13px; color: rgba(255,255,255,0.7); }
    .mov-row__monto { font-size: 13px; font-weight: 700; }
    .mov-row__monto--green { color: #10B981; }
    .caja-col__add-btn {
      display: flex; align-items: center; gap: 5px; margin-left: auto; padding: 6px 14px;
      border-radius: 8px; border: none; font-size: 11px; font-weight: 600; color: #fff;
      cursor: pointer; font-family: inherit; transition: opacity 0.15s;
    }
    .caja-col__add-btn:hover { opacity: 0.85; }
    .caja-col__add-btn--green { background: #10B981; }
    .caja-col__add-btn--red { background: #EF4444; }
    .mov-row__monto--red { color: #EF4444; }

    /* Mov dialog extras */
    .dialog-close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 6px; }
    .dialog-close:hover { color: #374151; }
    .dialog__header-mov { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .dialog__dot { width: 12px; height: 12px; border-radius: 50%; }
    .dialog__dot--green { background: #10B981; }
    .dialog__dot--red { background: #EF4444; }
    .dialog__field { margin-bottom: 14px; width: 100%; text-align: left; }
    .dialog__field-row { display: flex; gap: 12px; }
    .dialog__label { display: block; font-size: 11px; font-weight: 600; color: #6B7280; margin-bottom: 4px; }
    .dialog__input, .dialog__select {
      width: 100%; padding: 9px 12px; border: 1.5px solid #E5E7EB; border-radius: 8px;
      font-size: 13px; font-family: inherit; color: #374151; outline: none; box-sizing: border-box;
    }
    .dialog__input:focus, .dialog__select:focus { border-color: #F27920; }
    .dialog__input::placeholder { color: #D1D5DB; }
    .dialog__select { background: #fff; }
    .dialog__monto-wrap {
      display: flex; align-items: center; gap: 4px; border: 1.5px solid #E5E7EB;
      border-radius: 8px; padding: 9px 12px; width: 100%; box-sizing: border-box;
    }
    .dialog__monto-wrap:focus-within { border-color: #F27920; }
    .dialog__monto-sign { font-size: 14px; font-weight: 700; color: #374151; }
    .dialog__monto-input { border: none; outline: none; font-size: 14px; font-weight: 700; color: #374151; width: 100%; font-family: inherit; }
    .dialog__monto-input::placeholder { color: #D1D5DB; font-weight: 400; }
    .dialog__footer-mov { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

    /* Footer */
    .caja-footer { display: flex; gap: 12px; align-items: stretch; flex-shrink: 0; }
    .total-pill { flex: 1; display: flex; align-items: center; gap: 10px; padding: 24px 20px; border-radius: 12px; }
    .total-pill--green { background: #065F46; }
    .total-pill--red { background: #7F1D1D; }
    .total-pill--orange { background: #78350F; }
    .total-pill__label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; }
    .total-pill__icon { font-size: 20px; }
    .total-pill__value { font-size: 16px; font-weight: 800; color: #fff; margin-left: auto; }
    .cerrar-caja-btn {
      display: flex; align-items: center; gap: 8px; padding: 24px 24px; border-radius: 12px;
      border: 1.5px solid #FDE68A; background: #FFFBEB; color: #92400E; font-size: 12px;
      font-weight: 700; cursor: pointer; font-family: inherit; letter-spacing: 0.5px;
    }
    .cerrar-caja-btn:hover { background: #FEF3C7; }

    /* Dialog */
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
    .dialog { background: #fff; border-radius: 16px; width: 460px; max-width: 95vw; padding: 28px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; position: relative; }
    .dialog__icon-wrap { width: 56px; height: 56px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; }
    .dialog__title { font-size: 18px; font-weight: 700; margin: 0; }
    .dialog__sub { font-size: 13px; color: #6B7280; margin: 0; }
    .dialog__recuento { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1.5px solid #F27920; background: #fff; color: #F27920; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .dialog__recuento:hover { background: #FFF7ED; }
    .dialog__saldo-label { font-size: 11px; color: #9CA3AF; margin-top: 4px; }
    .dialog__saldo { font-size: 28px; font-weight: 800; color: #1a1a1a; }
    .dialog__footer { display: flex; gap: 10px; margin-top: 8px; }
    .btn { padding: 10px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--cancel { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }
  `],
})
export class CajaComponent {
  readonly router = inject(Router);
  readonly showCerrarDialog = signal(false);
  readonly showMovDialog = signal(false);
  readonly movTipo = signal<'ingreso' | 'egreso'>('ingreso');
  private movCounter = 10;

  readonly ingresos = signal([
    { id: 'i1', desc: 'Venta mesa 3', monto: 833 },
    { id: 'i2', desc: 'Venta mesa 11', monto: 853 },
  ]);

  readonly egresos = signal<{ id: string; desc: string; monto: number }[]>([]);

  openMovDialog(tipo: 'ingreso' | 'egreso'): void {
    this.movTipo.set(tipo);
    this.showMovDialog.set(true);
  }

  onCrearMov(desc: string, montoStr: string): void {
    const monto = parseFloat(montoStr.replace(/\D/g, '')) || 0;
    if (!desc || !monto) return;
    const mov = { id: `mov-${++this.movCounter}`, desc, monto };
    if (this.movTipo() === 'ingreso') {
      this.ingresos.update(list => [...list, mov]);
    } else {
      this.egresos.update(list => [...list, mov]);
    }
    this.showMovDialog.set(false);
  }
}
