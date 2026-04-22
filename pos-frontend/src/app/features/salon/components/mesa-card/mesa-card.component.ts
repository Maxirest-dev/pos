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
        [class.mesa--circular]="mesa().forma === 'circular'"
        [class.mesa--pequeno]="mesa().tamano === 'pequeno'"
        (click)="mesaClick.emit(mesa())"
      >
        <div class="mesa__top">
          <span class="mesa__capacidad">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            {{ mesa().comensales ?? mesa().capacidad }}
          </span>
          @if (mesa().estado === 'OCUPADA' && mesa().minutosOcupada) {
            <span class="mesa__tiempo">{{ mesa().minutosOcupada }}'</span>
          }
        </div>

        <div class="mesa__center">
          <span class="mesa__numero">{{ mesa().numero }}</span>
          @if (mesa().estado === 'OCUPADA' && mesa().montoActual) {
            <span class="mesa__monto mesa__monto--inline">\${{ mesa().montoActual | number:'1.0-0' }}</span>
          } @else if (mesa().estado === 'RESERVADA') {
            <span class="mesa__reserva mesa__reserva--inline">Reservada</span>
          }
        </div>

        <div class="mesa__bot">
          @if (mesa().estado === 'OCUPADA' && mesa().montoActual) {
            <span class="mesa__monto">\${{ mesa().montoActual | number:'1.0-0' }}</span>
          } @else if (mesa().estado === 'RESERVADA') {
            <span class="mesa__reserva">Reservada</span>
          }
        </div>
      </button>

      @if (showTooltip() && mesa().estado === 'OCUPADA') {
        <div class="tooltip"
          [class.tooltip--below]="tooltipBelow()"
          [style.top.px]="tooltipY()" [style.left.px]="tooltipX()">
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
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mesa {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      border: 2px solid;
      cursor: pointer;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 8px 10px;
      font-family: inherit;
      transition: transform 0.12s, box-shadow 0.12s;
      min-width: 0;
      min-height: 60px;
      overflow: hidden;
    }
    .mesa--circular {
      border-radius: 50%;
      aspect-ratio: 1 / 1;
      padding: 8px 10px;
    }
    .mesa--pequeno {
      width: 72%;
      height: 72%;
    }
    .mesa--pequeno.mesa--circular {
      padding: 4px 6px;
    }
    .mesa:hover {
      transform: scale(1.03);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .mesa:active { transform: scale(0.98); }
    .mesa--disponible { background: #D1FAE5; border-color: #34D399; color: #065F46; }
    .mesa--ocupada { background: #FEE2E2; border-color: #F87171; color: #991B1B; }
    .mesa--reservada { background: #FEF3C7; border-color: #FBBF24; color: #92400E; }

    .mesa__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      min-height: 12px;
    }
    .mesa__capacidad {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      font-weight: 600;
      opacity: 0.75;
    }
    .mesa__tiempo {
      font-size: 10px;
      font-weight: 700;
      opacity: 0.85;
    }

    .mesa__center {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }
    .mesa__numero {
      font-size: 24px;
      font-weight: 800;
      line-height: 1;
    }

    .mesa__bot {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 12px;
    }
    .mesa__monto { font-size: 11px; font-weight: 700; }
    .mesa__reserva { font-size: 10px; font-weight: 600; opacity: 0.85; }

    /* En mesas pequenas achicamos tipografía */
    .mesa--pequeno .mesa__numero { font-size: 18px; }
    .mesa--pequeno .mesa__capacidad,
    .mesa--pequeno .mesa__tiempo,
    .mesa--pequeno .mesa__monto,
    .mesa--pequeno .mesa__reserva { font-size: 9px; }

    /* === Layout alternativo para mesas circulares ===
       Comensales centrados arriba, número + monto en stack vertical al centro,
       tiempo oculto, bot vacío. */
    .mesa__monto--inline,
    .mesa__reserva--inline { display: none; }

    .mesa--circular {
      padding: 6px 8px;
      grid-template-rows: auto 1fr;   /* sin fila bot en circular */
    }
    .mesa--circular.mesa--pequeno { padding: 4px 6px; }
    .mesa--circular .mesa__top { justify-content: center; min-height: 10px; }
    .mesa--circular .mesa__tiempo { display: none; }
    .mesa--circular .mesa__bot { display: none; }
    .mesa--circular .mesa__center {
      flex-direction: column;
      gap: 0;
      line-height: 1;
    }
    .mesa--circular .mesa__monto--inline,
    .mesa--circular .mesa__reserva--inline {
      display: block;
      font-size: 10px;
      font-weight: 700;
      line-height: 1.1;
      margin-top: 2px;
      white-space: nowrap;
    }
    .mesa--circular .mesa__numero { font-size: 20px; line-height: 1; }
    .mesa--circular.mesa--pequeno .mesa__numero { font-size: 15px; }
    .mesa--circular.mesa--pequeno .mesa__monto--inline,
    .mesa--circular.mesa--pequeno .mesa__reserva--inline { font-size: 8px; }

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
    .tooltip--below { transform: none; }
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
  readonly tooltipBelow = signal(false);

  platos: PlatoMock[] = [];
  cliente = '';
  mozo = '';

  onHover(event: MouseEvent): void {
    if (this.mesa().estado !== 'OCUPADA') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const estimatedHeight = 260;     // alto aproximado del tooltip
    const spaceAbove = rect.top;
    const flipBelow = spaceAbove < estimatedHeight + 16;

    this.tooltipX.set(rect.left + rect.width / 2 - 100);
    this.tooltipY.set(flipBelow ? rect.bottom + 8 : rect.top - 8);
    this.tooltipBelow.set(flipBelow);

    const idx = (this.mesa().numero - 1) % PLATOS_MOCK.length;
    this.platos = PLATOS_MOCK[idx];
    this.cliente = CLIENTES_MOCK[idx % CLIENTES_MOCK.length];
    this.mozo = this.mesa().mozo ?? MOZOS_MOCK[idx % MOZOS_MOCK.length];
    this.showTooltip.set(true);
  }
}
