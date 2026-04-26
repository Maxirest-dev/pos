import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CanalVenta, PedidoCanal } from '../../models/salon.model';

type FilterEstado = 'TODOS' | 'EN_CURSO' | 'LISTO' | 'ENTREGADO';
type ViewMode = 'card' | 'card-sm' | 'list';

const NOMBRES_MOCK = ['Juan Pérez', 'María González', 'Carlos Ruiz', 'Ana López', 'Pedro Martínez', 'Lucía Torres', 'Diego Fernández', 'Sofía Álvarez'];
const DIRECCIONES_MOCK = ['Av. Corrientes 1234, CABA', 'Palermo, Gurruchaga 890', 'Av. Libertador 5500', 'San Telmo, Defensa 670', 'Recoleta, Callao 1200', 'Belgrano R, Sucre 2110', 'Caballito, Rivadavia 4800', 'Villa Crespo, Scalabrini 1400'];
const PLATOS_MOCK: { nombre: string; cantidad: number }[][] = [
  [{ nombre: 'Pizza muzzarella', cantidad: 1 }, { nombre: 'Empanadas (12u)', cantidad: 1 }, { nombre: 'Coca Cola 1.5L', cantidad: 1 }],
  [{ nombre: 'Lomo completo', cantidad: 2 }, { nombre: 'Papas con cheddar', cantidad: 1 }],
  [{ nombre: 'Hamburguesa doble', cantidad: 2 }, { nombre: 'Cerveza IPA', cantidad: 2 }, { nombre: 'Tiramisú', cantidad: 1 }],
  [{ nombre: 'Sushi mix', cantidad: 1 }, { nombre: 'Wok teriyaki', cantidad: 1 }, { nombre: 'Té verde', cantidad: 2 }],
  [{ nombre: 'Milanesa napolitana', cantidad: 1 }, { nombre: 'Ensalada mixta', cantidad: 1 }, { nombre: 'Agua mineral', cantidad: 2 }],
];

/**
 * Vista principal de un canal de venta (ocupa el escenario grande).
 * Muestra pedidos con metadata extendida + filtros + CTA nuevo pedido.
 */
@Component({
  selector: 'app-channel-main',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="main">
      <!-- Header grande -->
      <div class="main__header"
        draggable="true"
        (dragstart)="dragStart.emit($event)"
        (dragend)="dragEnd.emit()"
      >
        <div class="main__header-left">
          <div class="main__icon" [style.background]="canal().colorBg">
            @switch (canal().tipo) {
              @case ('DELIVERY') {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" [attr.stroke]="canal().color" stroke-width="1.8">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              }
              @case ('MOSTRADOR') {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" [attr.stroke]="canal().color" stroke-width="1.8">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              }
              @case ('PEDIDOS_YA') {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" [attr.stroke]="canal().color" stroke-width="1.8">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              }
              @case ('RAPPI') {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" [attr.stroke]="canal().color" stroke-width="1.8">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 12 16 16 16 8"/><line x1="1" y1="10" x2="16" y2="10"/>
                </svg>
              }
            }
          </div>
          <div class="main__title-box">
            <h2 class="main__title">{{ canal().label }}</h2>
            <div class="main__stats">
              <span class="stat"><b>{{ canal().pedidos.length }}</b> pedidos</span>
              <span class="stat-sep"></span>
              <span class="stat">$<b>{{ canal().montoTotal | number:'1.0-0' }}</b></span>
              <span class="stat-sep"></span>
              <span class="stat" [class.stat--warn]="maxTiempo() > 30" [class.stat--danger]="maxTiempo() > 45">
                Máx <b>{{ maxTiempo() }}'</b>
              </span>
            </div>
          </div>
        </div>
        <div class="main__header-actions">
          <button class="btn-restaurar" (click)="restaurar.emit()" title="Volver al plano del salón">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Plano
          </button>
          <button class="btn-nuevo" [style.background]="canal().color" (click)="nuevoPedido.emit()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo pedido
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="main__filters">
        <div class="filter-pills">
          @for (f of filtros; track f.id) {
            <button
              class="pill"
              [class.pill--active]="filter() === f.id"
              (click)="filter.set(f.id)"
            >{{ f.label }} <span class="pill__count">{{ countBy(f.id) }}</span></button>
          }
        </div>
        <div class="filters-right">
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Buscar por nº, cliente o dirección…" [value]="search()" (input)="onSearch($event)" />
          </div>
          <div class="view-toggle" role="tablist" aria-label="Modo de vista">
            <button class="view-btn" [class.view-btn--active]="viewMode() === 'card'" (click)="viewMode.set('card')" type="button" title="Cards">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button class="view-btn" [class.view-btn--active]="viewMode() === 'card-sm'" (click)="viewMode.set('card-sm')" type="button" title="Cards compactas">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="10" y="3" width="5" height="5" rx="1"/><rect x="17" y="3" width="4" height="5" rx="1"/>
                <rect x="3" y="10" width="5" height="5" rx="1"/><rect x="10" y="10" width="5" height="5" rx="1"/><rect x="17" y="10" width="4" height="5" rx="1"/>
                <rect x="3" y="17" width="5" height="4" rx="1"/><rect x="10" y="17" width="5" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/>
              </svg>
            </button>
            <button class="view-btn" [class.view-btn--active]="viewMode() === 'list'" (click)="viewMode.set('list')" type="button" title="Listado">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de pedidos -->
      <div class="main__list" [class]="'main__list--' + viewMode()">
        @for (pedido of filteredPedidos(); track pedido.id) {
          @if (viewMode() === 'list') {
            <div class="pedido-row"
              [class.pedido-row--urgente]="pedido.minutosDesdeCreacion > 45"
              (click)="pedidoClick.emit(pedido)"
              (mouseenter)="onHover(pedido, $event)"
              (mouseleave)="onLeave()"
            >
              <span class="pedido-row__numero">{{ pedido.numero }}</span>
              <span class="pedido-row__tiempo"
                [class.pedido-row__tiempo--warn]="pedido.minutosDesdeCreacion > 30"
                [class.pedido-row__tiempo--danger]="pedido.minutosDesdeCreacion > 45"
              >{{ pedido.minutosDesdeCreacion }}'</span>
              <span class="pedido-row__cliente">{{ clienteFor(pedido) }}</span>
              <span class="pedido-row__items">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h18"/>
                </svg>
                {{ itemsCountFor(pedido) }} items
              </span>
              <span class="pedido-row__monto">\${{ pedido.monto | number:'1.0-0' }}</span>
              <div class="pedido-row__actions">
                <button class="act-btn act-btn--primary" (click)="$event.stopPropagation(); cobrar.emit(pedido)">Cobrar</button>
                <button class="act-btn" (click)="$event.stopPropagation(); facturar.emit(pedido)">Facturar</button>
              </div>
            </div>
          } @else {
            <div class="pedido-card"
              [class.pedido-card--urgente]="pedido.minutosDesdeCreacion > 45"
              [class.pedido-card--sm]="viewMode() === 'card-sm'"
              (click)="pedidoClick.emit(pedido)"
              (mouseenter)="onHover(pedido, $event)"
              (mouseleave)="onLeave()"
            >
              <div class="pedido-card__top">
                <div class="pedido-card__numero-wrap">
                  <span class="pedido-card__numero">{{ pedido.numero }}</span>
                  <span class="pedido-card__estado"
                    [class.pedido-card__estado--en-curso]="pedido.estado === 'EN_CURSO'"
                    [class.pedido-card__estado--listo]="pedido.estado === 'LISTO'"
                    [class.pedido-card__estado--entregado]="pedido.estado === 'ENTREGADO'"
                  >{{ estadoLabel(pedido.estado) }}</span>
                </div>
                <span class="pedido-card__tiempo"
                  [class.pedido-card__tiempo--warn]="pedido.minutosDesdeCreacion > 30"
                  [class.pedido-card__tiempo--danger]="pedido.minutosDesdeCreacion > 45"
                >{{ pedido.minutosDesdeCreacion }}'</span>
              </div>
              @if (viewMode() === 'card') {
                <div class="pedido-card__row">
                  <span class="pedido-card__cliente">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {{ clienteFor(pedido) }}
                  </span>
                  @if (mostrarDireccion()) {
                    <span class="pedido-card__direccion">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ direccionFor(pedido) }}
                    </span>
                  }
                </div>
              }
              <div class="pedido-card__bottom">
                <span class="pedido-card__monto">\${{ pedido.monto | number:'1.0-0' }}</span>
                @if (viewMode() === 'card') {
                  <div class="pedido-card__actions">
                    <button class="act-btn act-btn--primary" (click)="$event.stopPropagation(); cobrar.emit(pedido)">Cobrar</button>
                    <button class="act-btn" (click)="$event.stopPropagation(); facturar.emit(pedido)">Facturar</button>
                  </div>
                }
              </div>
            </div>
          }
        }
        @if (filteredPedidos().length === 0) {
          <div class="empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Sin pedidos con el filtro actual</span>
          </div>
        }
      </div>
    </div>

    <!-- Popover de hover -->
    @if (hoveredPedido(); as p) {
      <div class="tooltip" [class.tooltip--below]="tooltipBelow()" [style.top.px]="tooltipY()" [style.left.px]="tooltipX()">
        <div class="tooltip__head">
          <div class="tooltip__head-left">
            <span class="tooltip__numero">{{ p.numero }}</span>
            <span class="tooltip__estado"
              [class.tooltip__estado--en-curso]="p.estado === 'EN_CURSO'"
              [class.tooltip__estado--listo]="p.estado === 'LISTO'"
              [class.tooltip__estado--entregado]="p.estado === 'ENTREGADO'"
            >{{ estadoLabel(p.estado) }}</span>
          </div>
          <span class="tooltip__tiempo"
            [class.tooltip__tiempo--warn]="p.minutosDesdeCreacion > 30"
            [class.tooltip__tiempo--danger]="p.minutosDesdeCreacion > 45"
          >{{ p.minutosDesdeCreacion }}'</span>
        </div>

        <div class="tooltip__meta">
          <div class="tooltip__meta-row">
            <span class="tooltip__meta-label">Cliente</span>
            <span class="tooltip__meta-value">{{ tooltipCliente() }}</span>
          </div>
          @if (mostrarDireccion()) {
            <div class="tooltip__meta-row">
              <span class="tooltip__meta-label">Dirección</span>
              <span class="tooltip__meta-value tooltip__meta-value--2line">{{ tooltipDireccion() }}</span>
            </div>
          }
        </div>

        <div class="tooltip__items-label">
          Items <span class="tooltip__items-count">({{ tooltipPlatos().length }})</span>
        </div>
        <div class="tooltip__platos">
          @for (plato of tooltipPlatos(); track plato.nombre) {
            <div class="tooltip__plato">
              <span class="tooltip__plato-qty">{{ plato.cantidad }}</span>
              <span class="tooltip__plato-name">{{ plato.nombre }}</span>
            </div>
          }
        </div>

        <div class="tooltip__total">
          <span class="tooltip__total-label">Total</span>
          <span class="tooltip__total-value">\${{ p.monto | number:'1.0-0' }}</span>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .main {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      padding: 16px 24px 10px 14px;
      overflow: hidden;
    }

    /* Header */
    .main__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 18px;
      background: linear-gradient(180deg, #0A0E4A 0%, #01033E 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(1, 3, 62, 0.25);
      cursor: grab;
    }
    .main__header:active { cursor: grabbing; }
    .main__header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .main__icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .main__title-box { display: flex; flex-direction: column; gap: 4px; }
    .main__title {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 0.3px;
    }
    .main__stats {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
    .stat b { color: #fff; font-weight: 700; }
    .stat-sep { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.3); }
    .stat--warn { color: #FBBF24; }
    .stat--warn b { color: #FBBF24; }
    .stat--danger { color: #F87171; }
    .stat--danger b { color: #F87171; }

    .main__header-actions { display: flex; align-items: center; gap: 10px; }
    .btn-restaurar {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-restaurar:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }
    .btn-nuevo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: 10px;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: transform 0.12s, box-shadow 0.12s;
    }
    .btn-nuevo:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.3); }

    /* Filtros */
    .main__filters {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 4px;
      flex-shrink: 0;
    }
    .filter-pills {
      display: flex;
      gap: 6px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 999px;
      border: 1px solid #CBD5E1;
      background: #fff;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.12s;
    }
    .pill:hover { border-color: #94A3B8; color: #1E293B; }
    .pill--active {
      background: #F27920;
      border-color: #F27920;
      color: #fff;
    }
    .pill__count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      padding: 0 5px;
      height: 16px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.08);
      font-size: 10px;
      font-weight: 700;
    }
    .pill--active .pill__count {
      background: rgba(255, 255, 255, 0.25);
    }
    .filters-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .view-toggle {
      display: inline-flex;
      gap: 0;
      background: #fff;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 2px;
    }
    .view-btn {
      width: 32px; height: 30px;
      display: grid; place-items: center;
      border: none; background: transparent;
      color: #94A3B8; cursor: pointer;
      border-radius: 6px;
      transition: background 0.12s, color 0.12s;
    }
    .view-btn:hover { color: #475569; }
    .view-btn--active {
      background: #F27920;
      color: #fff;
    }
    .view-btn--active:hover { color: #fff; }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      background: #fff;
      border: 1px solid #E5E7EB;
      border-radius: 999px;
      min-width: 280px;
    }
    .search-box input {
      border: none;
      outline: none;
      flex: 1;
      font-family: inherit;
      font-size: 12px;
      color: #1E293B;
      background: transparent;
    }
    .search-box input::placeholder { color: #9CA3AF; }

    /* Lista */
    .main__list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      gap: 12px;
      padding: 4px 4px 16px;
    }
    .main__list--card {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      align-content: start;
    }
    .main__list--card-sm {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      align-content: start;
      gap: 8px;
    }
    .main__list--list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .pedido-card {
      background: #fff;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.05);
      cursor: pointer;
      transition: border-color 0.12s, transform 0.12s, box-shadow 0.12s;
    }
    .pedido-card:hover {
      border-color: #F27920;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(242, 121, 32, 0.12);
    }
    .pedido-card--urgente {
      border-color: #F87171;
      box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.12);
    }
    .pedido-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pedido-card__numero-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pedido-card__numero {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
    }
    .pedido-card__estado {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .pedido-card__estado--en-curso { background: #FEF3C7; color: #92400E; }
    .pedido-card__estado--listo { background: #D1FAE5; color: #065F46; }
    .pedido-card__estado--entregado { background: #E5E7EB; color: #4B5563; }
    .pedido-card__tiempo {
      font-size: 12px;
      font-weight: 700;
      color: #6B7280;
      padding: 3px 8px;
      border-radius: 6px;
      background: #F3F4F6;
    }
    .pedido-card__tiempo--warn { background: #FEF3C7; color: #92400E; }
    .pedido-card__tiempo--danger { background: #FEE2E2; color: #991B1B; }
    .pedido-card__row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: #6B7280;
    }
    .pedido-card__cliente,
    .pedido-card__direccion {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .pedido-card__bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 6px;
      border-top: 1px dashed #E5E7EB;
    }
    .pedido-card__monto {
      font-size: 15px;
      font-weight: 800;
      color: #0F172A;
    }
    .pedido-card__actions {
      display: flex;
      gap: 6px;
    }
    .act-btn {
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid #E5E7EB;
      background: #fff;
      color: #475569;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.12s;
    }
    .act-btn:hover { background: #F8FAFC; }
    .act-btn--primary {
      background: #F27920;
      border-color: #F27920;
      color: #fff;
    }
    .act-btn--primary:hover { background: #E06D15; }

    .empty {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 40px;
      color: #94A3B8;
      font-size: 13px;
    }

    /* Card pequeña */
    .pedido-card--sm { padding: 10px 12px; gap: 6px; }
    .pedido-card--sm .pedido-card__numero { font-size: 14px; }
    .pedido-card--sm .pedido-card__estado { font-size: 9px; padding: 2px 6px; }
    .pedido-card--sm .pedido-card__tiempo { font-size: 11px; padding: 2px 6px; }
    .pedido-card--sm .pedido-card__monto { font-size: 13px; }
    .pedido-card--sm .pedido-card__bottom { padding-top: 4px; }
    .pedido-card--sm .act-btn { padding: 4px 8px; font-size: 10px; }

    /* Listado */
    .pedido-row {
      display: grid;
      grid-template-columns: 80px 60px 1fr 110px 110px auto;
      align-items: center;
      gap: 14px;
      padding: 10px 14px;
      background: #fff;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition: border-color 0.12s, box-shadow 0.12s, background 0.12s;
    }
    .pedido-row:hover {
      border-color: #F27920;
      box-shadow: 0 4px 12px rgba(242, 121, 32, 0.10);
      background: #FFFBF5;
    }
    .pedido-row--urgente {
      border-color: #F87171;
      box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.10);
    }
    .pedido-row__numero { font-size: 14px; font-weight: 800; color: #0F172A; }
    .pedido-row__cliente { font-size: 13px; color: #1E293B; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pedido-row__items {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; color: #6B7280; font-weight: 600;
    }
    .pedido-row__items svg { color: #9CA3AF; }
    .pedido-row__tiempo {
      font-size: 11px; font-weight: 700;
      padding: 4px 10px; border-radius: 999px;
      background: #ECFDF5; color: #059669;
      text-align: center;
      justify-self: start;
    }
    .pedido-row__tiempo--warn { background: #FFFBEB; color: #D97706; }
    .pedido-row__tiempo--danger { background: #FEF2F2; color: #DC2626; }
    .pedido-row__monto { font-size: 14px; font-weight: 800; color: #0F172A; text-align: right; }
    .pedido-row__actions { display: flex; gap: 6px; }

    /* Hover popover (light) */
    .tooltip {
      position: fixed;
      transform: translateY(-100%);
      background: #fff;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      padding: 0;
      width: 280px;
      z-index: 1000;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.14), 0 2px 6px rgba(15, 23, 42, 0.06);
      animation: fadeInTooltip 0.14s ease-out;
      pointer-events: none;
      overflow: hidden;
    }
    .tooltip--below { transform: none; }
    .tooltip__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px 10px;
      border-bottom: 1px solid #F3F4F6;
    }
    .tooltip__head-left {
      display: flex; align-items: center; gap: 8px;
      min-width: 0;
    }
    .tooltip__numero {
      font-size: 14px; font-weight: 800; color: #0F172A;
    }
    .tooltip__estado {
      font-size: 9px; font-weight: 700;
      padding: 2px 7px; border-radius: 999px;
      letter-spacing: 0.3px; text-transform: uppercase;
    }
    .tooltip__estado--en-curso { background: #FEF3C7; color: #92400E; }
    .tooltip__estado--listo { background: #D1FAE5; color: #065F46; }
    .tooltip__estado--entregado { background: #E5E7EB; color: #4B5563; }
    .tooltip__tiempo {
      font-size: 11px; font-weight: 700;
      padding: 3px 9px; border-radius: 999px;
      background: #ECFDF5; color: #059669;
      flex-shrink: 0;
    }
    .tooltip__tiempo--warn { background: #FFFBEB; color: #D97706; }
    .tooltip__tiempo--danger { background: #FEF2F2; color: #DC2626; }

    .tooltip__meta {
      padding: 10px 14px;
      display: flex; flex-direction: column; gap: 6px;
      border-bottom: 1px solid #F3F4F6;
      background: #FAFAFA;
    }
    .tooltip__meta-row {
      display: grid;
      grid-template-columns: 70px 1fr;
      gap: 10px;
      align-items: baseline;
    }
    .tooltip__meta-label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.4px;
      color: #9CA3AF;
    }
    .tooltip__meta-value {
      font-size: 12px; font-weight: 600; color: #1E293B;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .tooltip__meta-value--2line {
      white-space: normal;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tooltip__items-label {
      padding: 10px 14px 4px;
      font-size: 10px; font-weight: 700;
      color: #6B7280;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .tooltip__items-count { color: #9CA3AF; font-weight: 600; }
    .tooltip__platos {
      padding: 0 14px 8px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .tooltip__plato {
      display: flex; align-items: baseline; gap: 8px;
    }
    .tooltip__plato-qty {
      flex-shrink: 0;
      min-width: 22px; height: 18px;
      padding: 0 6px;
      border-radius: 999px;
      background: #FFF7ED;
      color: #F27920;
      font-size: 10px; font-weight: 700;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .tooltip__plato-name { font-size: 12px; color: #1E293B; font-weight: 500; line-height: 1.3; }

    .tooltip__total {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px 12px;
      border-top: 1px solid #F3F4F6;
      background: #FAFAFA;
    }
    .tooltip__total-label {
      font-size: 11px; font-weight: 700; color: #6B7280;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    .tooltip__total-value {
      font-size: 16px; font-weight: 800; color: #0F172A;
      letter-spacing: -.01em;
    }
    @keyframes fadeInTooltip {
      from { opacity: 0; transform: translateY(-100%) translateY(-4px); }
      to { opacity: 1; transform: translateY(-100%); }
    }
    .tooltip--below { animation-name: fadeInTooltipBelow; }
    @keyframes fadeInTooltipBelow {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ChannelMainComponent {
  canal = input.required<CanalVenta>();
  nuevoPedido = output<void>();
  pedidoClick = output<PedidoCanal>();
  cobrar = output<PedidoCanal>();
  facturar = output<PedidoCanal>();
  restaurar = output<void>();
  dragStart = output<DragEvent>();
  dragEnd = output<void>();

  readonly filter = signal<FilterEstado>('TODOS');
  readonly search = signal('');
  readonly viewMode = signal<ViewMode>('card');

  readonly hoveredPedido = signal<PedidoCanal | null>(null);
  readonly tooltipX = signal(0);
  readonly tooltipY = signal(0);
  readonly tooltipBelow = signal(false);

  readonly mostrarDireccion = computed(() => {
    const t = this.canal().tipo;
    return t === 'DELIVERY' || t === 'PEDIDOS_YA' || t === 'RAPPI';
  });

  readonly tooltipCliente = computed(() => {
    const p = this.hoveredPedido();
    return p ? this.clienteFor(p) : '';
  });

  readonly tooltipDireccion = computed(() => {
    const p = this.hoveredPedido();
    return p ? this.direccionFor(p) : '';
  });

  readonly tooltipPlatos = computed(() => {
    const p = this.hoveredPedido();
    if (!p) return [];
    const idx = this.hash(p.id) % PLATOS_MOCK.length;
    return PLATOS_MOCK[idx];
  });

  readonly filtros: { id: FilterEstado; label: string }[] = [
    { id: 'TODOS', label: 'Todos' },
    { id: 'EN_CURSO', label: 'En curso' },
    { id: 'LISTO', label: 'Listos' },
    { id: 'ENTREGADO', label: 'Entregados' },
  ];

  readonly maxTiempo = computed(() => {
    const p = this.canal().pedidos;
    if (p.length === 0) return 0;
    return Math.max(...p.map(x => x.minutosDesdeCreacion));
  });

  readonly filteredPedidos = computed(() => {
    const f = this.filter();
    const q = this.search().trim().toLowerCase();
    const pedidos = this.canal().pedidos;
    return pedidos
      .filter(p => f === 'TODOS' || p.estado === f)
      .filter(p => {
        if (!q) return true;
        return p.numero.toLowerCase().includes(q) ||
               this.clienteFor(p).toLowerCase().includes(q) ||
               this.direccionFor(p).toLowerCase().includes(q);
      });
  });

  countBy(f: FilterEstado): number {
    const pedidos = this.canal().pedidos;
    if (f === 'TODOS') return pedidos.length;
    return pedidos.filter(p => p.estado === f).length;
  }

  estadoLabel(e: PedidoCanal['estado']): string {
    switch (e) {
      case 'EN_CURSO': return 'En curso';
      case 'LISTO': return 'Listo';
      case 'ENTREGADO': return 'Entregado';
    }
  }

  clienteFor(p: PedidoCanal): string {
    const idx = this.hash(p.id) % NOMBRES_MOCK.length;
    return NOMBRES_MOCK[idx];
  }

  direccionFor(p: PedidoCanal): string {
    const idx = this.hash(p.id) % DIRECCIONES_MOCK.length;
    return DIRECCIONES_MOCK[idx];
  }

  itemsCountFor(p: PedidoCanal): number {
    const idx = this.hash(p.id) % PLATOS_MOCK.length;
    return PLATOS_MOCK[idx].reduce((sum, x) => sum + x.cantidad, 0);
  }

  onSearch(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.search.set(v);
  }

  onHover(pedido: PedidoCanal, event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const estimatedHeight = 240;
    const tooltipWidth = 240;
    const flipBelow = rect.top < estimatedHeight + 16;
    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - tooltipWidth - 8));
    this.tooltipX.set(x);
    this.tooltipY.set(flipBelow ? rect.bottom + 8 : rect.top - 8);
    this.tooltipBelow.set(flipBelow);
    this.hoveredPedido.set(pedido);
  }

  onLeave(): void {
    this.hoveredPedido.set(null);
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
}
