import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ItemPedido, Comensal } from '../../models/mesa-pedido.model';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pedido">
      <!-- Comensales + Cliente -->
      <div class="pedido__topbar">
        @if (!modoPedido()) {
          <button class="pedido__topbar-btn" (click)="editComensales.emit()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{{ comensales().length }}</span>
          </button>
        }
        <button class="pedido__topbar-btn pedido__topbar-btn--dashed" (click)="openMozo.emit()">
          @if (modoPedido()) {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 12 16 16 16 8"/><line x1="1" y1="10" x2="16" y2="10"/>
            </svg>
            <span>Repartidor</span>
          } @else {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 0 0-9z"/><path d="M19.5 21a7.5 7.5 0 0 0-15 0"/>
            </svg>
            <span>Asignar mozo</span>
          }
        </button>
        <button class="pedido__topbar-btn pedido__topbar-btn--dashed" (click)="openCliente.emit()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Asignar cliente</span>
        </button>
        <div class="pedido__topbar-menu">
          <button class="pedido__topbar-btn pedido__topbar-btn--menu" (click)="toggleMenu()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          @if (showMenu()) {
            <div class="menu-dropdown">
              <button class="menu-dropdown__item" (click)="showMenu.set(false); openObservacion.emit()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Observación de mesa
              </button>
              <button class="menu-dropdown__item" (click)="showMenu.set(false); openTransferencia.emit()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 3 21 3 21 9"/><line x1="21" y1="3" x2="14" y2="10"/><path d="M10 14L3 21"/>
                </svg>
                Transferir mesa
              </button>
              <button class="menu-dropdown__item" (click)="showMenu.set(false)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="18" y1="10" x2="18" y2="14"/><line x1="6" y1="14" x2="18" y2="14"/><line x1="12" y1="14" x2="12" y2="20"/>
                </svg>
                Unir mesa
              </button>
              <button class="menu-dropdown__item menu-dropdown__item--danger" (click)="showMenu.set(false); openAnular.emit()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Anular mesa
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Items list -->
      <div class="pedido__items">
        <div class="pedido__header-row">
          <span class="col-qty">Cant</span>
          <span class="col-name">Producto</span>
          <span class="col-price">P/U</span>
          <span class="col-subtotal">Subtotal</span>
        </div>
        <div class="pedido__scroll">
          @for (item of itemsFiltrados(); track item.id) {
            <div class="pedido__row" [class.pedido__row--enviado]="item.enviado">
              <div class="col-qty">
                <button class="qty-btn" (click)="decrementItem.emit(item.id)">−</button>
                <span class="qty-value">{{ item.cantidad }}</span>
                <button class="qty-btn" (click)="incrementItem.emit(item.id)">+</button>
              </div>
              <span class="col-name" (click)="itemClick.emit(item)">{{ item.nombre }}</span>
              <span class="col-price" (click)="itemClick.emit(item)">\${{ item.precioUnitario | number:'1.0-0' }}</span>
              <span class="col-subtotal" (click)="itemClick.emit(item)">\${{ item.subtotal | number:'1.0-0' }}</span>
            </div>
          }
          @if (itemsFiltrados().length === 0) {
            <div class="pedido__empty">Sin items</div>
          }
        </div>
      </div>

      <!-- Totals -->
      <div class="pedido__totals">
        <div class="pedido__total-row">
          <span>Subtotal</span>
          <span>\${{ subtotal() | number:'1.0-0' }}</span>
        </div>
        <div class="pedido__total-row pedido__total-row--total">
          <span>TOTAL</span>
          <span>\${{ total() | number:'1.0-0' }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="pedido__actions">
        <button class="action-btn" (click)="openDescuento.emit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span>Descuento</span>
        </button>
        <button class="action-btn" (click)="openControl.emit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span>Control</span>
        </button>
        <button class="action-btn" (click)="openCobrar.emit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <span>Cobrar</span>
        </button>
        <div class="action-btn-wrap">
          <button class="action-btn" [class.action-btn--open]="facturarOpen()" (click)="toggleFacturar($event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>Facturar</span>
          </button>
          @if (facturarOpen()) {
            <div class="facturar-popover" (click)="$event.stopPropagation()">
              <button class="facturar-option" (click)="onFacturar('factura-a')">
                <span class="facturar-option__icon">🅰️</span>
                <div class="facturar-option__info">
                  <span class="facturar-option__label">Factura A</span>
                  <span class="facturar-option__detalle">Responsable Inscripto</span>
                </div>
              </button>
              <button class="facturar-option" (click)="onFacturar('factura-b')">
                <span class="facturar-option__icon">🅱️</span>
                <div class="facturar-option__info">
                  <span class="facturar-option__label">Factura B</span>
                  <span class="facturar-option__detalle">Consumidor Final</span>
                </div>
              </button>
              <button class="facturar-option" (click)="onFacturar('ticket')">
                <span class="facturar-option__icon">🧾</span>
                <div class="facturar-option__info">
                  <span class="facturar-option__label">Ticket</span>
                  <span class="facturar-option__detalle">Comprobante no fiscal</span>
                </div>
              </button>
            </div>
          }
        </div>
        <button class="action-btn action-btn--marcha" (click)="marcha.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Marcha ya</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    .pedido {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: #F6F6F6;
      color: #1E293B;
      overflow: hidden;
    }

    /* Top bar: comensales + cliente */
    .pedido__topbar {
      display: flex;
      gap: 6px;
      padding: 8px 12px;
      flex-shrink: 0;
      background: linear-gradient(180deg, #0A0E4A 0%, #01033E 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .pedido__topbar-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .pedido__topbar-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }
    .pedido__topbar-btn--dashed {
      border-style: dashed;
      border-color: rgba(255, 255, 255, 0.4);
      color: #fff;
      background: transparent;
    }
    .pedido__topbar-btn--dashed:hover {
      border-color: rgba(255, 255, 255, 0.6);
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
    }
    .pedido__topbar-menu {
      position: relative;
      margin-left: auto;
    }
    .pedido__topbar-btn--menu {
      padding: 7px 8px;
    }
    .menu-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      background: #fff;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      padding: 4px;
      min-width: 200px;
      z-index: 50;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
      animation: fadeIn 0.12s ease-out;
    }
    .menu-dropdown__item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      border-radius: 8px;
      background: none;
      color: #334155;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.12s;
    }
    .menu-dropdown__item:hover {
      background: #F1F5F9;
    }
    .menu-dropdown__item--danger {
      color: #DC2626;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* Items */
    .pedido__items {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .pedido__header-row {
      display: flex;
      padding: 10px 18px 6px;
      font-size: 10px;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #F6F6F6;
      flex-shrink: 0;
    }
    .pedido__scroll {
      flex: 1;
      overflow-y: auto;
      background: #F6F6F6;
      padding: 0 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .pedido__row {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      font-size: 13px;
      color: #1a1a1a;
      background: #fff;
      border: 1px solid #ECECEC;
      border-radius: 10px;
      transition: background 0.1s, border-color 0.1s;
      cursor: pointer;
    }
    .pedido__row:hover {
      background: #FAFAFA;
      border-color: #E0E0E0;
    }
    .pedido__row--enviado {
      opacity: 0.45;
    }
    .col-qty {
      width: 70px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .qty-btn {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #D1D5DB;
      background: #fff;
      color: #6B7280;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      line-height: 1;
      transition: border-color 0.12s, background 0.12s;
    }
    .qty-btn:hover {
      border-color: #F27920;
      color: #F27920;
    }
    .qty-value {
      min-width: 16px;
      text-align: center;
      font-weight: 700;
      font-size: 13px;
    }
    .col-name { flex: 1; color: #374151; padding-left: 10px; }
    .col-price { width: 75px; text-align: right; color: #9CA3AF; flex-shrink: 0; }
    .col-subtotal { width: 85px; text-align: right; font-weight: 600; color: #1a1a1a; flex-shrink: 0; }
    .pedido__empty {
      padding: 24px;
      text-align: center;
      color: #9CA3AF;
      font-size: 13px;
    }

    /* Totals */
    .pedido__totals {
      padding: 12px 16px;
      background: #fff;
      border-top: 1px solid #ECECEC;
      flex-shrink: 0;
    }
    .pedido__total-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748B;
      padding: 2px 0;
    }
    .pedido__total-row--total {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
      padding-top: 4px;
    }

    /* Actions */
    .pedido__actions {
      display: flex;
      gap: 6px;
      padding: 10px 12px;
      background: linear-gradient(180deg, #0A0E4A 0%, #01033E 100%);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      flex-shrink: 0;
    }
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 6px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      font-size: 9px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      flex: 1;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }
    .action-btn--marcha {
      background: #F27920;
      border-color: #F27920;
      color: #fff;
    }
    .action-btn--marcha:hover {
      background: #E06D15;
      border-color: #E06D15;
    }
    .action-btn--open {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.3);
    }

    /* Facturar popover */
    .action-btn-wrap {
      position: relative;
      flex: 1;
      display: flex;
    }
    .action-btn-wrap .action-btn { flex: 1; }
    .facturar-popover {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #fff;
      border-radius: 12px;
      padding: 6px;
      min-width: 240px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 50;
      animation: popoverIn 0.16s ease-out;
    }
    .facturar-popover::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #fff;
    }
    .facturar-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: none;
      border-radius: 8px;
      background: none;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      transition: background 0.12s;
    }
    .facturar-option:hover {
      background: #FFF7ED;
    }
    .facturar-option__icon {
      font-size: 22px;
      line-height: 1;
      flex-shrink: 0;
    }
    .facturar-option__info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .facturar-option__label {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .facturar-option__detalle {
      font-size: 11px;
      color: #6B7280;
    }
    @keyframes popoverIn {
      from { opacity: 0; transform: translate(-50%, 4px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  `],
})
export class PedidoListComponent {
  items = input.required<ItemPedido[]>();
  comensales = input.required<Comensal[]>();
  modoPedido = input<boolean>(false);
  marcha = output<void>();
  editComensales = output<void>();
  incrementItem = output<string>();
  decrementItem = output<string>();
  itemClick = output<ItemPedido>();
  openMozo = output<void>();
  openCliente = output<void>();
  openObservacion = output<void>();
  openTransferencia = output<void>();
  openAnular = output<void>();
  openDescuento = output<void>();
  openControl = output<void>();
  openCobrar = output<void>();
  facturar = output<'factura-a' | 'factura-b' | 'ticket'>();

  readonly showMenu = signal(false);
  readonly facturarOpen = signal(false);
  readonly itemsFiltrados = computed(() => this.items());

  toggleMenu(): void {
    this.showMenu.update(v => !v);
  }

  toggleFacturar(event: MouseEvent): void {
    event.stopPropagation();
    const next = !this.facturarOpen();
    this.facturarOpen.set(next);
    if (next) {
      setTimeout(() => document.addEventListener('click', this.closeFacturar, { once: true }));
    }
  }

  private closeFacturar = (): void => {
    this.facturarOpen.set(false);
  };

  onFacturar(tipo: 'factura-a' | 'factura-b' | 'ticket'): void {
    this.facturarOpen.set(false);
    this.facturar.emit(tipo);
  }

  readonly subtotal = computed(() =>
    this.itemsFiltrados().reduce((sum, i) => sum + i.subtotal, 0)
  );

  readonly total = computed(() => this.subtotal());
}
