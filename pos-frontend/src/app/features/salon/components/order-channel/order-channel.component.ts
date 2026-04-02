import { Component, input, signal, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CanalVenta, PedidoCanal } from '../../models/salon.model';

@Component({
  selector: 'app-order-channel',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="channel" [class.channel--expanded]="expanded()">
      <!-- Header (always visible) -->
      <button class="channel__header" (click)="toggle()">
        <div class="channel__left">
          <div class="channel__icon" [style.background]="canal().colorBg">
            @switch (canal().tipo) {
              @case ('DELIVERY') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="canal().color" stroke-width="1.8">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              }
              @case ('MOSTRADOR') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="canal().color" stroke-width="1.8">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              }
              @case ('PEDIDOS_YA') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="canal().color" stroke-width="1.8">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              }
              @case ('RAPPI') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="canal().color" stroke-width="1.8">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 12 16 16 16 8"/><line x1="1" y1="10" x2="16" y2="10"/>
                </svg>
              }
            }
          </div>
          <div class="channel__info">
            <span class="channel__label">{{ canal().label }}</span>
            @if (canal().pedidos.length > 0) {
              <div class="channel__meta">
                <span class="channel__count">{{ canal().pedidos.length }} pedidos</span>
                <span class="channel__max-time" [class.channel__max-time--warning]="maxDemora() > 30" [class.channel__max-time--danger]="maxDemora() > 45">
                  {{ maxDemora() }}'
                </span>
              </div>
            }
          </div>
        </div>
        <div class="channel__right">
          <button class="channel__add" [style.background]="canal().color" (click)="nuevoPedido.emit(); $event.stopPropagation()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <svg class="channel__chevron" [class.channel__chevron--open]="expanded()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      <!-- Pedidos list (collapsible) -->
      @if (expanded()) {
        <div class="channel__pedidos">
          @for (pedido of canal().pedidos; track pedido.id) {
            <button class="pedido-row" (click)="pedidoClick.emit(pedido)">
              <div class="pedido-row__left">
                <span class="pedido-row__numero">{{ pedido.numero }}</span>
                @if (pedido.minutosDesdeCreacion > 45) {
                  <span class="pedido-row__estado pedido-row__estado--urgente">Urgente</span>
                } @else if (pedido.minutosDesdeCreacion > 25) {
                  <span class="pedido-row__estado pedido-row__estado--demorado">Demorado</span>
                } @else {
                  <span class="pedido-row__estado pedido-row__estado--normal">Normal</span>
                }
              </div>
              <span class="pedido-row__monto">\${{ pedido.monto | number:'1.0-0' }}</span>
              <span class="pedido-row__time" [class.pedido-row__time--warning]="pedido.minutosDesdeCreacion > 30" [class.pedido-row__time--danger]="pedido.minutosDesdeCreacion > 45">
                {{ pedido.minutosDesdeCreacion }}'
              </span>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .channel {
      background: transparent;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #F0F0F0;
    }
    .channel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 20px 18px;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.12s;
    }
    .channel__header:hover {
      background: #FAFAFA;
    }
    .channel__left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .channel__icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .channel__info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }
    .channel__label {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.2;
    }
    .channel__meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .channel__count {
      font-size: 12px;
      color: #9CA3AF;
      font-weight: 500;
    }
    .channel__max-time {
      font-size: 10px;
      font-weight: 700;
      color: #059669;
      background: #ECFDF5;
      padding: 1px 7px;
      border-radius: 20px;
    }
    .channel__max-time--warning {
      color: #D97706;
      background: #FFFBEB;
    }
    .channel__max-time--danger {
      color: #DC2626;
      background: #FEF2F2;
    }
    .channel__right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .channel__monto {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      min-width: 90px;
      text-align: right;
    }
    .channel__add {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .channel__add:hover {
      opacity: 0.85;
    }
    .channel__add:active {
      transform: scale(0.92);
    }
    .channel__chevron {
      color: #9CA3AF;
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .channel__chevron--open {
      transform: rotate(180deg);
    }

    /* Pedidos list */
    .channel__pedidos {
      border-top: 1px solid #F0F0F0;
    }
    .pedido-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 18px 18px 28px;
      border: none;
      background: none;
      width: 100%;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.12s;
    }
    .pedido-row:hover {
      background: #FAFAFA;
    }
    .pedido-row + .pedido-row {
      border-top: 1px solid #F7F7F7;
    }
    .pedido-row__left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pedido-row__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .pedido-row__numero {
      font-size: 15px;
      font-weight: 600;
      color: #374151;
    }
    .pedido-row__estado {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .pedido-row__estado--normal {
      color: #059669;
      background: #ECFDF5;
    }
    .pedido-row__estado--demorado {
      color: #D97706;
      background: #FFFBEB;
    }
    .pedido-row__estado--urgente {
      color: #DC2626;
      background: #FEF2F2;
    }
    .pedido-row__monto {
      font-size: 17px;
      font-weight: 700;
      color: #1a1a1a;
      flex: 1;
      text-align: right;
      margin-right: 14px;
    }
    .pedido-row__time {
      font-size: 12px;
      font-weight: 600;
      color: #059669;
      background: #ECFDF5;
      padding: 3px 10px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .pedido-row__time--warning {
      color: #D97706;
      background: #FFFBEB;
    }
    .pedido-row__time--danger {
      color: #DC2626;
      background: #FEF2F2;
    }
  `],
})
export class OrderChannelComponent {
  canal = input.required<CanalVenta>();
  expanded = signal(false);
  nuevoPedido = output<void>();
  pedidoClick = output<PedidoCanal>();

  readonly maxDemora = computed(() =>
    Math.max(...this.canal().pedidos.map(p => p.minutosDesdeCreacion), 0)
  );

  toggle(): void {
    this.expanded.update(v => !v);
  }
}
