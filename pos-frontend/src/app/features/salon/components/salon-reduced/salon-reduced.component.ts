import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Salon, Mesa } from '../../models/salon.model';

/**
 * Representa el canal "Salón" en formato reducido para el panel lateral
 * (cuando otro canal está ocupando el escenario principal).
 * Al expandir, muestra las mesas del salón activo como mini-cards cuadradas.
 */
@Component({
  selector: 'app-salon-reduced',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="channel" [class.channel--expanded]="expanded()" draggable="true"
         (dragstart)="dragStart.emit($event)" (dragend)="dragEnd.emit()">
      <!-- Header -->
      <button class="channel__header" (click)="toggle()">
        <div class="channel__left">
          <div class="channel__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F27920" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="channel__info">
            <span class="channel__label">Salón</span>
            <div class="channel__meta">
              <span class="channel__count">{{ totalMesas() }} mesas</span>
              <span class="channel__ocupadas">{{ ocupadasCount() }} ocupadas</span>
            </div>
          </div>
        </div>
        <div class="channel__right">
          <svg class="channel__chevron" [class.channel__chevron--open]="expanded()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      @if (expanded()) {
        <div class="channel__body">
          <!-- Tabs compactas de salones -->
          <div class="salon-tabs">
            @for (salon of salones(); track salon.id) {
              <button
                class="salon-tab"
                [class.salon-tab--active]="activeSalonId() === salon.id"
                (click)="activeSalonId.set(salon.id)"
              >{{ salon.nombre }}</button>
            }
          </div>

          <!-- Mini-cards grid -->
          <div class="mesas-grid">
            @for (mesa of visibleMesas(); track mesa.id) {
              <button
                class="mini"
                [class.mini--disponible]="mesa.estado === 'DISPONIBLE'"
                [class.mini--ocupada]="mesa.estado === 'OCUPADA'"
                [class.mini--reservada]="mesa.estado === 'RESERVADA'"
                [title]="tooltipFor(mesa)"
                (click)="mesaClick.emit(mesa)"
              >
                @if (mesa.estado === 'OCUPADA' && mesa.minutosOcupada) {
                  <span class="mini__time">{{ mesa.minutosOcupada }}'</span>
                }
                <span class="mini__num">{{ mesa.numero }}</span>
              </button>
            }
            @if (visibleMesas().length === 0) {
              <div class="mesas-empty">Sin mesas en este salón</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .channel {
      background: #fff;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #E5E7EB;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    }
    .channel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 14px 16px;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.12s;
    }
    .channel__header:hover { background: #FAFAFA; }
    .channel__left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .channel__icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: #FFF7ED;
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
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .channel__meta {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .channel__count {
      font-size: 11px;
      color: #6B7280;
    }
    .channel__ocupadas {
      font-size: 11px;
      font-weight: 600;
      color: #F87171;
    }
    .channel__right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .channel__total {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .channel__chevron {
      color: #9CA3AF;
      transition: transform 0.2s;
    }
    .channel__chevron--open { transform: rotate(180deg); }

    .channel__body {
      padding: 0 12px 12px;
      border-top: 1px solid #F1F5F9;
    }

    /* Tabs compactas */
    .salon-tabs {
      display: flex;
      gap: 4px;
      padding: 10px 0;
      flex-wrap: wrap;
    }
    .salon-tab {
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid #E5E7EB;
      background: #fff;
      font-size: 10px;
      font-weight: 600;
      color: #6B7280;
      letter-spacing: 0.3px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.12s;
    }
    .salon-tab:hover { border-color: #CBD5E1; color: #374151; }
    .salon-tab--active {
      background: #01033E;
      border-color: #01033E;
      color: #fff;
    }

    /* Mini-cards grid */
    .mesas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
      gap: 4px;
    }
    .mini {
      position: relative;
      aspect-ratio: 1 / 1;
      border-radius: 6px;
      border: 1px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1px;
      cursor: pointer;
      font-family: inherit;
      transition: transform 0.12s, box-shadow 0.12s;
      overflow: hidden;
    }
    .mini:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      z-index: 2;
    }
    .mini--disponible { background: #D1FAE5; border-color: #34D399; color: #065F46; }
    .mini--ocupada { background: #FEE2E2; border-color: #F87171; color: #991B1B; }
    .mini--reservada { background: #FEF3C7; border-color: #FBBF24; color: #92400E; }
    .mini__time {
      position: absolute;
      top: 1px;
      left: 2px;
      font-size: 7px;
      font-weight: 700;
      opacity: 0.75;
      line-height: 1;
    }
    .mini__num {
      font-size: 13px;
      font-weight: 800;
      line-height: 1;
    }

    .mesas-empty {
      grid-column: 1 / -1;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
    }
  `],
})
export class SalonReducedComponent {
  salones = input.required<Salon[]>();
  initialSalonId = input<string>('sal-2');

  mesaClick = output<Mesa>();
  dragStart = output<DragEvent>();
  dragEnd = output<void>();

  readonly expanded = signal(false);
  readonly activeSalonId = signal<string>('sal-2');

  constructor() {
    // Sincroniza con el salón activo que llegue por input (sin usar effect para mantener simple)
    queueMicrotask(() => this.activeSalonId.set(this.initialSalonId()));
  }

  readonly activeSalon = computed(() =>
    this.salones().find(s => s.id === this.activeSalonId()) ?? this.salones()[0]
  );

  readonly visibleMesas = computed(() => this.activeSalon()?.mesas ?? []);

  readonly totalMesas = computed(() =>
    this.salones().reduce((acc, s) => acc + s.mesas.length, 0)
  );

  readonly ocupadasCount = computed(() =>
    this.salones().reduce((acc, s) => acc + s.mesas.filter(m => m.estado === 'OCUPADA').length, 0)
  );

  readonly totalFacturado = computed(() =>
    this.salones().reduce((acc, s) => acc + s.mesas.reduce((a, m) => a + (m.montoActual ?? 0), 0), 0)
  );

  toggle(): void { this.expanded.update(v => !v); }

  tooltipFor(mesa: Mesa): string {
    const parts: string[] = [`Mesa ${mesa.numero}`];
    if (mesa.estado === 'OCUPADA') {
      if (mesa.mozo) parts.push(mesa.mozo);
      if (mesa.minutosOcupada) parts.push(`${mesa.minutosOcupada} min`);
      if (mesa.montoActual) parts.push(`$${mesa.montoActual}`);
    } else if (mesa.estado === 'RESERVADA') {
      parts.push('Reservada');
    } else {
      parts.push('Disponible');
    }
    return parts.join(' · ');
  }
}
