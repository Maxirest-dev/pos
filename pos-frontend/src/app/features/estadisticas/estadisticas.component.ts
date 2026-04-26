import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';
import { PosHeaderComponent } from '../salon/components/pos-header/pos-header.component';

Chart.register(...registerables);

interface VentaResumen { total: number; operaciones: number; promedio: number; variacion: number; }
interface FormaCobro { nombre: string; total: number; porcentaje: number; operaciones: number; color: string; estado: 'Activo' | 'Inactivo'; }
interface ComprobanteListItem { tipo: string; total: number; color: string; }
interface CategoriaVenta { nombre: string; total: number; color: string; }
interface MovimientoHora { hora: number; salon: number; delivery: number; takeaway: number; }
interface ArticuloVenta { cod: string; nombre: string; categoria: string; cantidad: number; precioUnit: number; subtotal: number; descuento: number; total: number; estado: 'Activo' | 'Inactivo'; }
interface ConceptoVenta { cod: string; forma: string; vuelto: number; subtotal: number; descuento: number; total: number; volumen: number; descuentoPct: number; adherencia: 'Alto' | 'Normal' | 'Bajo'; }
interface EmpleadoVenta { cod: string; nombre: string; rol: string; cantidad: number; precioUnit: number; subtotal: number; descuento: number; total: number; estado: 'Activo' | 'Inactivo'; }
interface RolVenta { nombre: string; total: number; color: string; }

type TabEstadisticas = 'dashboard' | 'formasCobro' | 'conceptos' | 'articulos' | 'empleados';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [PosHeaderComponent, DecimalPipe, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-pos-header (cerrarTurno)="router.navigate(['/salon'])" />

      <div class="page__content">
        <div class="page__header">
          <button class="back-btn" (click)="router.navigate(['/salon'])">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div class="page__header-text">
            <h2 class="page__title">Dashboard</h2>
            <p class="page__subtitle">Estadísticas del turno</p>
          </div>
          <nav class="tab-nav">
            @for (tab of tabs; track tab.key) {
              <button class="tab-btn" [class.tab-btn--active]="tabActivo() === tab.key" (click)="tabActivo.set(tab.key)" type="button">
                {{ tab.label }}
              </button>
            }
          </nav>
        </div>

        <div class="page__divider"></div>

        <!-- Resumen cards (KPIs) - siempre visibles -->
        <div class="cards-row">
          <div class="stat-card">
            <div class="stat-card__header">
              <h3 class="stat-card__title">Ventas totales</h3>
              <span class="trend-badge" [class.trend-badge--up]="ventasResumen.variacion >= 0" [class.trend-badge--down]="ventasResumen.variacion < 0">
                <span class="trend-arrow">{{ ventasResumen.variacion >= 0 ? '↑' : '↓' }}</span>
                {{ ventasResumen.variacion >= 0 ? '+' : '' }}{{ ventasResumen.variacion }}%
              </span>
            </div>
            <div class="stat-card__body">
              <div class="metric"><span class="metric__label">Total</span><span class="metric__value">\${{ ventasResumen.total | number:'1.0-0' }}</span></div>
              <div class="metric metric--narrow"><span class="metric__label">Cantidad</span><span class="metric__value">{{ ventasResumen.operaciones }}</span></div>
              <div class="metric"><span class="metric__label">Promedio</span><span class="metric__value">\${{ ventasResumen.promedio | number:'1.0-0' }}</span></div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__header">
              <h3 class="stat-card__title">Información de descuentos</h3>
              <span class="trend-badge" [class.trend-badge--up]="formasResumen.variacion >= 0" [class.trend-badge--down]="formasResumen.variacion < 0">
                <span class="trend-arrow">{{ formasResumen.variacion >= 0 ? '↑' : '↓' }}</span>
                {{ formasResumen.variacion >= 0 ? '+' : '' }}{{ formasResumen.variacion }}%
              </span>
            </div>
            <div class="stat-card__body">
              <div class="metric"><span class="metric__label">Total</span><span class="metric__value">\${{ formasResumen.total | number:'1.0-0' }}</span></div>
              <div class="metric metric--narrow"><span class="metric__label">Cantidad</span><span class="metric__value">{{ formasResumen.operaciones }}</span></div>
              <div class="metric"><span class="metric__label">Promedio</span><span class="metric__value">\${{ formasResumen.promedio | number:'1.0-0' }}</span></div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__header">
              <h3 class="stat-card__title">Cubiertos</h3>
              <span class="trend-badge" [class.trend-badge--up]="cubiertosResumen.variacion >= 0" [class.trend-badge--down]="cubiertosResumen.variacion < 0">
                <span class="trend-arrow">{{ cubiertosResumen.variacion >= 0 ? '↑' : '↓' }}</span>
                {{ cubiertosResumen.variacion >= 0 ? '+' : '' }}{{ cubiertosResumen.variacion }}%
              </span>
            </div>
            <div class="stat-card__body">
              <div class="metric"><span class="metric__label">Cubiertos</span><span class="metric__value">{{ cubiertosResumen.total | number:'1.0-0' }}</span></div>
              <div class="metric"><span class="metric__label">Mesas</span><span class="metric__value">{{ cubiertosResumen.operaciones }}</span></div>
              <div class="metric"><span class="metric__label">Cub. x mesa</span><span class="metric__value">{{ cubiertosResumen.promedio | number:'1.1-1' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Tab content -->
        <div class="tab-content">
          @switch (tabActivo()) {

            @case ('dashboard') {
              <div class="dashboard-grid">
                <div class="chart-card">
                  <h3 class="chart-card__title">Formas de Cobro</h3>
                  <div class="chart-container chart-container--sm">
                    <canvas baseChart [type]="'doughnut'" [data]="formasDoughnutData()" [options]="doughnutOptions"></canvas>
                  </div>
                </div>
                <div class="chart-card">
                  <h3 class="chart-card__title">Conceptos</h3>
                  <div class="chart-container chart-container--sm">
                    <canvas baseChart [type]="'bar'" [data]="conceptosBarDashboardData()" [options]="barOptions"></canvas>
                  </div>
                </div>
                <div class="chart-card">
                  <h3 class="chart-card__title">Ventas por Comprobante</h3>
                  <div class="comprobante-list">
                    @for (comp of comprobantes; track comp.tipo) {
                      <div class="comprobante-item">
                        <div class="comprobante-dot" [style.background]="comp.color"></div>
                        <span class="comprobante-tipo">{{ comp.tipo }}</span>
                        <span class="comprobante-total">\${{ comp.total | number:'1.0-0' }}</span>
                      </div>
                    }
                  </div>
                </div>
                <div class="chart-card chart-card--half-1">
                  <h3 class="chart-card__title">Articulos</h3>
                  <div class="chart-container">
                    <canvas baseChart [type]="'bar'" [data]="articulosBarData()" [options]="horizontalBarOptions"></canvas>
                  </div>
                </div>
                <div class="chart-card chart-card--half-2">
                  <h3 class="chart-card__title">Movimientos por Hora</h3>
                  <div class="chart-container">
                    <canvas baseChart [type]="'line'" [data]="movimientosLineData()" [options]="lineOptions"></canvas>
                  </div>
                </div>
              </div>
            }

            @case ('formasCobro') {
              <div class="two-col-layout">
                <div class="chart-card">
                  <h3 class="chart-card__title">Formas de Cobro</h3>
                  <div class="chart-container">
                    <canvas baseChart [type]="'doughnut'" [data]="formasDoughnutData()" [options]="doughnutBottomOptions"></canvas>
                  </div>
                </div>
                <div class="table-card">
                  <h3 class="chart-card__title">Detalle de Formas</h3>
                  <div class="table-wrap">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Forma</th>
                          <th class="text-right">Total</th>
                          <th class="text-right">Operaciones</th>
                          <th class="text-right">Porcentaje</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (f of formasCobro; track f.nombre) {
                          <tr>
                            <td><div class="forma-name"><span class="forma-dot" [style.background]="f.color"></span>{{ f.nombre }}</div></td>
                            <td class="text-right font-bold">\${{ f.total | number:'1.0-0' }}</td>
                            <td class="text-right">{{ f.operaciones }}</td>
                            <td class="text-right">{{ f.porcentaje }}%</td>
                            <td><span class="status-badge" [class.status-badge--active]="f.estado === 'Activo'" [class.status-badge--inactive]="f.estado === 'Inactivo'">{{ f.estado }}</span></td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            @case ('conceptos') {
              <div class="two-col-layout two-col-layout--1-1-5">
                <div class="chart-card">
                  <h3 class="chart-card__title">Conceptos</h3>
                  <div class="chart-container">
                    <canvas baseChart [type]="'bar'" [data]="conceptosStackedData()" [options]="stackedBarOptions"></canvas>
                  </div>
                </div>
                <div class="table-card">
                  <h3 class="chart-card__title">Detalle de Conceptos</h3>
                  <div class="table-wrap">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Cod</th><th>Forma</th>
                          <th class="text-right">Vuelto</th>
                          <th class="text-right">Subtotal</th>
                          <th class="text-right">Descuento</th>
                          <th class="text-right">Total</th>
                          <th class="text-right">Volumen</th>
                          <th class="text-right">Descuento%</th>
                          <th>Adherencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (c of conceptos; track c.cod) {
                          <tr>
                            <td class="cell-code">{{ c.cod }}</td>
                            <td>{{ c.forma }}</td>
                            <td class="text-right">\${{ c.vuelto | number:'1.0-0' }}</td>
                            <td class="text-right">\${{ c.subtotal | number:'1.0-0' }}</td>
                            <td class="text-right">\${{ c.descuento | number:'1.0-0' }}</td>
                            <td class="text-right font-bold">\${{ c.total | number:'1.0-0' }}</td>
                            <td class="text-right">{{ c.volumen }}</td>
                            <td class="text-right">{{ c.descuentoPct }}%</td>
                            <td>
                              <span class="adherencia-badge"
                                    [class.adherencia-badge--alto]="c.adherencia === 'Alto'"
                                    [class.adherencia-badge--normal]="c.adherencia === 'Normal'"
                                    [class.adherencia-badge--bajo]="c.adherencia === 'Bajo'">
                                {{ c.adherencia }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            @case ('articulos') {
              <div class="two-col-layout">
                <div class="chart-card">
                  <h3 class="chart-card__title">Categorias</h3>
                  <div class="chart-container">
                    <canvas baseChart [type]="'bar'" [data]="categoriasBarData()" [options]="barOptions"></canvas>
                  </div>
                </div>
                <div class="table-card">
                  <h3 class="chart-card__title">Articulos</h3>
                  <div class="table-wrap">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Cod</th><th>Nombre</th><th>Categoria</th>
                          <th class="text-right">Cantidad</th>
                          <th class="text-right">Precio Unit</th>
                          <th class="text-right">Subtotal</th>
                          <th class="text-right">Descuento</th>
                          <th class="text-right">Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (a of articulos; track a.cod) {
                          <tr>
                            <td class="cell-code">{{ a.cod }}</td>
                            <td>{{ a.nombre }}</td>
                            <td>{{ a.categoria }}</td>
                            <td class="text-right">{{ a.cantidad }}</td>
                            <td class="text-right">\${{ a.precioUnit | number:'1.0-0' }}</td>
                            <td class="text-right">\${{ a.subtotal | number:'1.0-0' }}</td>
                            <td class="text-right">\${{ a.descuento | number:'1.0-0' }}</td>
                            <td class="text-right font-bold">\${{ a.total | number:'1.0-0' }}</td>
                            <td><span class="status-badge" [class.status-badge--active]="a.estado === 'Activo'" [class.status-badge--inactive]="a.estado === 'Inactivo'">{{ a.estado }}</span></td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            @case ('empleados') {
              <div class="two-col-layout">
                <div class="chart-card">
                  <h3 class="chart-card__title">Roles</h3>
                  <div class="chart-container">
                    <canvas baseChart [type]="'bar'" [data]="rolesBarData()" [options]="barOptions"></canvas>
                  </div>
                </div>
                <div class="table-card">
                  <h3 class="chart-card__title">Empleados</h3>
                  <div class="table-wrap">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Cod</th><th>Nombre</th><th>Rol</th>
                          <th class="text-right">Cantidad</th>
                          <th class="text-right">Ticket Prom</th>
                          <th class="text-right">Subtotal</th>
                          <th class="text-right">Descuento</th>
                          <th class="text-right">Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (e of empleados; track e.cod) {
                          <tr>
                            <td class="cell-code">{{ e.cod }}</td>
                            <td>{{ e.nombre }}</td>
                            <td>{{ e.rol }}</td>
                            <td class="text-right">{{ e.cantidad }}</td>
                            <td class="text-right">\${{ e.precioUnit | number:'1.0-0' }}</td>
                            <td class="text-right">\${{ e.subtotal | number:'1.0-0' }}</td>
                            <td class="text-right">\${{ e.descuento | number:'1.0-0' }}</td>
                            <td class="text-right font-bold">\${{ e.total | number:'1.0-0' }}</td>
                            <td><span class="status-badge" [class.status-badge--active]="e.estado === 'Activo'" [class.status-badge--inactive]="e.estado === 'Inactivo'">{{ e.estado }}</span></td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; height: 100vh; height: 100dvh; background: #F8FAFC; overflow: hidden; }
    .page__content { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
    .page__header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .page__header-text { margin-right: auto; display: flex; flex-direction: column; gap: 2px; }
    .back-btn { background: none; border: none; color: #6B7280; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
    .back-btn:hover { color: #1a1a1a; }
    .page__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .page__subtitle { font-size: 12px; color: #6B7280; margin: 0; }
    .page__divider { height: 1px; background: #E2E8F0; margin: 0; }

    /* Tab nav */
    .tab-nav { display: flex; gap: 4px; flex-wrap: wrap; }
    .tab-btn {
      font-size: 14px; font-weight: 500;
      padding: 10px 16px;
      border: none;
      border-bottom: 2px solid transparent;
      border-radius: 8px 8px 0 0;
      background: transparent; color: #90A1B9;
      cursor: pointer; transition: all 0.2s ease;
      white-space: nowrap; font-family: inherit;
    }
    .tab-btn:hover:not(.tab-btn--active) { color: #314158; background-color: #F1F5F9; }
    .tab-btn--active { color: #F27920; border-bottom-color: #F27920; }

    /* Resumen cards row */
    .cards-row { display: grid; grid-template-columns: 1.3fr 1.3fr 1fr; gap: 16px; }
    .stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; box-shadow: 0 1px 1.75px -1px rgba(0,0,0,0.1), 0 1px 2.625px rgba(0,0,0,0.1); overflow: hidden; }
    .stat-card__header { display: flex; justify-content: space-between; align-items: center; padding: 16px 25px 0; }
    .stat-card__title { font-size: 16px; font-weight: 600; color: #0F172B; margin: 0; }
    .trend-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
    .trend-badge--up { color: #059669; background: #ECFDF5; }
    .trend-badge--down { color: #DC2626; background: #FEF2F2; }
    .trend-arrow { font-size: 11px; }
    .stat-card__body { display: flex; gap: 0; padding: 16px 25px 25px; }
    .metric { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
    .metric--narrow { flex: 0 0 auto; align-items: center; text-align: center; padding-right: 25px; }
    .metric + .metric { padding-left: 25px; border-left: 1px solid #F1F5F9; }
    .metric__label { font-size: 13px; color: #90A1B9; }
    .metric__value { font-size: 28px; font-weight: 700; color: #0F172B; line-height: 1.1; }

    /* Tab content fade in */
    .tab-content { animation: tabFadeIn 0.25s ease; }
    @keyframes tabFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    /* Dashboard grid */
    .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .chart-card--half-1 { grid-column: 1 / 2; }
    .chart-card--half-2 { grid-column: 2 / 4; }

    /* Two-col layout (chart + table) */
    .two-col-layout { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; align-items: start; }
    .two-col-layout--1-1-5 { grid-template-columns: 1fr 1.5fr; }

    /* Cards */
    .chart-card, .table-card {
      background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
      box-shadow: 0 1px 1.75px -1px rgba(0,0,0,0.1), 0 1px 2.625px rgba(0,0,0,0.1);
      padding: 20px 25px; min-width: 0;
    }
    .chart-card__title { font-size: 16px; font-weight: 600; color: #0F172B; margin: 0 0 16px; }
    .chart-container { position: relative; height: 300px; }
    .chart-container--sm { height: 240px; }

    /* Comprobante list (dashboard) */
    .comprobante-list { display: flex; flex-direction: column; gap: 14px; padding: 8px 0; }
    .comprobante-item { display: flex; align-items: center; gap: 10px; }
    .comprobante-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .comprobante-tipo { font-size: 14px; color: #314158; flex: 1; }
    .comprobante-total { font-size: 14px; font-weight: 600; color: #0F172B; }

    /* Data table */
    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
    .data-table thead tr { background: #F8FAFC; }
    .data-table th {
      padding: 10px 12px; font-weight: 600; color: #90A1B9; text-align: left;
      font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
      border-bottom: 1px solid #E2E8F0;
    }
    .data-table th:first-child { border-top-left-radius: 8px; }
    .data-table th:last-child { border-top-right-radius: 8px; }
    .data-table td { padding: 10px 12px; color: #314158; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
    .data-table tbody tr:hover { background: #F8FAFC; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 600; }
    .cell-code { font-family: 'Inter', monospace; font-size: 12px; color: #90A1B9; }

    /* Forma name with dot */
    .forma-name { display: flex; align-items: center; gap: 8px; }
    .forma-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    /* Status badge */
    .status-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 500; padding: 5px 12px;
      border-radius: 8px; border: 1px solid transparent;
    }
    .status-badge--active { background: #ECFDF5; color: #00A43D; border-color: #A4F4CF; }
    .status-badge--inactive { background: #F1F5F9; color: #45556C; border-color: #E2E8F0; }

    /* Adherencia badge */
    .adherencia-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 500; padding: 5px 12px;
      border-radius: 8px; border: 1px solid transparent;
    }
    .adherencia-badge--alto { background: #ECFDF5; color: #00A43D; border-color: #A4F4CF; }
    .adherencia-badge--normal { background: #EFF6FF; color: #1E40AF; border-color: #BFDBFE; }
    .adherencia-badge--bajo { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

    @media (max-width: 1024px) {
      .cards-row, .dashboard-grid, .two-col-layout, .two-col-layout--1-1-5 { grid-template-columns: 1fr; }
      .chart-card--half-1, .chart-card--half-2 { grid-column: 1; }
    }
  `],
})
export class EstadisticasComponent {
  readonly router = inject(Router);

  readonly tabs: { key: TabEstadisticas; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'formasCobro', label: 'Formas de cobro' },
    { key: 'conceptos', label: 'Conceptos' },
    { key: 'articulos', label: 'Articulos' },
    { key: 'empleados', label: 'Empleados' },
  ];

  readonly tabActivo = signal<TabEstadisticas>('dashboard');

  /* === KPIs === */
  readonly ventasResumen: VentaResumen = { total: 1501089, operaciones: 35, promedio: 123045, variacion: 12.5 };
  readonly formasResumen: VentaResumen = { total: 15000, operaciones: 3, promedio: 23045, variacion: -3.2 };
  readonly cubiertosResumen: VentaResumen = { total: 487, operaciones: 142, promedio: 3.4, variacion: 8.1 };

  /* === Mocks === */
  readonly formasCobro: FormaCobro[] = [
    { nombre: 'Efectivo',         total: 523295, porcentaje: 34.9, operaciones: 12, color: '#3B82F6', estado: 'Activo' },
    { nombre: 'MercadoPago',      total: 318076, porcentaje: 21.2, operaciones: 8,  color: '#10B981', estado: 'Activo' },
    { nombre: 'Tarjeta',          total: 245890, porcentaje: 16.4, operaciones: 5,  color: '#F59E0B', estado: 'Activo' },
    { nombre: 'PedidosYa',        total: 178432, porcentaje: 11.9, operaciones: 4,  color: '#EF4444', estado: 'Activo' },
    { nombre: 'Cuenta corriente', total: 112500, porcentaje: 7.5,  operaciones: 3,  color: '#8B5CF6', estado: 'Activo' },
    { nombre: 'Rappipay',         total: 74896,  porcentaje: 5.0,  operaciones: 2,  color: '#EC4899', estado: 'Activo' },
    { nombre: 'Cheques',          total: 48000,  porcentaje: 3.1,  operaciones: 1,  color: '#06B6D4', estado: 'Inactivo' },
  ];

  readonly comprobantes: ComprobanteListItem[] = [
    { tipo: 'Factura A',       total: 317355, color: '#3B82F6' },
    { tipo: 'Factura B',       total: 296000, color: '#8B5CF6' },
    { tipo: 'Ticket Fiscal',   total: 182655, color: '#10B981' },
    { tipo: 'Nota de Credito', total: 172000, color: '#F59E0B' },
  ];

  readonly categorias: CategoriaVenta[] = [
    { nombre: 'Entradas', total: 753960, color: '#3B82F6' },
    { nombre: 'Carnes',   total: 822100, color: '#10B981' },
    { nombre: 'Pizzas',   total: 384000, color: '#F59E0B' },
    { nombre: 'Pastas',   total: 290400, color: '#8B5CF6' },
    { nombre: 'Bebidas',  total: 310650, color: '#EC4899' },
    { nombre: 'Postres',  total: 167580, color: '#06B6D4' },
  ];

  readonly movimientos: MovimientoHora[] = [
    { hora: 8, salon: 2, delivery: 0, takeaway: 1 },
    { hora: 9, salon: 5, delivery: 1, takeaway: 2 },
    { hora: 10, salon: 8, delivery: 2, takeaway: 3 },
    { hora: 11, salon: 15, delivery: 5, takeaway: 4 },
    { hora: 12, salon: 28, delivery: 12, takeaway: 8 },
    { hora: 13, salon: 35, delivery: 18, takeaway: 10 },
    { hora: 14, salon: 22, delivery: 10, takeaway: 6 },
    { hora: 15, salon: 12, delivery: 5, takeaway: 3 },
    { hora: 16, salon: 8, delivery: 3, takeaway: 2 },
    { hora: 17, salon: 10, delivery: 4, takeaway: 3 },
    { hora: 18, salon: 15, delivery: 6, takeaway: 4 },
    { hora: 19, salon: 25, delivery: 14, takeaway: 7 },
    { hora: 20, salon: 38, delivery: 22, takeaway: 12 },
    { hora: 21, salon: 42, delivery: 25, takeaway: 14 },
    { hora: 22, salon: 30, delivery: 15, takeaway: 8 },
    { hora: 23, salon: 15, delivery: 8, takeaway: 4 },
    { hora: 0, salon: 5, delivery: 2, takeaway: 1 },
  ];

  readonly articulos: ArticuloVenta[] = [
    { cod: 'TAB-01', nombre: 'Tabla 0',             categoria: 'Entradas', cantidad: 45, precioUnit: 14500, subtotal: 652500, descuento: 0,     total: 652500, estado: 'Activo' },
    { cod: 'BRV-01', nombre: 'Brevaje',             categoria: 'Bebidas',  cantidad: 38, precioUnit: 8500,  subtotal: 323000, descuento: 12350, total: 310650, estado: 'Activo' },
    { cod: 'PIZ-03', nombre: 'Pizza MP3',           categoria: 'Pizzas',   cantidad: 32, precioUnit: 12000, subtotal: 384000, descuento: 0,     total: 384000, estado: 'Activo' },
    { cod: 'GUA-01', nombre: 'Guatf',               categoria: 'Carnes',   cantidad: 28, precioUnit: 18500, subtotal: 518000, descuento: 25900, total: 492100, estado: 'Activo' },
    { cod: 'PLA-01', nombre: 'Plaster',             categoria: 'Pastas',   cantidad: 22, precioUnit: 13200, subtotal: 290400, descuento: 0,     total: 290400, estado: 'Activo' },
    { cod: 'ZER-01', nombre: 'Zeretes',             categoria: 'Postres',  cantidad: 18, precioUnit: 9800,  subtotal: 176400, descuento: 8820,  total: 167580, estado: 'Activo' },
    { cod: 'LOM-01', nombre: 'Lomo a la Pimienta',  categoria: 'Carnes',   cantidad: 15, precioUnit: 22000, subtotal: 330000, descuento: 0,     total: 330000, estado: 'Activo' },
    { cod: 'ENS-02', nombre: 'Ensalada Caesar',     categoria: 'Entradas', cantidad: 12, precioUnit: 8900,  subtotal: 106800, descuento: 5340,  total: 101460, estado: 'Inactivo' },
  ];

  readonly conceptos: ConceptoVenta[] = [
    { cod: 'SAL', forma: 'Salon',     vuelto: 0, subtotal: 845000, descuento: 42250, total: 802750, volumen: 412, descuentoPct: 5.0, adherencia: 'Normal' },
    { cod: 'BRV', forma: 'Brevaje',   vuelto: 0, subtotal: 323000, descuento: 12350, total: 310650, volumen: 186, descuentoPct: 3.8, adherencia: 'Normal' },
    { cod: 'DLV', forma: 'Delivery',  vuelto: 0, subtotal: 298500, descuento: 0,     total: 298500, volumen: 95,  descuentoPct: 0,   adherencia: 'Alto' },
    { cod: 'TAK', forma: 'Take Away', vuelto: 0, subtotal: 156000, descuento: 7800,  total: 148200, volumen: 72,  descuentoPct: 5.0, adherencia: 'Bajo' },
    { cod: 'EVT', forma: 'Eventos',   vuelto: 0, subtotal: 89000,  descuento: 0,     total: 89000,  volumen: 3,   descuentoPct: 0,   adherencia: 'Normal' },
  ];

  readonly empleados: EmpleadoVenta[] = [
    { cod: 'EMP-001', nombre: 'Lucía Fernández',  rol: 'Mozo',      cantidad: 124, precioUnit: 3850, subtotal: 477400, descuento: 19096, total: 458304, estado: 'Activo' },
    { cod: 'EMP-002', nombre: 'Martín Álvarez',   rol: 'Mozo',      cantidad: 98,  precioUnit: 3920, subtotal: 384160, descuento: 15366, total: 368794, estado: 'Activo' },
    { cod: 'EMP-003', nombre: 'Sofía Ramírez',    rol: 'Cajero',    cantidad: 156, precioUnit: 2800, subtotal: 436800, descuento: 8736,  total: 428064, estado: 'Activo' },
    { cod: 'EMP-004', nombre: 'Diego Torres',     rol: 'Cajero',    cantidad: 92,  precioUnit: 3100, subtotal: 285200, descuento: 5704,  total: 279496, estado: 'Activo' },
    { cod: 'EMP-005', nombre: 'Camila Rossi',     rol: 'Encargado', cantidad: 45,  precioUnit: 4400, subtotal: 198000, descuento: 9900,  total: 188100, estado: 'Activo' },
    { cod: 'EMP-006', nombre: 'Federico López',   rol: 'Delivery',  cantidad: 62,  precioUnit: 1700, subtotal: 105400, descuento: 0,     total: 105400, estado: 'Activo' },
    { cod: 'EMP-007', nombre: 'Valentina Pérez',  rol: 'Mozo',      cantidad: 36,  precioUnit: 3500, subtotal: 126000, descuento: 3780,  total: 122220, estado: 'Inactivo' },
  ];

  readonly roles: RolVenta[] = [
    { nombre: 'Mozos',      total: 712400, color: '#3B82F6' },
    { nombre: 'Cajeros',    total: 485200, color: '#10B981' },
    { nombre: 'Encargados', total: 198300, color: '#F59E0B' },
    { nombre: 'Delivery',   total: 105189, color: '#8B5CF6' },
  ];

  /* === Chart options === */
  readonly doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { font: { family: 'Inter', size: 12 }, color: '#314158', padding: 12, usePointStyle: true, pointStyleWidth: 8 } } },
  };

  readonly doughnutBottomOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 }, color: '#314158', padding: 16, usePointStyle: true, pointStyleWidth: 8 } } },
  };

  readonly barOptions: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { font: { family: 'Inter', size: 11 }, color: '#90A1B9' }, grid: { color: '#F1F5F9' } },
      x: { ticks: { font: { family: 'Inter', size: 11 }, color: '#90A1B9' }, grid: { display: false } },
    },
  };

  readonly horizontalBarOptions: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { font: { family: 'Inter', size: 11 }, color: '#90A1B9' }, grid: { color: '#F1F5F9' } },
      y: { ticks: { font: { family: 'Inter', size: 11 }, color: '#90A1B9' }, grid: { display: false } },
    },
  };

  readonly stackedBarOptions: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 }, color: '#314158', usePointStyle: true, pointStyleWidth: 8, padding: 16 } } },
    scales: {
      y: { stacked: true, beginAtZero: true, ticks: { font: { family: 'Inter', size: 11 }, color: '#90A1B9' }, grid: { color: '#F1F5F9' } },
      x: { stacked: true, ticks: { font: { family: 'Inter', size: 11 }, color: '#90A1B9' }, grid: { display: false } },
    },
  };

  readonly lineOptions: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 }, color: '#314158', usePointStyle: true, pointStyleWidth: 8, padding: 16 } } },
    scales: {
      y: { beginAtZero: true, ticks: { font: { family: 'Inter', size: 11 }, color: '#90A1B9' }, grid: { color: '#F1F5F9' } },
      x: { ticks: { font: { family: 'Inter', size: 11 }, color: '#90A1B9' }, grid: { display: false } },
    },
  };

  /* === Chart data === */
  readonly formasDoughnutData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.formasCobro.map(f => f.nombre),
    datasets: [{ data: this.formasCobro.map(f => f.total), backgroundColor: this.formasCobro.map(f => f.color), borderWidth: 0, hoverOffset: 4 }],
  }));

  readonly conceptosBarDashboardData = computed<ChartData<'bar'>>(() => ({
    labels: this.formasCobro.map(f => f.nombre),
    datasets: [{ data: this.formasCobro.map(f => f.total), backgroundColor: this.formasCobro.map(f => f.color), borderRadius: 6, maxBarThickness: 40 }],
  }));

  readonly articulosBarData = computed<ChartData<'bar'>>(() => ({
    labels: this.categorias.map(c => c.nombre),
    datasets: [{ data: this.categorias.map(c => c.total), backgroundColor: this.categorias.map(c => c.color), borderRadius: 6, maxBarThickness: 24 }],
  }));

  readonly categoriasBarData = computed<ChartData<'bar'>>(() => ({
    labels: this.categorias.map(c => c.nombre),
    datasets: [{ data: this.categorias.map(c => c.total), backgroundColor: this.categorias.map(c => c.color), borderRadius: 6, maxBarThickness: 40 }],
  }));

  readonly movimientosLineData = computed<ChartData<'line'>>(() => ({
    labels: this.movimientos.map(m => `${m.hora}:00`),
    datasets: [
      { label: 'Salon',     data: this.movimientos.map(m => m.salon),    borderColor: '#F27920', backgroundColor: 'rgba(242, 121, 32, 0.1)', tension: 0.3, fill: false, pointRadius: 3, pointHoverRadius: 5 },
      { label: 'Delivery',  data: this.movimientos.map(m => m.delivery), borderColor: '#314158', backgroundColor: 'rgba(49, 65, 88, 0.1)',   tension: 0.3, fill: false, pointRadius: 3, pointHoverRadius: 5 },
      { label: 'Take Away', data: this.movimientos.map(m => m.takeaway), borderColor: '#90A1B9', backgroundColor: 'rgba(144, 161, 185, 0.1)',tension: 0.3, fill: false, pointRadius: 3, pointHoverRadius: 5 },
    ],
  }));

  readonly conceptosStackedData = computed<ChartData<'bar'>>(() => ({
    labels: this.conceptos.map(c => c.forma),
    datasets: [
      { label: 'Subtotal',  data: this.conceptos.map(c => c.subtotal),  backgroundColor: '#F27920', borderRadius: 4 },
      { label: 'Descuento', data: this.conceptos.map(c => c.descuento), backgroundColor: '#EF4444', borderRadius: 4 },
      { label: 'Total',     data: this.conceptos.map(c => c.total),     backgroundColor: '#314158', borderRadius: 4 },
    ],
  }));

  readonly rolesBarData = computed<ChartData<'bar'>>(() => ({
    labels: this.roles.map(r => r.nombre),
    datasets: [{ data: this.roles.map(r => r.total), backgroundColor: this.roles.map(r => r.color), borderRadius: 6, maxBarThickness: 40 }],
  }));
}
