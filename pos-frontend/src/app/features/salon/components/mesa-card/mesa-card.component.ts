import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Mesa } from '../../models/salon.model';

interface PlatoMock {
  nombre: string;
  cantidad: number;
}

const PLATOS_MOCK: PlatoMock[][] = [
  [{ nombre: 'Bife de chorizo', cantidad: 1 }, { nombre: 'Ensalada mixta', cantidad: 1 }, { nombre: 'Malbec', cantidad: 1 }],
  [{ nombre: 'Hamburguesa completa', cantidad: 2 }, { nombre: 'Papas fritas', cantidad: 1 }, { nombre: 'Coca Cola', cantidad: 2 }],
  [{ nombre: 'Milanesa napolitana', cantidad: 1 }, { nombre: 'Ravioles', cantidad: 1 }, { nombre: 'Agua mineral', cantidad: 2 }, { nombre: 'Flan casero', cantidad: 1 }],
  [{ nombre: 'Parrilla mixta p/2', cantidad: 1 }, { nombre: 'Provoleta', cantidad: 1 }, { nombre: 'Quilmes', cantidad: 3 }],
  [{ nombre: 'Salmón grillé', cantidad: 1 }, { nombre: 'Tiramisú', cantidad: 2 }, { nombre: 'Malbec', cantidad: 1 }],
];

const CLIENTES_MOCK = ['Juan Pérez', 'María González', 'Carlos Ruiz', 'Ana López', 'Pedro Martínez'];
const MOZOS_MOCK = ['Andrea', 'Marcos', 'Lucas', 'Lucía', 'Federico'];

@Component({
  selector: 'app-mesa-card',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mesa-wrap" (mouseenter)="onHover($event)" (mouseleave)="showTooltip.set(false)">
      <button
        class="mesa"
        [class.mesa--disponible]="mesa().estado === 'DISPONIBLE'"
        [class.mesa--ocupada]="mesa().estado === 'OCUPADA'"
        [class.mesa--reservada]="mesa().estado === 'RESERVADA'"
        (click)="mesaClick.emit(mesa())"
      >
        <div class="mesa__header">
          <span class="mesa__capacidad">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            {{ mesa().capacidad }}
          </span>
          <span class="mesa__numero">{{ mesa().numero }}</span>
        </div>

        @if (mesa().estado === 'OCUPADA') {
          <div class="mesa__info">
            <span class="mesa__comensales">{{ mesa().comensales }} comensales</span>
            @if (mesa().minutosOcupada) {
              <span class="mesa__tiempo">{{ mesa().minutosOcupada }} min</span>
            }
            @if (mesa().montoActual) {
              <span class="mesa__monto">{{ mesa().montoActual | number:'1.0-0' }}</span>
            }
          </div>
        }

        @if (mesa().estado === 'RESERVADA') {
          <div class="mesa__info">
            <span class="mesa__reserva">Reservada</span>
          </div>
        }
      </button>

      @if (showTooltip() && mesa().estado === 'OCUPADA') {
        <div class="tooltip" [style.top.px]="tooltipY()" [style.left.px]="tooltipX()">
          <div class="tooltip__header">
            <span class="tooltip__mesa">Mesa {{ mesa().numero }}</span>
            <span class="tooltip__tiempo">{{ mesa().minutosOcupada }}'</span>
          </div>
          <div class="tooltip__divider"></div>
          <div class="tooltip__row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="tooltip__label">{{ cliente }}</span>
          </div>
          <div class="tooltip__row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span class="tooltip__label">Mozo: {{ mozo }}</span>
          </div>
          <div class="tooltip__divider"></div>
          <div class="tooltip__platos">
            @for (plato of platos; track plato.nombre) {
              <div class="tooltip__plato">
                <span class="tooltip__plato-qty">{{ plato.cantidad }}x</span>
                <span class="tooltip__plato-name">{{ plato.nombre }}</span>
              </div>
            }
          </div>
          <div class="tooltip__divider"></div>
          <div class="tooltip__total">
            <span>Total</span>
            <span>\${{ mesa().montoActual | number:'1.0-0' }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .mesa-wrap {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .mesa {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      border: 2px solid;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      padding: 10px;
      font-family: inherit;
      transition: transform 0.12s, box-shadow 0.12s;
      min-width: 0;
      min-height: 80px;
      overflow: hidden;
    }
    .mesa:hover {
      transform: scale(1.03);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .mesa:active { transform: scale(0.98); }
    .mesa--disponible { background: #D1FAE5; border-color: #34D399; color: #065F46; }
    .mesa--ocupada { background: #FEE2E2; border-color: #F87171; color: #991B1B; }
    .mesa--reservada { background: #FEF3C7; border-color: #FBBF24; color: #92400E; }
    .mesa__header { display: flex; align-items: flex-start; justify-content: space-between; }
    .mesa__capacidad { display: flex; align-items: center; gap: 2px; font-size: 10px; font-weight: 500; opacity: 0.7; }
    .mesa__numero { font-size: 22px; font-weight: 800; line-height: 1; }
    .mesa__info { display: flex; flex-direction: column; gap: 1px; margin-top: auto; max-width: 100%; }
    .mesa__comensales { font-size: 9px; font-weight: 500; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mesa__tiempo { font-size: 9px; font-weight: 700; }
    .mesa__monto { font-size: 10px; font-weight: 700; }
    .mesa__reserva { font-size: 9px; font-weight: 600; }

    /* Tooltip */
    .tooltip {
      position: fixed;
      transform: translateY(-100%);
      background: #01033E;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 12px;
      min-width: 200px;
      z-index: 1000;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: fadeIn 0.12s ease-out;
      pointer-events: none;
    }
    .tooltip__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .tooltip__mesa { font-size: 13px; font-weight: 700; color: #fff; }
    .tooltip__tiempo { font-size: 11px; font-weight: 600; color: #F27920; }
    .tooltip__divider { height: 1px; background: rgba(255,255,255,0.08); margin: 6px 0; }
    .tooltip__row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 0;
    }
    .tooltip__label { font-size: 11px; color: rgba(255,255,255,0.6); }
    .tooltip__platos { display: flex; flex-direction: column; gap: 3px; }
    .tooltip__plato { display: flex; gap: 6px; }
    .tooltip__plato-qty { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); min-width: 20px; }
    .tooltip__plato-name { font-size: 11px; color: rgba(255,255,255,0.75); }
    .tooltip__total {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `],
})
export class MesaCardComponent {
  mesa = input.required<Mesa>();
  mesaClick = output<Mesa>();
  readonly showTooltip = signal(false);
  readonly tooltipX = signal(0);
  readonly tooltipY = signal(0);

  platos: PlatoMock[] = [];
  cliente = '';
  mozo = '';

  onHover(event: MouseEvent): void {
    if (this.mesa().estado !== 'OCUPADA') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltipX.set(rect.left + rect.width / 2 - 100);
    this.tooltipY.set(rect.top - 8);
    const idx = (this.mesa().numero - 1) % PLATOS_MOCK.length;
    this.platos = PLATOS_MOCK[idx];
    this.cliente = CLIENTES_MOCK[idx % CLIENTES_MOCK.length];
    this.mozo = this.mesa().mozo ?? MOZOS_MOCK[idx % MOZOS_MOCK.length];
    this.showTooltip.set(true);
  }
}
