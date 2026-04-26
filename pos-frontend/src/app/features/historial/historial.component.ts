import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosHeaderComponent } from '../salon/components/pos-header/pos-header.component';

interface VentaItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Venta {
  mesa: string;
  concepto: string;
  mozo: string;
  hora: string;
  total: number;
  formaPago: string;
  comprobante: string;
  descuento: number;
  items: VentaItem[];
  anulado?: boolean;
}

type DialogMode = 'edit' | 'print' | 'cancel-confirm' | 'cancel-nc' | null;

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [PosHeaderComponent, DecimalPipe, FormsModule],
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
            <h2 class="page__title">Ventas por comprobante</h2>
            <p class="page__subtitle">Comprobantes de ventas</p>
          </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-row">
          @for (kpi of kpis; track kpi.tipo) {
            <div class="kpi-card">
              <span class="kpi-card__tipo">{{ kpi.tipo }}</span>
              <div class="kpi-card__row">
                <div>
                  <span class="kpi-card__label">TOTAL</span>
                  <span class="kpi-card__monto">\${{ kpi.total | number:'1.0-0' }}</span>
                </div>
                <div>
                  <span class="kpi-card__label">CANTIDAD</span>
                  <span class="kpi-card__count">#{{ kpi.cantidad }}</span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Table -->
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Mesa / Pedido</th><th>Concepto</th><th>Mozo</th><th>Hora</th>
                <th>Total</th><th>F. Cobro</th><th>Comprobante</th><th>Descuento</th>
                <th class="th--actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (v of ventas(); track v.comprobante) {
                <tr [class.row--anulado]="v.anulado">
                  <td>{{ v.mesa }}</td>
                  <td>{{ v.concepto }}</td>
                  <td>{{ v.mozo || '—' }}</td>
                  <td>{{ v.hora }}</td>
                  <td class="td-monto">\${{ v.total | number:'1.0-0' }}</td>
                  <td>{{ v.formaPago }}</td>
                  <td>
                    <span class="comp-badge">{{ v.comprobante }}</span>
                    @if (v.anulado) { <span class="anulado-badge">Anulado</span> }
                  </td>
                  <td>\${{ v.descuento | number:'1.0-0' }}</td>
                  <td class="td--actions">
                    <div class="actions">
                      <button class="action-btn action-btn--edit" type="button" [disabled]="v.anulado" (click)="openEdit(v)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Editar</span>
                      </button>
                      <button class="action-btn action-btn--print" type="button" (click)="openPrint(v)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="6 9 6 2 18 2 18 9"/>
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                          <rect x="6" y="14" width="12" height="8"/>
                        </svg>
                        <span>Reimprimir</span>
                      </button>
                      <button class="action-btn action-btn--cancel" type="button" [disabled]="v.anulado" (click)="openCancel(v)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                        <span>Anular</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============ EDIT DIALOG ============ -->
    @if (dialogMode() === 'edit' && editDraft(); as draft) {
      <div class="backdrop" (click)="closeDialog()">
        <div class="dialog dialog--edit" (click)="$event.stopPropagation()">
          <button class="dialog__close" (click)="closeDialog()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div class="dialog__title-row">
            <h3 class="dialog__title">Editar comprobante</h3>
            <span class="comp-badge comp-badge--lg">{{ draft.comprobante }}</span>
          </div>

          <div class="dialog__grid">
            <div class="field">
              <label class="field__label">Mesa / Pedido</label>
              <input class="field__input" [ngModel]="draft.mesa" (ngModelChange)="updateDraft('mesa', $event)" />
            </div>
            <div class="field">
              <label class="field__label">Concepto</label>
              <select class="field__input" [ngModel]="draft.concepto" (ngModelChange)="updateDraft('concepto', $event)">
                <option value="Restorán">Restorán</option>
                <option value="Delivery">Delivery</option>
                <option value="Mostrador">Mostrador</option>
                <option value="Pedidos Ya">Pedidos Ya</option>
                <option value="Rappi">Rappi</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label">Mozo</label>
              <input class="field__input" [ngModel]="draft.mozo" (ngModelChange)="updateDraft('mozo', $event)" />
            </div>
            <div class="field">
              <label class="field__label">Hora</label>
              <input class="field__input" [ngModel]="draft.hora" (ngModelChange)="updateDraft('hora', $event)" />
            </div>
            <div class="field">
              <label class="field__label">Forma de cobro</label>
              <select class="field__input" [ngModel]="draft.formaPago" (ngModelChange)="updateDraft('formaPago', $event)">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="QR">QR</option>
                <option value="Cheque">Cheque</option>
                <option value="MercadoPago">MercadoPago</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label">Descuento</label>
              <div class="field__money">
                <span class="field__sign">$</span>
                <input class="field__input field__input--money" type="number" [ngModel]="draft.descuento" (ngModelChange)="updateDraft('descuento', +$event)" />
              </div>
            </div>
          </div>

          <div class="dialog__section">
            <span class="dialog__section-label">Items facturados</span>
            <div class="items-table">
              <div class="items-table__header">
                <span>Detalle</span>
                <span>Cant</span>
                <span>Precio</span>
                <span>Subtotal</span>
                <span></span>
              </div>
              @for (it of draft.items; track $index; let i = $index) {
                <div class="items-table__row">
                  <input class="field__input" [ngModel]="it.nombre" (ngModelChange)="updateItem(i, 'nombre', $event)" />
                  <input class="field__input field__input--num" type="number" min="1" [ngModel]="it.cantidad" (ngModelChange)="updateItem(i, 'cantidad', +$event)" />
                  <input class="field__input field__input--num" type="number" min="0" [ngModel]="it.precio" (ngModelChange)="updateItem(i, 'precio', +$event)" />
                  <span class="items-table__subtotal">\${{ (it.cantidad * it.precio) | number:'1.0-0' }}</span>
                  <button class="items-table__del" (click)="removeItem(i)" title="Quitar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              }
              <button class="items-table__add" (click)="addItem()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar item
              </button>
            </div>
          </div>

          <div class="dialog__totals">
            <span class="dialog__totals-label">Total</span>
            <span class="dialog__totals-value">\${{ draftTotal() | number:'1.0-0' }}</span>
          </div>

          <div class="dialog__actions">
            <button class="btn btn--cancel" (click)="closeDialog()">Cancelar</button>
            <button class="btn btn--confirm" (click)="saveEdit()">Guardar cambios</button>
          </div>
        </div>
      </div>
    }

    <!-- ============ REIMPRIMIR DIALOG ============ -->
    @if (dialogMode() === 'print' && selectedVenta(); as v) {
      <div class="backdrop" (click)="closeDialog()">
        <div class="dialog dialog--sm" (click)="$event.stopPropagation()">
          <div class="dialog__icon-wrap dialog__icon-wrap--info">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
          </div>
          <h3 class="dialog__title">Reimprimir comprobante</h3>
          <p class="dialog__sub">Se enviará una nueva copia a la impresora</p>
          <div class="dialog__detail">
            <span class="comp-badge comp-badge--lg">{{ v.comprobante }}</span>
            <span class="dialog__detail-monto">\${{ v.total | number:'1.0-0' }}</span>
          </div>
          <div class="dialog__actions dialog__actions--center">
            <button class="btn btn--cancel" (click)="closeDialog()">Cancelar</button>
            <button class="btn btn--confirm btn--info" (click)="confirmPrint()">Reimprimir</button>
          </div>
        </div>
      </div>
    }

    <!-- ============ ANULAR CONFIRMACIÓN ============ -->
    @if (dialogMode() === 'cancel-confirm' && selectedVenta(); as v) {
      <div class="backdrop" (click)="closeDialog()">
        <div class="dialog dialog--sm" (click)="$event.stopPropagation()">
          <div class="dialog__icon-wrap dialog__icon-wrap--danger">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <h3 class="dialog__title">¿Anular comprobante?</h3>
          <p class="dialog__sub">¿Desea anular el comprobante <b>{{ v.comprobante }}</b>?</p>
          <p class="dialog__sub dialog__sub--warning">Esta acción no se puede deshacer.</p>
          <div class="dialog__actions dialog__actions--center">
            <button class="btn btn--cancel" (click)="closeDialog()">Cancelar</button>
            <button class="btn btn--confirm btn--danger" (click)="confirmCancel()">Sí, anular</button>
          </div>
        </div>
      </div>
    }

    <!-- ============ NOTA DE CRÉDITO ============ -->
    @if (dialogMode() === 'cancel-nc' && selectedVenta(); as v) {
      <div class="backdrop" (click)="closeDialog()">
        <div class="dialog dialog--sm" (click)="$event.stopPropagation()">
          <div class="dialog__icon-wrap dialog__icon-wrap--warn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3 class="dialog__title">Emitir nota de crédito</h3>
          <p class="dialog__sub">El comprobante <b>{{ v.comprobante }}</b> fue anulado correctamente.</p>
          <p class="dialog__sub">¿Desea emitir una nota de crédito por <b>\${{ v.total | number:'1.0-0' }}</b>?</p>
          <div class="dialog__actions dialog__actions--center">
            <button class="btn btn--cancel" (click)="closeDialog()">No, gracias</button>
            <button class="btn btn--confirm" (click)="emitNotaCredito()">Sí, emitir</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { display: flex; flex-direction: column; height: 100vh; height: 100dvh; background: #F8FAFC; overflow: hidden; }
    .page__content { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
    .page__header { display: flex; align-items: center; gap: 12px; }
    .back-btn { background: none; border: none; color: #6B7280; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
    .back-btn:hover { color: #1a1a1a; }
    .page__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .page__subtitle { font-size: 12px; color: #6B7280; margin: 0; }

    /* KPIs */
    .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .kpi-card { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }
    .kpi-card__tipo { font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.3px; }
    .kpi-card__row { display: flex; justify-content: space-between; margin-top: 10px; }
    .kpi-card__label { display: block; font-size: 9px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-card__monto { font-size: 22px; font-weight: 800; color: #1a1a1a; }
    .kpi-card__count { font-size: 16px; font-weight: 700; color: #9CA3AF; }

    /* Table */
    .table-wrap { flex: 1; overflow: auto; border-radius: 10px; border: 1px solid #E5E7EB; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }
    .table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
    .table thead { position: sticky; top: 0; z-index: 1; }
    .table th {
      background: #F8FAFC; color: #90A1B9; font-size: 12px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 12px; text-align: left;
      border-bottom: 1px solid #E2E8F0; white-space: nowrap;
    }
    .table td { padding: 10px 12px; color: #314158; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
    .table tbody tr:hover td { background: #F8FAFC; }
    .row--anulado td { color: #9CA3AF; text-decoration: line-through; }
    .row--anulado .td-monto, .row--anulado .comp-badge { text-decoration: line-through; }
    .td-monto { font-weight: 600; color: #0F172B; }
    .comp-badge { padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; background: #F1F5F9; color: #475569; font-family: inherit; }
    .comp-badge--lg { font-size: 13px; padding: 4px 10px; }
    .anulado-badge { margin-left: 6px; padding: 2px 6px; font-size: 10px; font-weight: 700; color: #B91C1C; background: #FEF2F2; border-radius: 6px; }

    /* Actions column */
    .th--actions, .td--actions { width: 1%; white-space: nowrap; }
    .actions { display: flex; gap: 6px; align-items: center; }
    .action-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 28px; padding: 0 10px; border-radius: 6px;
      border: 1px solid #E5E7EB; background: #fff; color: #6B7280;
      font-size: 12px; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: color 0.12s, background 0.12s, border-color 0.12s;
    }
    .action-btn:hover:not(:disabled) { background: #F9FAFB; }
    .action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .action-btn--edit:hover:not(:disabled) { color: #1D4ED8; border-color: #BFDBFE; background: #EFF6FF; }
    .action-btn--print:hover:not(:disabled) { color: #047857; border-color: #A7F3D0; background: #ECFDF5; }
    .action-btn--cancel:hover:not(:disabled) { color: #B91C1C; border-color: #FECACA; background: #FEF2F2; }

    /* ===== Dialogs ===== */
    .backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 200;
      animation: fadeIn 0.15s ease-out; padding: 16px;
    }
    .dialog {
      background: #fff; border-radius: 16px; padding: 28px 32px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      max-height: 90vh; overflow-y: auto; position: relative;
      animation: slideUp 0.2s ease-out;
    }
    .dialog--sm {
      width: 440px; max-width: 100%;
      display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
    }
    .dialog--edit {
      width: 720px; max-width: 100%;
      display: flex; flex-direction: column; gap: 18px;
    }
    .dialog__close {
      position: absolute; top: 12px; right: 12px;
      width: 32px; height: 32px; border-radius: 8px;
      border: none; background: #F3F4F6; color: #6B7280;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .dialog__close:hover { background: #E5E7EB; color: #1a1a1a; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #0F172B; margin: 0; }
    .dialog__title-row { display: flex; align-items: center; gap: 12px; padding-right: 40px; }
    .dialog__sub { font-size: 13px; color: #6B7280; margin: 0; }
    .dialog__sub b { color: #1a1a1a; }
    .dialog__sub--warning { color: #B91C1C; font-weight: 500; }

    .dialog__icon-wrap {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 4px;
    }
    .dialog__icon-wrap--info { background: #EFF6FF; }
    .dialog__icon-wrap--danger { background: #FEF2F2; }
    .dialog__icon-wrap--warn { background: #FFF7ED; }

    .dialog__detail {
      display: flex; align-items: center; gap: 12px; margin: 4px 0 8px;
    }
    .dialog__detail-monto { font-size: 20px; font-weight: 800; color: #1a1a1a; }

    /* Edit dialog grid */
    .dialog__grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px 16px;
    }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field__label { font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.4px; }
    .field__input {
      width: 100%; padding: 9px 12px; border: 1.5px solid #E5E7EB; border-radius: 8px;
      font-size: 13px; font-family: inherit; color: #1a1a1a; outline: none; box-sizing: border-box;
      background: #fff; transition: border-color 0.12s;
    }
    .field__input:focus { border-color: #F27920; }
    .field__money {
      display: flex; align-items: center; gap: 4px;
      border: 1.5px solid #E5E7EB; border-radius: 8px;
      padding: 0 12px; box-sizing: border-box;
    }
    .field__money:focus-within { border-color: #F27920; }
    .field__money .field__input { border: none; padding: 9px 0; }
    .field__sign { font-size: 13px; font-weight: 700; color: #6B7280; }
    .field__input--money { text-align: right; }
    .field__input--num { text-align: right; max-width: 80px; }

    /* Items table */
    .dialog__section { display: flex; flex-direction: column; gap: 8px; }
    .dialog__section-label { font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .items-table { display: flex; flex-direction: column; gap: 6px; }
    .items-table__header {
      display: grid; grid-template-columns: 1fr 80px 100px 100px 32px;
      gap: 8px; align-items: center;
      font-size: 10px; font-weight: 700; color: #9CA3AF;
      text-transform: uppercase; letter-spacing: 0.5px;
      padding: 0 8px;
    }
    .items-table__header span:nth-child(2),
    .items-table__header span:nth-child(3),
    .items-table__header span:nth-child(4) { text-align: right; }
    .items-table__row {
      display: grid; grid-template-columns: 1fr 80px 100px 100px 32px;
      gap: 8px; align-items: center;
    }
    .items-table__subtotal { font-size: 13px; font-weight: 700; color: #1a1a1a; text-align: right; }
    .items-table__del {
      width: 32px; height: 32px; border-radius: 6px;
      border: 1px solid #E5E7EB; background: #fff; color: #6B7280;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: color 0.12s, background 0.12s, border-color 0.12s;
    }
    .items-table__del:hover { color: #B91C1C; border-color: #FECACA; background: #FEF2F2; }
    .items-table__add {
      align-self: flex-start;
      display: inline-flex; align-items: center; gap: 4px;
      padding: 6px 12px; border-radius: 8px;
      border: 1.5px dashed #D1D5DB; background: transparent; color: #6B7280;
      font-size: 12px; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: all 0.12s; margin-top: 4px;
    }
    .items-table__add:hover { color: #F27920; border-color: #F27920; background: #FFF7ED; }

    .dialog__totals {
      display: flex; align-items: center; justify-content: flex-end; gap: 12px;
      padding-top: 14px; border-top: 1px solid #F1F5F9;
    }
    .dialog__totals-label { font-size: 13px; color: #6B7280; font-weight: 600; }
    .dialog__totals-value { font-size: 24px; font-weight: 800; color: #1a1a1a; }

    /* Buttons */
    .dialog__actions { display: flex; justify-content: flex-end; gap: 10px; }
    .dialog__actions--center { justify-content: center; width: 100%; margin-top: 4px; }
    .btn {
      padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: inherit; transition: background 0.12s, color 0.12s;
    }
    .btn--cancel { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--cancel:hover { background: #F9FAFB; color: #1a1a1a; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }
    .btn--info { background: #1D4ED8; }
    .btn--info:hover { background: #1E40AF; }
    .btn--danger { background: #DC2626; }
    .btn--danger:hover { background: #B91C1C; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 720px) {
      .dialog__grid { grid-template-columns: 1fr; }
    }
  `],
})
export class HistorialComponent {
  readonly router = inject(Router);

  readonly kpis = [
    { tipo: 'Factura B', total: 1501089, cantidad: 35 },
    { tipo: 'Factura A', total: 1501089, cantidad: 35 },
    { tipo: 'Ticket Fiscal', total: 1501089, cantidad: 35 },
  ];

  readonly ventas = signal<Venta[]>([
    { mesa: '3',    concepto: 'Restorán',   mozo: 'Carlos', hora: '20:15', total: 8500,  formaPago: 'Efectivo',     comprobante: 'B-0001-00001892', descuento: 0,    items: [
      { nombre: 'Milanesa napolitana', cantidad: 1, precio: 6500 },
      { nombre: 'Coca-Cola 500ml',     cantidad: 2, precio: 1000 },
    ] },
    { mesa: '#142', concepto: 'Pedidos Ya', mozo: '',       hora: '20:32', total: 15200, formaPago: 'Tarjeta',       comprobante: 'B-0001-00001893', descuento: 0,    items: [
      { nombre: 'Pizza muzzarella',   cantidad: 1, precio: 9200 },
      { nombre: 'Empanadas (12u)',    cantidad: 1, precio: 6000 },
    ] },
    { mesa: '7',    concepto: 'Restorán',   mozo: 'María',  hora: '20:48', total: 22000, formaPago: 'Transferencia', comprobante: 'A-0001-00001894', descuento: 0,    items: [
      { nombre: 'Bife de chorizo',     cantidad: 2, precio: 9000 },
      { nombre: 'Vino Malbec 750ml',  cantidad: 1, precio: 4000 },
    ] },
    { mesa: '#143', concepto: 'Mostrador',  mozo: '',       hora: '21:05', total: 9800,  formaPago: 'QR',            comprobante: 'B-0001-00001895', descuento: 0,    items: [
      { nombre: 'Sandwich club',       cantidad: 1, precio: 5800 },
      { nombre: 'Café con leche',      cantidad: 2, precio: 2000 },
    ] },
    { mesa: '11',   concepto: 'Restorán',   mozo: 'Carlos', hora: '21:18', total: 31500, formaPago: 'Efectivo',     comprobante: 'B-0001-00001896', descuento: 1500, items: [
      { nombre: 'Parrillada para 4',   cantidad: 1, precio: 24000 },
      { nombre: 'Ensalada mixta',      cantidad: 2, precio: 3500 },
      { nombre: 'Agua mineral',        cantidad: 4, precio: 500 },
    ] },
    { mesa: '#144', concepto: 'Delivery',   mozo: '',       hora: '21:34', total: 18700, formaPago: 'Transferencia', comprobante: 'A-0001-00001897', descuento: 0,    items: [
      { nombre: 'Lomo completo',       cantidad: 2, precio: 7500 },
      { nombre: 'Papas con cheddar',   cantidad: 1, precio: 3700 },
    ] },
    { mesa: '5',    concepto: 'Restorán',   mozo: 'María',  hora: '21:50', total: 12000, formaPago: 'Cheque',       comprobante: 'B-0001-00001898', descuento: 600,  items: [
      { nombre: 'Pasta a la bolognesa', cantidad: 1, precio: 6800 },
      { nombre: 'Tiramisú',            cantidad: 1, precio: 3500 },
      { nombre: 'Agua saborizada',     cantidad: 2, precio: 850 },
    ] },
  ]);

  readonly dialogMode = signal<DialogMode>(null);
  readonly selectedVenta = signal<Venta | null>(null);
  readonly editDraft = signal<Venta | null>(null);

  readonly draftTotal = computed(() => {
    const d = this.editDraft();
    if (!d) return 0;
    const subtotal = d.items.reduce((sum, it) => sum + it.cantidad * it.precio, 0);
    return Math.max(0, subtotal - (d.descuento || 0));
  });

  openEdit(v: Venta): void {
    this.selectedVenta.set(v);
    this.editDraft.set({ ...v, items: v.items.map(i => ({ ...i })) });
    this.dialogMode.set('edit');
  }

  openPrint(v: Venta): void {
    this.selectedVenta.set(v);
    this.dialogMode.set('print');
  }

  openCancel(v: Venta): void {
    this.selectedVenta.set(v);
    this.dialogMode.set('cancel-confirm');
  }

  closeDialog(): void {
    this.dialogMode.set(null);
    this.selectedVenta.set(null);
    this.editDraft.set(null);
  }

  updateDraft<K extends keyof Venta>(key: K, value: Venta[K]): void {
    this.editDraft.update(d => d ? { ...d, [key]: value } : d);
  }

  updateItem(index: number, key: keyof VentaItem, value: any): void {
    this.editDraft.update(d => {
      if (!d) return d;
      const items = [...d.items];
      items[index] = { ...items[index], [key]: value };
      return { ...d, items };
    });
  }

  addItem(): void {
    this.editDraft.update(d => d ? { ...d, items: [...d.items, { nombre: '', cantidad: 1, precio: 0 }] } : d);
  }

  removeItem(index: number): void {
    this.editDraft.update(d => d ? { ...d, items: d.items.filter((_, i) => i !== index) } : d);
  }

  saveEdit(): void {
    const draft = this.editDraft();
    if (!draft) return;
    const newTotal = this.draftTotal();
    this.ventas.update(list => list.map(v =>
      v.comprobante === draft.comprobante ? { ...draft, total: newTotal } : v,
    ));
    this.closeDialog();
  }

  confirmPrint(): void {
    // TODO: integrar con servicio de impresión
    this.closeDialog();
  }

  confirmCancel(): void {
    const v = this.selectedVenta();
    if (!v) return;
    this.ventas.update(list => list.map(x =>
      x.comprobante === v.comprobante ? { ...x, anulado: true } : x,
    ));
    this.dialogMode.set('cancel-nc');
  }

  emitNotaCredito(): void {
    // TODO: emitir nota de crédito real
    this.closeDialog();
  }
}
