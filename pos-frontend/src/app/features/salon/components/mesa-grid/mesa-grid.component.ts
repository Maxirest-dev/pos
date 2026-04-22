import { Component, input, signal, computed, output, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { Salon, Mesa, PlanoItem } from '../../models/salon.model';
import { MesaCardComponent } from '../mesa-card/mesa-card.component';
import { PlanoItemComponent } from '../plano-item/plano-item.component';
import { SessionPlanoService } from '../../services/session-plano.service';

interface GridEntry {
  id: string;
  kind: 'mesa' | 'decor';
  mesa?: Mesa;
  item?: PlanoItem;
  row: number;       // 0-based (con override aplicado)
  col: number;       // 0-based
  rowSpan: number;
  colSpan: number;
}

@Component({
  selector: 'app-mesa-grid',
  standalone: true,
  imports: [MesaCardComponent, PlanoItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mesa-grid">
      <!-- Top bar: tabs + status card -->
      <div class="mesa-grid__topbar">
        <div class="mesa-grid__tabs-wrap">
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
          <button
            class="edit-pencil"
            [class.edit-pencil--on]="editMode()"
            (click)="toggleEditMode()"
            [title]="editMode() ? 'Salir del modo edición' : 'Reordenar plano del salón actual'"
            aria-label="Editar plano"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
        </div>

        @if (editMode()) {
          <div class="edit-banner">
            <span class="edit-banner__dot"></span>
            <span class="edit-banner__text">Modo edición — arrastrá para mover, clic en <b>👁</b> para ocultar</span>
            @if (plano.hasChanges()) {
              <button class="edit-banner__btn edit-banner__btn--ghost" (click)="onResetOverrides()">Restaurar</button>
            }
            <button class="edit-banner__btn" (click)="exitEditMode()">Listo</button>
          </div>
        } @else {
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span class="status-label">Prom.</span>
                <span class="status-count">{{ tiempoPromedio() }}'</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Floor grid -->
      <div class="mesa-grid__floor"
        [class]="'mesa-grid__floor piso--' + (activeSalon().piso ?? 'ninguno')"
        [class.mesa-grid__floor--edit]="editMode()"
        [style.grid-template-columns]="'repeat(' + activeSalon().columnas + ', 1fr)'"
        [style.grid-template-rows]="'repeat(' + activeSalon().filas + ', 1fr)'"
      >
        <!-- Drop targets (solo en editMode) -->
        @if (editMode()) {
          @for (cell of dropCells(); track cell.key) {
            <div class="drop-cell"
              [class.drop-cell--target]="isDragTarget(cell.row, cell.col)"
              [style.grid-row]="(cell.row + 1).toString()"
              [style.grid-column]="(cell.col + 1).toString()"
              (dragover)="onDragOver($event, cell.row, cell.col)"
              (dragleave)="dragOverCell.set(null)"
              (drop)="onDrop($event, cell.row, cell.col)"
            ></div>
          }
        }

        <!-- Items (mesas + decorativos), unificados -->
        @for (entry of entries(); track entry.id) {
          <div class="entry"
            [class.entry--edit]="editMode()"
            [class.entry--dragging]="draggingId() === entry.id"
            [class.entry--hidden]="plano.isHidden(entry.id)"
            [style.grid-row]="(entry.row + 1) + ' / span ' + entry.rowSpan"
            [style.grid-column]="(entry.col + 1) + ' / span ' + entry.colSpan"
            [attr.draggable]="editMode() ? 'true' : null"
            (dragstart)="onDragStart($event, entry)"
            (dragend)="onDragEnd()"
          >
            @if (entry.kind === 'mesa') {
              <app-mesa-card [mesa]="entry.mesa!" (mesaClick)="onMesaClick($event)" />
            } @else {
              <app-plano-item [item]="entry.item!" />
            }

            @if (editMode()) {
              <button class="hide-btn"
                [class.hide-btn--restore]="plano.isHidden(entry.id)"
                (click)="onToggleHidden(entry.id); $event.stopPropagation()"
                (mousedown)="$event.stopPropagation()"
                draggable="false"
                [title]="plano.isHidden(entry.id) ? 'Restaurar' : 'Ocultar'"
              >
                @if (plano.isHidden(entry.id)) {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                } @else {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                }
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .mesa-grid {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      padding: 16px 24px 10px 14px;
      overflow: hidden;
    }
    /* Top bar */
    .mesa-grid__topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 8px;
    }
    .mesa-grid__tabs-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mesa-grid__tabs {
      display: flex;
      gap: 2px;
      background: #01033E;
      border-radius: 10px;
      padding: 3px;
      width: fit-content;
      box-shadow: 0 2px 8px rgba(1, 3, 62, 0.22);
    }
    .tab {
      padding: 7px 20px;
      border-radius: 8px;
      border: none;
      background: none;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.55);
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, color 0.15s;
      letter-spacing: 0.3px;
    }
    .tab--active { background: #F27920; color: #fff; }
    .tab:hover:not(.tab--active) { color: #fff; background: rgba(255, 255, 255, 0.08); }

    .edit-pencil {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #01033E;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(1, 3, 62, 0.22);
      transition: background 0.15s, color 0.15s, transform 0.1s;
    }
    .edit-pencil:hover { color: #fff; background: #0A0E4A; }
    .edit-pencil:active { transform: scale(0.95); }
    .edit-pencil--on {
      background: #F27920;
      color: #fff;
      box-shadow: 0 2px 8px rgba(242, 121, 32, 0.45), 0 0 0 3px rgba(242, 121, 32, 0.2);
    }
    .edit-pencil--on:hover { background: #E06D15; color: #fff; }

    /* Edit banner */
    .edit-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 14px;
      background: rgba(242, 121, 32, 0.14);
      border: 1px solid rgba(242, 121, 32, 0.45);
      border-radius: 10px;
      color: #fff;
    }
    .edit-banner__dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #F27920;
      box-shadow: 0 0 0 4px rgba(242, 121, 32, 0.25);
      animation: pulse 1.6s ease-in-out infinite;
    }
    .edit-banner__text {
      font-size: 12px;
      color: rgba(255,255,255,0.85);
    }
    .edit-banner__text b { color: #fff; }
    .edit-banner__btn {
      padding: 6px 14px;
      border: none;
      border-radius: 8px;
      background: #F27920;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }
    .edit-banner__btn:hover { background: #E06D15; }
    .edit-banner__btn--ghost {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.9);
    }
    .edit-banner__btn--ghost:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(242, 121, 32, 0.25); }
      50% { box-shadow: 0 0 0 8px rgba(242, 121, 32, 0.08); }
    }

    /* Status card */
    .mesa-grid__status-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(180deg, #0A0E4A 0%, #01033E 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 8px 16px;
      box-shadow: 0 2px 8px rgba(1, 3, 62, 0.22);
    }
    .status-item { display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 10px; height: 10px; border-radius: 3px; }
    .status-dot--disponible { background: #34D399; }
    .status-dot--ocupada { background: #F87171; }
    .status-dot--reservada { background: #FBBF24; }
    .status-label { font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.6); }
    .status-count { font-size: 12px; font-weight: 700; color: #fff; }
    .status-divider { width: 1px; height: 16px; background: rgba(255, 255, 255, 0.15); }

    /* Floor grid */
    .mesa-grid__floor {
      display: grid;
      gap: 12px;
      flex: 1;
      padding: 14px 16px 16px 16px;
      overflow: hidden;
      border-radius: 14px;
      min-height: 200px;
      position: relative;
    }
    .mesa-grid__floor--edit {
      box-shadow: 0 0 0 2px rgba(242, 121, 32, 0.35) inset;
    }

    /* Drop cells (edit only) */
    .drop-cell {
      border: 1px dashed rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      min-width: 0;
      min-height: 0;
      transition: background 0.1s, border-color 0.1s;
    }
    .drop-cell--target {
      background: rgba(242, 121, 32, 0.22);
      border: 2px dashed rgba(242, 121, 32, 0.8);
    }

    /* Entry wrapper (common to mesa + decor) */
    .entry {
      position: relative;
      display: flex;
      min-height: 0;
      min-width: 0;
      overflow: visible;
    }
    .entry > app-mesa-card,
    .entry > app-plano-item {
      flex: 1;
      min-width: 0;
      min-height: 0;
      display: flex;
    }
    .entry--edit { cursor: grab; }
    .entry--edit:active { cursor: grabbing; }
    .entry--edit > app-mesa-card,
    .entry--edit > app-plano-item {
      pointer-events: none;
    }
    .entry--dragging { opacity: 0.4; }
    .entry--hidden { opacity: 0.25; filter: grayscale(0.6); }
    .entry--hidden:not(.entry--edit) { display: none; }

    /* Hide / restore button */
    .hide-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid #01033E;
      background: #2A2A3D;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-family: inherit;
      z-index: 3;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      transition: background 0.15s, transform 0.1s;
    }
    .hide-btn:hover { background: #F27920; transform: scale(1.1); }
    .hide-btn--restore { background: #10B981; }
    .hide-btn--restore:hover { background: #059669; }

    /* Pisos */
    .piso--ninguno { background: transparent; }
    .piso--madera {
      background:
        linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
        repeating-linear-gradient(
          90deg,
          #8B5E3C 0px, #6F4A2E 4px, #7A5233 7px, #8B5E3C 10px,
          #795237 14px, #6F4A2E 18px, #8B5E3C 20px
        );
    }
    .piso--piedra {
      background-color: #5A5855;
      background-image:
        linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)),
        radial-gradient(ellipse at 25% 40%, rgba(0,0,0,0.1) 0%, transparent 70%),
        radial-gradient(ellipse at 75% 60%, rgba(0,0,0,0.08) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.06) 0%, transparent 50%);
    }
    .piso--porcelanato {
      background-color: #3A3A4D;
      background-image:
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 50px 50px, 50px 50px;
    }

    @media (max-width: 768px) {
      .mesa-grid { padding: 10px; }
      .mesa-grid__floor { gap: 8px; padding: 10px; }
    }
  `],
})
export class MesaGridComponent {
  readonly plano = inject(SessionPlanoService);

  salones = input.required<Salon[]>();
  mesaClick = output<Mesa>();

  readonly activeSalonId = signal('sal-2');
  readonly editMode = signal(false);
  readonly draggingId = signal<string | null>(null);
  readonly dragOverCell = signal<{ row: number; col: number } | null>(null);

  constructor() {
    // Al cambiar de salón, salimos del modo edición
    effect(() => {
      this.activeSalonId();
      this.editMode.set(false);
    }, { allowSignalWrites: true });
  }

  readonly activeSalon = computed(() =>
    this.salones().find(s => s.id === this.activeSalonId()) ?? this.salones()[0]
  );

  /** Entries unificados (mesas + decorativos), en coords 0-based con overrides de sesión aplicados. */
  readonly entries = computed<GridEntry[]>(() => {
    const salon = this.activeSalon();
    if (!salon) return [];
    // tocar moves para reactividad
    this.plano.moves();
    this.plano.hidden();

    const result: GridEntry[] = [];
    for (const mesa of salon.mesas) {
      const override = this.plano.getPosition(mesa.id);
      result.push({
        id: mesa.id,
        kind: 'mesa',
        mesa,
        row: override?.row ?? (mesa.gridRow - 1),
        col: override?.col ?? (mesa.gridCol - 1),
        rowSpan: mesa.rowSpan ?? 1,
        colSpan: mesa.colSpan ?? 1,
      });
    }
    for (const item of salon.items ?? []) {
      if (item.tipo === 'mesa') continue; // mesas van por Salon.mesas
      const override = this.plano.getPosition(item.id);
      result.push({
        id: item.id,
        kind: 'decor',
        item,
        row: override?.row ?? item.row,
        col: override?.col ?? item.col,
        rowSpan: item.rowSpan,
        colSpan: item.colSpan,
      });
    }
    return result;
  });

  readonly dropCells = computed(() => {
    const salon = this.activeSalon();
    if (!salon) return [];
    const cells: { row: number; col: number; key: string }[] = [];
    for (let r = 0; r < salon.filas; r++) {
      for (let c = 0; c < salon.columnas; c++) {
        cells.push({ row: r, col: c, key: `${r}-${c}` });
      }
    }
    return cells;
  });

  readonly contadores = computed(() => {
    const mesas = this.activeSalon()?.mesas ?? [];
    const visible = mesas.filter(m => !this.plano.isHidden(m.id));
    return {
      disponible: visible.filter(m => m.estado === 'DISPONIBLE').length,
      ocupada: visible.filter(m => m.estado === 'OCUPADA').length,
      reservada: visible.filter(m => m.estado === 'RESERVADA').length,
    };
  });

  readonly tiempoPromedio = computed(() => {
    const ocupadas = (this.activeSalon()?.mesas ?? []).filter(m =>
      m.estado === 'OCUPADA' && m.minutosOcupada && !this.plano.isHidden(m.id)
    );
    if (ocupadas.length === 0) return 0;
    return Math.round(ocupadas.reduce((sum, m) => sum + (m.minutosOcupada ?? 0), 0) / ocupadas.length);
  });

  selectSalon(id: string): void {
    this.activeSalonId.set(id);
  }

  toggleEditMode(): void {
    this.editMode.update(v => !v);
  }

  exitEditMode(): void {
    this.editMode.set(false);
    this.draggingId.set(null);
    this.dragOverCell.set(null);
  }

  onResetOverrides(): void {
    this.plano.resetSalon();
  }

  onMesaClick(mesa: Mesa): void {
    if (this.editMode()) return;
    this.mesaClick.emit(mesa);
  }

  onToggleHidden(id: string): void {
    this.plano.toggleHidden(id);
  }

  // === Drag & drop ===
  onDragStart(event: DragEvent, entry: GridEntry): void {
    if (!this.editMode()) { event.preventDefault(); return; }
    this.draggingId.set(entry.id);
    event.dataTransfer?.setData('text/plain', entry.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragEnd(): void {
    this.draggingId.set(null);
    this.dragOverCell.set(null);
  }

  onDragOver(event: DragEvent, row: number, col: number): void {
    if (!this.draggingId()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    const current = this.dragOverCell();
    if (!current || current.row !== row || current.col !== col) {
      this.dragOverCell.set({ row, col });
    }
  }

  isDragTarget(cellRow: number, cellCol: number): boolean {
    const over = this.dragOverCell();
    const dragId = this.draggingId();
    if (!over || !dragId) return false;
    const entry = this.entries().find(e => e.id === dragId);
    if (!entry) return false;
    return cellRow >= over.row && cellRow < over.row + entry.rowSpan &&
           cellCol >= over.col && cellCol < over.col + entry.colSpan;
  }

  onDrop(event: DragEvent, row: number, col: number): void {
    event.preventDefault();
    const dragId = this.draggingId();
    if (!dragId) return;
    const salon = this.activeSalon();
    if (!salon) return;

    const list = this.entries();
    const dragged = list.find(e => e.id === dragId);
    if (!dragged) { this.onDragEnd(); return; }

    // Out of bounds
    if (row + dragged.rowSpan > salon.filas || col + dragged.colSpan > salon.columnas) {
      this.onDragEnd();
      return;
    }

    // ¿Hay otro item ocupando la celda target?
    const target = list.find(e =>
      e.id !== dragId &&
      row < e.row + e.rowSpan && row + dragged.rowSpan > e.row &&
      col < e.col + e.colSpan && col + dragged.colSpan > e.col
    );

    if (target) {
      // Swap solo si mismo tamaño (y no se salen del grid tras swap)
      if (target.rowSpan === dragged.rowSpan && target.colSpan === dragged.colSpan) {
        this.plano.swap(
          dragged.id, { row: dragged.row, col: dragged.col },
          target.id,  { row: target.row,  col: target.col  },
        );
        // Ajuste: si el drop fue dentro del span del target pero no exactamente en su origin,
        // el dragged queda en target.row/col y el target en dragged.row/col (swap exacto).
      }
      // tamaños distintos → no-op (feedback visual ya es que nada cambia)
    } else {
      this.plano.setPosition(dragged.id, row, col);
    }

    this.onDragEnd();
  }
}
