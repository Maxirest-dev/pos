import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PosHeaderComponent } from '../salon/components/pos-header/pos-header.component';

@Component({
  selector: 'app-estadisticas',
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
            <h2 class="page__title">Dashboard</h2>
            <p class="page__subtitle">Estadísticas del turno</p>
          </div>
        </div>

        <!-- KPIs row -->
        <div class="kpi-row">
          @for (kpi of kpis; track kpi.label) {
            <div class="kpi-card">
              <span class="kpi-card__label">{{ kpi.label }}</span>
              <div class="kpi-card__values">
                <span class="kpi-card__monto">\${{ kpi.monto | number:'1.0-0' }}</span>
                <span class="kpi-card__count">#{{ kpi.count }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Charts row -->
        <div class="charts-row">
          <!-- Formas de cobro -->
          <div class="chart-card">
            <h4 class="chart-card__title">FORMAS DE COBRO</h4>
            <p class="chart-card__subtitle">Distribución por medio de pago</p>
            <div class="donut-wrap">
              <div class="donut">
                <div class="donut__center">68%</div>
              </div>
              <div class="donut-legend">
                @for (item of formasCobro; track item.label) {
                  <div class="legend-item">
                    <span class="legend-dot" [style.background]="item.color"></span>
                    <span class="legend-label">{{ item.label }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Conceptos -->
          <div class="chart-card">
            <h4 class="chart-card__title">CONCEPTOS</h4>
            <p class="chart-card__subtitle">Ventas por tipo de venta</p>
            <div class="bars">
              @for (bar of conceptos; track bar.label) {
                <div class="bar-item">
                  <span class="bar-item__label">{{ bar.label }}</span>
                  <div class="bar-item__track">
                    <div class="bar-item__fill" [style.width.%]="bar.pct" [style.background]="bar.color"></div>
                  </div>
                  <span class="bar-item__value">{{ bar.pct }}%</span>
                </div>
              }
            </div>
          </div>

          <!-- Venta por comprobante -->
          <div class="chart-card">
            <h4 class="chart-card__title">VENTA POR COMPROBANTE</h4>
            <div class="comprobantes">
              @for (comp of comprobantes; track comp.label) {
                <div class="comp-row">
                  <span class="comp-row__label">{{ comp.label }}</span>
                  <span class="comp-row__monto">\${{ comp.monto | number:'1.0-0' }}</span>
                </div>
              }
              <div class="comp-row comp-row--total">
                <span class="comp-row__label">Total</span>
                <span class="comp-row__monto">\${{ 245114 | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom row -->
        <div class="charts-row">
          <!-- Ocupación de salón -->
          <div class="chart-card chart-card--sm">
            <h4 class="chart-card__title">OCUPACIÓN DE SALÓN</h4>
            <p class="chart-card__subtitle">Estado de mesas</p>
            <div class="ocupacion">
              <span class="ocupacion__pct">68%</span>
              <div class="ocupacion__detail">
                <span class="ocupacion__item">🟢 Cubiertas <strong>133</strong></span>
              </div>
            </div>
          </div>

          <!-- Ventas por marketplace -->
          <div class="chart-card chart-card--sm">
            <h4 class="chart-card__title">VENTAS POR MARKETPLACE</h4>
            <p class="chart-card__subtitle">Top 3 de ventas</p>
            <div class="bars">
              @for (bar of marketplaces; track bar.label) {
                <div class="bar-item">
                  <span class="bar-item__label">{{ bar.label }}</span>
                  <div class="bar-item__track">
                    <div class="bar-item__fill" [style.width.%]="bar.pct" [style.background]="bar.color"></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Movimientos por hora -->
          <div class="chart-card chart-card--lg">
            <h4 class="chart-card__title">MOVIMIENTOS POR HORA</h4>
            <p class="chart-card__subtitle">Evolución de ventas durante el día</p>
            <div class="hora-chart">
              @for (h of horas; track h.hora) {
                <div class="hora-bar">
                  <div class="hora-bar__fill" [style.height.%]="h.pct"></div>
                  <span class="hora-bar__label">{{ h.hora }}</span>
                </div>
              }
            </div>
          </div>
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
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .kpi-card { background: #0A0E4A; border-radius: 12px; padding: 16px; border: 1px solid #374151; }
    .kpi-card__label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-card__values { display: flex; align-items: baseline; justify-content: space-between; margin-top: 8px; }
    .kpi-card__monto { font-size: 22px; font-weight: 800; color: #fff; }
    .kpi-card__count { font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.5); }

    /* Charts */
    .charts-row { display: flex; gap: 12px; }
    .chart-card { flex: 1; background: #0A0E4A; border-radius: 12px; padding: 16px; border: 1px solid #374151; min-width: 0; }
    .chart-card--sm { flex: 0.8; }
    .chart-card--lg { flex: 1.4; }
    .chart-card__title { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 2px 0; }
    .chart-card__subtitle { font-size: 10px; color: rgba(255,255,255,0.25); margin: 0 0 12px 0; }

    /* Donut */
    .donut-wrap { display: flex; align-items: center; gap: 16px; }
    .donut { width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(#F27920 0% 35%, #3B82F6 35% 55%, #8B5CF6 55% 75%, #10B981 75% 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .donut__center { width: 48px; height: 48px; border-radius: 50%; background: #0A0E4A; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; }
    .donut-legend { display: flex; flex-direction: column; gap: 4px; }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-dot { width: 8px; height: 8px; border-radius: 2px; }
    .legend-label { font-size: 11px; color: rgba(255,255,255,0.6); }

    /* Bars */
    .bars { display: flex; flex-direction: column; gap: 8px; }
    .bar-item { display: flex; align-items: center; gap: 8px; }
    .bar-item__label { font-size: 11px; color: rgba(255,255,255,0.6); width: 60px; flex-shrink: 0; }
    .bar-item__track { flex: 1; height: 10px; border-radius: 5px; background: #374151; overflow: hidden; }
    .bar-item__fill { height: 100%; border-radius: 5px; transition: width 0.3s; }
    .bar-item__value { font-size: 11px; color: rgba(255,255,255,0.5); width: 30px; text-align: right; }

    /* Comprobantes */
    .comprobantes { display: flex; flex-direction: column; gap: 6px; }
    .comp-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .comp-row__label { font-size: 12px; color: rgba(255,255,255,0.5); }
    .comp-row__monto { font-size: 12px; font-weight: 600; color: #fff; }
    .comp-row--total { border-top: 1px solid #374151; padding-top: 8px; margin-top: 4px; }
    .comp-row--total .comp-row__label { color: rgba(255,255,255,0.7); font-weight: 600; }
    .comp-row--total .comp-row__monto { color: #F27920; font-weight: 700; }

    /* Ocupación */
    .ocupacion { display: flex; align-items: center; gap: 16px; }
    .ocupacion__pct { font-size: 36px; font-weight: 800; color: #F27920; }
    .ocupacion__item { font-size: 12px; color: rgba(255,255,255,0.5); }
    .ocupacion__item strong { color: #fff; }

    /* Hora chart */
    .hora-chart { display: flex; align-items: flex-end; gap: 6px; height: 80px; }
    .hora-bar { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; }
    .hora-bar__fill { width: 100%; background: #3B82F6; border-radius: 3px 3px 0 0; min-height: 2px; transition: height 0.3s; }
    .hora-bar__label { font-size: 8px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  `],
})
export class EstadisticasComponent {
  readonly router = inject(Router);

  readonly kpis = [
    { label: 'Ventas totales', monto: 1501089, count: 35 },
    { label: 'Ventas totales', monto: 1501089, count: 35 },
    { label: 'Ventas totales', monto: 1501089, count: 35 },
    { label: 'Ventas totales', monto: 1501089, count: 35 },
  ];

  readonly formasCobro = [
    { label: 'Efectivo', color: '#F27920' },
    { label: 'Tarjeta', color: '#3B82F6' },
    { label: 'Pago electrónico', color: '#8B5CF6' },
    { label: 'Cuenta corriente', color: '#10B981' },
  ];

  readonly conceptos = [
    { label: 'Salón', pct: 65, color: '#3B82F6' },
    { label: 'Delivery', pct: 45, color: '#F27920' },
    { label: 'Mostrador', pct: 30, color: '#10B981' },
  ];

  readonly comprobantes = [
    { label: 'Factura B', monto: 126878 },
    { label: 'Factura A', monto: 89126 },
    { label: 'Nota Abono', monto: 9010 },
    { label: 'Sin Facturar', monto: 20100 },
  ];

  readonly marketplaces = [
    { label: 'PedidosYa', pct: 55, color: '#E11D48' },
    { label: 'Rappi', pct: 35, color: '#FF5A00' },
    { label: 'Propio', pct: 20, color: '#3B82F6' },
  ];

  readonly horas = [
    { hora: '10', pct: 15 }, { hora: '11', pct: 25 }, { hora: '12', pct: 55 },
    { hora: '13', pct: 85 }, { hora: '14', pct: 70 }, { hora: '15', pct: 30 },
    { hora: '16', pct: 20 }, { hora: '17', pct: 25 }, { hora: '18', pct: 35 },
    { hora: '19', pct: 50 }, { hora: '20', pct: 90 }, { hora: '21', pct: 95 },
    { hora: '22', pct: 75 }, { hora: '23', pct: 40 },
  ];
}
