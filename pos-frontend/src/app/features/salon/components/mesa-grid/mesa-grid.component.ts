import { Component, input, signal, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Salon, Mesa, MesaEstado } from '../../models/salon.model';
import { MesaCardComponent } from '../mesa-card/mesa-card.component';

@Component({
  selector: 'app-mesa-grid',
  standalone: true,
  imports: [MesaCardComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mesa-grid">
      <!-- Top bar: tabs + status card -->
      <div class="mesa-grid__topbar">
        <div class="mesa-grid__tabs">
          @for (salon of salones(); track salon.id) {
            <button
              class="tab"
              [class.tab--active]="activeSalonId() === salon.id"
              (click)="selectSalon(salon.id)"
            >
              {{ salon.nombre }}
            </button>
          }
        </div>

        <div class="mesa-grid__status-card">
          <div class="status-item">
            <span class="status-dot status-dot--disponible"></span>
            <span class="status-label">Disponible</span>
            <span class="status-count">{{ contadores().disponible }}</span>
          </div>
          <div class="status-divider"></div>
          <div class="status-item">
            <span class="status-dot status-dot--ocupada"></span>
            <span class="status-label">Ocupada</span>
            <span class="status-count">{{ contadores().ocupada }}</span>
          </div>
          <div class="status-divider"></div>
          <div class="status-item">
            <span class="status-dot status-dot--reservada"></span>
            <span class="status-label">Reservada</span>
            <span class="status-count">{{ contadores().reservada }}</span>
          </div>
          @if (tiempoPromedio() > 0) {
            <div class="status-divider"></div>
            <div class="status-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="status-label">Prom.</span>
              <span class="status-count">{{ tiempoPromedio() }}'</span>
            </div>
          }
        </div>
      </div>

      <!-- Floor grid -->
      <div class="mesa-grid__floor"
        [style.grid-template-columns]="'repeat(' + activeSalon()?.columnas + ', 1fr)'"
        [style.grid-template-rows]="'repeat(' + activeSalon()?.filas + ', 1fr)'"
      >
        @for (cell of gridCells(); track cell.key) {
          <div
            class="mesa-grid__cell"
            [style.grid-row]="cell.row"
            [style.grid-column]="cell.col"
          >
            @if (cell.mesa) {
              <app-mesa-card [mesa]="cell.mesa" (mesaClick)="mesaClick.emit($event)" />
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .mesa-grid {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      padding: 16px 24px 10px 14px;
    }
    /* Top bar */
    .mesa-grid__topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 8px;
    }
    .mesa-grid__tabs {
      display: flex;
      gap: 2px;
      background: #fff;
      border-radius: 10px;
      padding: 3px;
      width: fit-content;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .tab {
      padding: 7px 20px;
      border-radius: 8px;
      border: none;
      background: none;
      font-size: 12px;
      font-weight: 600;
      color: #9CA3AF;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, color 0.15s;
      letter-spacing: 0.3px;
    }
    .tab--active {
      background: #F3F4F6;
      color: #1a1a1a;
    }
    .tab:hover:not(.tab--active) {
      color: #374151;
    }

    /* Status card */
    .mesa-grid__status-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(6px);
      border-radius: 10px;
      padding: 8px 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
    .status-dot--disponible { background: #34D399; }
    .status-dot--ocupada { background: #F87171; }
    .status-dot--reservada { background: #FBBF24; }
    .status-label {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,0.55);
    }
    .status-count {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
    }
    .status-divider {
      width: 1px;
      height: 16px;
      background: rgba(255,255,255,0.12);
    }

    /* Floor grid */
    .mesa-grid__floor {
      display: grid;
      gap: 12px;
      flex: 1;
      padding: 14px 16px 16px 16px;
      overflow: hidden;
      background: transparent;
      min-height: 200px;
    }
    .mesa-grid__cell {
      display: flex;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .mesa-grid { padding: 10px; }
      .mesa-grid__floor { gap: 8px; padding: 10px; }
    }
  `],
})
export class MesaGridComponent {
  salones = input.required<Salon[]>();
  mesaClick = output<Mesa>();

  readonly activeSalonId = signal('sal-2');

  readonly activeSalon = computed(() =>
    this.salones().find(s => s.id === this.activeSalonId()) ?? this.salones()[0]
  );

  readonly gridCells = computed(() => {
    const salon = this.activeSalon();
    if (!salon) return [];
    const mesaMap = new Map(salon.mesas.map(m => [`${m.gridRow}-${m.gridCol}`, m]));
    const cells: { key: string; row: number; col: number; mesa: Mesa | null }[] = [];
    for (let r = 1; r <= salon.filas; r++) {
      for (let c = 1; c <= salon.columnas; c++) {
        const key = `${r}-${c}`;
        cells.push({ key, row: r, col: c, mesa: mesaMap.get(key) ?? null });
      }
    }
    return cells;
  });

  readonly contadores = computed(() => {
    const mesas = this.activeSalon()?.mesas ?? [];
    return {
      disponible: mesas.filter(m => m.estado === 'DISPONIBLE').length,
      ocupada: mesas.filter(m => m.estado === 'OCUPADA').length,
      reservada: mesas.filter(m => m.estado === 'RESERVADA').length,
    };
  });

  readonly tiempoPromedio = computed(() => {
    const ocupadas = (this.activeSalon()?.mesas ?? []).filter(m => m.estado === 'OCUPADA' && m.minutosOcupada);
    if (ocupadas.length === 0) return 0;
    return Math.round(ocupadas.reduce((sum, m) => sum + (m.minutosOcupada ?? 0), 0) / ocupadas.length);
  });

  selectSalon(id: string): void {
    this.activeSalonId.set(id);
  }
}
