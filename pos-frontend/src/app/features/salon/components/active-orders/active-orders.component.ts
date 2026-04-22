import { Component, input, computed, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CanalVenta, CanalVentaTipo, PedidoCanal } from '../../models/salon.model';
import { OrderChannelComponent } from '../order-channel/order-channel.component';

type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-active-orders',
  standalone: true,
  imports: [OrderChannelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="active-orders">
      <div class="active-orders__card">
        <div class="active-orders__header">
          <div class="active-orders__header-left">
            <h3 class="active-orders__title">Pedidos activos</h3>
            <span class="active-orders__badge">{{ totalPedidos() }}</span>
          </div>
          <div class="active-orders__header-actions">
            <button
              class="active-orders__cta"
              [class.active-orders__cta--active]="showFilterModal()"
              title="Filtrar"
              (click)="showFilterModal.set(!showFilterModal())"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </button>
            <button class="active-orders__cta" title="Buscar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1155CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="active-orders__list">
          <ng-content select="[prepend]" />
          @for (canal of filteredCanales(); track canal.tipo) {
            <app-order-channel
              [canal]="canal"
              (nuevoPedido)="onNuevoPedido(canal)"
              (pedidoClick)="onPedidoClick($event)"
              (dragStart)="canalDragStart.emit({ tipo: canal.tipo, event: $event })"
              (dragEnd)="canalDragEnd.emit()"
            />
          }
        </div>
      </div>
    </div>

    @if (showFilterModal()) {
      <div class="filter-backdrop" (click)="showFilterModal.set(false)"></div>
      <div class="filter-dialog">
        <div class="filter-dialog__header">
          <h3 class="filter-dialog__title">Filtros</h3>
          <button class="filter-dialog__close" (click)="showFilterModal.set(false)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="filter-dialog__section">
          <span class="filter-dialog__label">Ordenar por</span>
          <div class="filter-dialog__sort">
            <button
              class="filter-dialog__sort-btn"
              [class.filter-dialog__sort-btn--active]="sortOrder() === 'asc'"
              (click)="sortOrder.set('asc')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              Ascendente
            </button>
            <button
              class="filter-dialog__sort-btn"
              [class.filter-dialog__sort-btn--active]="sortOrder() === 'desc'"
              (click)="sortOrder.set('desc')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              Descendente
            </button>
          </div>
        </div>

        <div class="filter-dialog__divider"></div>

        <div class="filter-dialog__section">
          <span class="filter-dialog__label">Mostrar canales</span>
          <div class="filter-dialog__channels">
            @for (canal of canales(); track canal.tipo) {
              <label class="filter-dialog__channel">
                <input
                  type="checkbox"
                  class="filter-dialog__checkbox"
                  [checked]="isCanalVisible(canal.tipo)"
                  (change)="toggleCanal(canal.tipo)"
                />
                <span class="filter-dialog__channel-dot" [style.background]="canal.color"></span>
                <span class="filter-dialog__channel-label">{{ canal.label }}</span>
                <span class="filter-dialog__channel-count">{{ canal.pedidos.length }}</span>
              </label>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      width: 430px;
      flex-shrink: 0;
      position: relative;
    }
    .active-orders {
      width: 100%;
      flex-shrink: 0;
      padding: 16px 10px 10px 8px;
      display: flex;
      min-height: 0;
    }
    .active-orders__card {
      display: flex;
      flex-direction: column;
      gap: 0;
      background: #F1F5F9;
      border-radius: 14px;
      padding: 0;
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
      border: 1px solid #CBD5E1;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .active-orders__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      background: linear-gradient(180deg, #0A0E4A 0%, #01033E 100%);
      padding: 0 10px 0 14px;
      min-height: 42px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .active-orders__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .active-orders__title {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      letter-spacing: 0.3px;
    }
    .active-orders__badge {
      background: #F27920;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      min-width: 22px;
      text-align: center;
      line-height: 1.3;
    }
    .active-orders__header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .active-orders__cta {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      padding: 0;
    }
    .active-orders__cta svg { stroke: currentColor; }
    .active-orders__cta:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }
    .active-orders__cta--active {
      background: #F27920 !important;
      color: #fff;
      border-color: #F27920;
    }
    .active-orders__cta--active svg { stroke: #fff; }

    /* Filter dialog (centered) */
    .filter-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1000;
    }
    .filter-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1001;
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      width: 400px;
      max-width: 90vw;
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .filter-dialog__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .filter-dialog__title {
      font-size: 18px;
      font-weight: 700;
      color: #001345;
      margin: 0;
    }
    .filter-dialog__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: #F3F4F6;
      cursor: pointer;
      transition: background 0.15s;
      padding: 0;
    }
    .filter-dialog__close:hover {
      background: #E5E7EB;
    }
    .filter-dialog__section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .filter-dialog__label {
      font-size: 12px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filter-dialog__sort {
      display: flex;
      gap: 8px;
    }
    .filter-dialog__sort-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1.5px solid #E5E7EB;
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      color: #6B7280;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
      flex: 1;
      justify-content: center;
    }
    .filter-dialog__sort-btn:hover {
      border-color: #1155CC;
      color: #1155CC;
    }
    .filter-dialog__sort-btn--active {
      background: #EEF2FF;
      border-color: #1155CC;
      color: #1155CC;
      font-weight: 600;
    }
    .filter-dialog__divider {
      height: 1px;
      background: #F0F0F0;
      margin: 16px 0;
    }
    .filter-dialog__channels {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .filter-dialog__channel {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.12s;
    }
    .filter-dialog__channel:hover {
      background: #F9FAFB;
    }
    .filter-dialog__checkbox {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      accent-color: #1155CC;
      cursor: pointer;
      flex-shrink: 0;
    }
    .filter-dialog__channel-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .filter-dialog__channel-label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      flex: 1;
    }
    .filter-dialog__channel-count {
      font-size: 12px;
      font-weight: 600;
      color: #9CA3AF;
      background: #F3F4F6;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .active-orders__list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
      padding: 14px 16px 16px;
    }

    @media (max-width: 1024px) {
      :host { width: 280px; }
    }
    @media (max-width: 768px) {
      :host { width: 100%; }
      .active-orders { width: 100%; padding: 0 12px 12px; }
    }
  `],
})
export class ActiveOrdersComponent {
  private readonly router = inject(Router);
  canales = input.required<CanalVenta[]>();
  nuevoPedidoCanal = output<string>();
  canalDragStart = output<{ tipo: CanalVentaTipo; event: DragEvent }>();
  canalDragEnd = output<void>();

  readonly showFilterModal = signal(false);
  readonly sortOrder = signal<SortOrder>('asc');
  readonly hiddenCanales = signal<Set<CanalVentaTipo>>(new Set());

  readonly filteredCanales = computed((): CanalVenta[] => {
    const hidden = this.hiddenCanales();
    const order = this.sortOrder();
    const visible = this.canales().filter(c => !hidden.has(c.tipo));
    return [...visible].sort((a, b) => {
      const diff = a.pedidos.length - b.pedidos.length;
      return order === 'asc' ? diff : -diff;
    });
  });

  readonly totalPedidos = computed(() =>
    this.filteredCanales().reduce((sum, c) => sum + c.pedidos.length, 0)
  );

  isCanalVisible(tipo: CanalVentaTipo): boolean {
    return !this.hiddenCanales().has(tipo);
  }

  toggleCanal(tipo: CanalVentaTipo): void {
    this.hiddenCanales.update(set => {
      const next = new Set(set);
      if (next.has(tipo)) {
        next.delete(tipo);
      } else {
        next.add(tipo);
      }
      return next;
    });
  }

  onNuevoPedido(canal: CanalVenta): void {
    this.nuevoPedidoCanal.emit(canal.tipo);
  }

  onPedidoClick(pedido: PedidoCanal): void {
    const num = pedido.numero.replace('#', '');
    this.router.navigate(['/mesa', num], {
      queryParams: { comensales: 1, modo: 'pedido', canal: pedido.canalTipo },
    });
  }
}
