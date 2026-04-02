import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PosHeaderComponent } from '../salon/components/pos-header/pos-header.component';

interface Venta {
  fecha: string; comprobante: string; total: number; formaPago: string;
  cantidad: number; descuento: number; totalNeto: number; nota: string;
  concepto: string; mozo: string; mesa: string; comensales: number;
}

@Component({
  selector: 'app-historial',
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
                <th>Fecha</th><th>Comprobante</th><th>Total</th><th>F. de Pago</th>
                <th>Cant</th><th>Descuento</th><th>Total</th><th>Nota/Ajuste</th>
                <th>Concepto</th><th>Mozo</th><th>Mesa</th><th>Cubiertos</th>
              </tr>
            </thead>
            <tbody>
              @for (v of ventas; track v.comprobante) {
                <tr>
                  <td>{{ v.fecha }}</td>
                  <td><span class="comp-badge">{{ v.comprobante }}</span></td>
                  <td class="td-monto">\${{ v.total | number:'1.0-0' }}</td>
                  <td>{{ v.formaPago }}</td>
                  <td>{{ v.cantidad }}</td>
                  <td>\${{ v.descuento | number:'1.0-0' }}</td>
                  <td class="td-monto">\${{ v.totalNeto | number:'1.0-0' }}</td>
                  <td>{{ v.nota }}</td>
                  <td>{{ v.concepto }}</td>
                  <td>{{ v.mozo }}</td>
                  <td>{{ v.mesa }}</td>
                  <td>{{ v.comensales }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; height: 100vh; height: 100dvh; background: #01033E; overflow: hidden; }
    .page__content { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
    .page__header { display: flex; align-items: center; gap: 12px; }
    .back-btn { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
    .back-btn:hover { color: #fff; }
    .page__title { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
    .page__subtitle { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }

    /* KPIs */
    .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .kpi-card { background: #0A0E4A; border-radius: 12px; padding: 16px; border: 1px solid #374151; }
    .kpi-card__tipo { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.3px; }
    .kpi-card__row { display: flex; justify-content: space-between; margin-top: 10px; }
    .kpi-card__label { display: block; font-size: 9px; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-card__monto { font-size: 22px; font-weight: 800; color: #fff; }
    .kpi-card__count { font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.5); }

    /* Table */
    .table-wrap { flex: 1; overflow: auto; border-radius: 10px; border: 1px solid #374151; }
    .table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .table thead { position: sticky; top: 0; z-index: 1; }
    .table th {
      background: #0A0E4A; color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left;
      border-bottom: 1px solid #374151; white-space: nowrap;
    }
    .table td { padding: 10px 12px; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.04); white-space: nowrap; }
    .table tbody tr:hover td { background: rgba(255,255,255,0.03); }
    .td-monto { font-weight: 600; color: #fff; }
    .comp-badge { padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
  `],
})
export class HistorialComponent {
  readonly router = inject(Router);

  readonly kpis = [
    { tipo: 'Factura B', total: 1501089, cantidad: 35 },
    { tipo: 'Factura A', total: 1501089, cantidad: 35 },
    { tipo: 'Ticket Fiscal', total: 1501089, cantidad: 35 },
  ];

  readonly ventas: Venta[] = [
    { fecha: '08/12/25', comprobante: 'B-0001-00001892', total: 8500, formaPago: 'Efectivo', cantidad: 1, descuento: 0, totalNeto: 8500, nota: '', concepto: 'Restorán', mozo: 'Carlos', mesa: '3', comensales: 2 },
    { fecha: '08/12/25', comprobante: 'B-0001-00001893', total: 15200, formaPago: 'Tarjeta', cantidad: 1, descuento: 0, totalNeto: 15200, nota: '10/10 Recepción', concepto: 'Pedidos Ya', mozo: '', mesa: '', comensales: 0 },
    { fecha: '08/12/25', comprobante: 'A-0001-00001894', total: 22000, formaPago: 'Transferencia', cantidad: 1, descuento: 0, totalNeto: 22000, nota: '', concepto: 'Restorán', mozo: 'María', mesa: '7', comensales: 4 },
    { fecha: '08/12/25', comprobante: 'B-0001-00001895', total: 9800, formaPago: 'QR', cantidad: 1, descuento: 0, totalNeto: 9800, nota: '', concepto: 'Mostrador', mozo: '', mesa: '', comensales: 0 },
    { fecha: '08/12/25', comprobante: 'B-0001-00001896', total: 31500, formaPago: 'Efectivo', cantidad: 1, descuento: 0, totalNeto: 31500, nota: '', concepto: 'Restorán', mozo: 'Carlos', mesa: '11', comensales: 4 },
    { fecha: '08/12/25', comprobante: 'A-0001-00001897', total: 18700, formaPago: 'Transferencia', cantidad: 1, descuento: 0, totalNeto: 18700, nota: '', concepto: 'Delivery', mozo: '', mesa: '', comensales: 0 },
    { fecha: '08/12/25', comprobante: 'B-0001-00001898', total: 12000, formaPago: 'Cheque', cantidad: 1, descuento: 0, totalNeto: 12000, nota: '', concepto: 'Restorán', mozo: 'María', mesa: '5', comensales: 2 },
  ];
}
