import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { PlanoItem } from '../../models/salon.model';

/**
 * Renderiza un item decorativo del plano (planta, pared, barra, entrada, baño, caja).
 * Las mesas tipo='mesa' se renderizan con MesaCardComponent (tienen estado runtime).
 */
@Component({
  selector: 'app-plano-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (item().tipo) {
      @case ('planta') {
        <div class="planta">
          <div class="planta__hojas"></div>
          <div class="planta__pot"></div>
        </div>
      }
      @case ('pared') {
        @if (item().orientacion === 'curva') {
          <div class="pared pared--curva" [style.transform]="'rotate(' + (item().curvaRotacion ?? 0) + 'deg)'"></div>
        } @else {
          <div class="pared pared--line" [class.pared--vertical]="item().orientacion === 'vertical'"></div>
        }
      }
      @case ('barra') {
        <div class="barra">
          <span class="barra__icon">🍸</span>
          <div class="barra__surface"></div>
        </div>
      }
      @case ('entrada') {
        <div class="entrada">
          <svg viewBox="0 0 32 32" fill="none">
            <rect x="6" y="2" width="20" height="28" rx="2" stroke="rgba(255,255,255,0.6)" stroke-width="2" fill="rgba(255,255,255,0.08)" />
            <rect x="9" y="5" width="14" height="10" rx="1" stroke="rgba(255,255,255,0.4)" stroke-width="1" fill="none" />
            <rect x="9" y="17" width="14" height="10" rx="1" stroke="rgba(255,255,255,0.4)" stroke-width="1" fill="none" />
            <circle cx="22" cy="16" r="1.5" fill="rgba(255,255,255,0.5)" />
          </svg>
        </div>
      }
      @case ('bano') {
        <div class="bano">
          <svg viewBox="0 0 36 28" fill="none">
            <circle cx="10" cy="5.5" r="3" fill="#38BDF8" />
            <path d="M5 13h10l-1.5 10h-2l-.8-6h-.4l-.8 6h-2L5 13Z" fill="#38BDF8" />
            <line x1="18" y1="2" x2="18" y2="26" stroke="#7DD3FC" stroke-width="1" stroke-dasharray="2 2" />
            <circle cx="26" cy="5.5" r="3" fill="#38BDF8" />
            <rect x="22.5" y="12" width="7" height="6" rx="1" fill="#38BDF8" />
            <rect x="23" y="17.5" width="2.5" height="6" rx="1" fill="#38BDF8" />
            <rect x="26.5" y="17.5" width="2.5" height="6" rx="1" fill="#38BDF8" />
          </svg>
        </div>
      }
      @case ('caja') {
        <div class="caja">
          <div class="caja__screen"></div>
          <div class="caja__body"></div>
        </div>
      }
    }
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    /* === Planta === */
    .planta {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
      height: 100%;
    }
    .planta__hojas {
      width: 60%;
      height: 50%;
      background: radial-gradient(ellipse at center, #4ADE80 0%, #16A34A 60%, transparent 70%);
      border-radius: 50%;
      position: relative;
    }
    .planta__hojas::before,
    .planta__hojas::after {
      content: '';
      position: absolute;
      width: 80%;
      height: 80%;
      border-radius: 50%;
      background: radial-gradient(ellipse, #4ADE80 0%, #22C55E 70%, transparent 75%);
    }
    .planta__hojas::before { top: -25%; left: -15%; }
    .planta__hojas::after { top: -20%; right: -15%; }
    .planta__pot {
      width: 35%;
      height: 22%;
      background: #A1887F;
      border-radius: 0 0 4px 4px;
      position: relative;
    }
    .planta__pot::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -15%;
      width: 130%;
      height: 5px;
      background: #8D6E63;
      border-radius: 2px;
    }

    /* === Pared === */
    .pared--line {
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #78716C, #57534E, #78716C);
      border-radius: 3px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.35);
      position: relative;
    }
    .pared--line::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: rgba(255,255,255,0.15);
      border-radius: 3px 3px 0 0;
    }
    .pared--vertical {
      width: 6px;
      height: 100%;
      background: linear-gradient(180deg, #78716C, #57534E, #78716C);
    }
    .pared--vertical::before {
      bottom: 0; right: auto;
      width: 2px; height: 100%;
    }
    .pared--curva {
      width: 100%; height: 100%;
      position: relative;
    }
    .pared--curva::before {
      content: '';
      position: absolute;
      top: calc(50% - 3px); left: 50%;
      width: 50%; height: 6px;
      background: linear-gradient(90deg, #57534E, #78716C);
      border-radius: 0 3px 3px 0;
    }
    .pared--curva::after {
      content: '';
      position: absolute;
      top: 50%; left: calc(50% - 3px);
      width: 6px; height: 50%;
      background: linear-gradient(180deg, #57534E, #78716C);
      border-radius: 0 0 3px 3px;
    }

    /* === Barra === */
    .barra {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .barra__icon {
      font-size: 20px;
      margin-bottom: 3px;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.4));
    }
    .barra__surface {
      width: 88%;
      height: 28%;
      background: linear-gradient(180deg, #78716C 0%, #57534E 100%);
      border-radius: 3px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
    }
    .barra__surface::before {
      content: '';
      position: absolute;
      top: 1px; left: 3px; right: 3px;
      height: 1px;
      background: rgba(255,255,255,0.15);
      border-radius: 1px;
    }

    /* === Entrada === */
    .entrada {
      width: 100%; height: 100%;
      background: rgba(245, 158, 11, 0.08);
      border: 1px dashed rgba(245, 158, 11, 0.5);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }
    .entrada svg { width: 60%; height: 75%; }

    /* === Baño === */
    .bano {
      width: 100%; height: 100%;
      background: rgba(56, 189, 248, 0.14);
      border: 1px solid rgba(56, 189, 248, 0.45);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }
    .bano svg { width: 80%; height: 60%; }

    /* === Caja === */
    .caja {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      width: 100%; height: 100%;
    }
    .caja__screen {
      width: 58%;
      height: 24%;
      background: #86EFAC;
      border: 2px solid #57534E;
      border-radius: 3px;
    }
    .caja__body {
      width: 72%;
      height: 32%;
      background: linear-gradient(180deg, #78716C 0%, #57534E 100%);
      border-radius: 3px;
      position: relative;
    }
    .caja__body::before {
      content: '';
      position: absolute;
      bottom: 3px; left: 10%;
      width: 80%; height: 3px;
      background: rgba(255,255,255,0.15);
      border-radius: 1px;
    }
  `],
})
export class PlanoItemComponent {
  item = input.required<PlanoItem>();
}
