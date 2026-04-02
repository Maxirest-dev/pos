import { Component, input, computed, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CanalVenta, PedidoCanal } from '../../models/salon.model';
import { OrderChannelComponent } from '../order-channel/order-channel.component';

@Component({
  selector: 'app-active-orders',
  standalone: true,
  imports: [OrderChannelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="active-orders">
      <div class="active-orders__card">
        <div class="active-orders__header">
          <h3 class="active-orders__title">Pedidos activos</h3>
          <span class="active-orders__badge">{{ totalPedidos() }}</span>
        </div>

        <div class="active-orders__list">
          @for (canal of canales(); track canal.tipo) {
            <app-order-channel
              [canal]="canal"
              (nuevoPedido)="onNuevoPedido(canal)"
              (pedidoClick)="onPedidoClick($event)"
            />
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .active-orders {
      width: 430px;
      flex-shrink: 0;
      padding: 16px 10px 10px 8px;
      margin-left: auto;
      display: flex;
      min-height: 0;
    }
    .active-orders__card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 14px;
      padding: 16px;
      box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.6);
      flex: 1;
      min-height: 0;
      overflow: hidden;
      backdrop-filter: blur(8px);
    }
    .active-orders__header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .active-orders__title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }
    .active-orders__badge {
      background: #3B82F6;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
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
    }

    @media (max-width: 1024px) {
      .active-orders { width: 280px; }
    }
    @media (max-width: 768px) {
      .active-orders { width: 100%; padding: 0 12px 12px; }
    }
  `],
})
export class ActiveOrdersComponent {
  private readonly router = inject(Router);
  canales = input.required<CanalVenta[]>();
  nuevoPedidoCanal = output<string>();

  readonly totalPedidos = computed(() =>
    this.canales().reduce((sum, c) => sum + c.pedidos.length, 0)
  );

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
