import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ItemPedido } from '../../models/mesa-pedido.model';

interface Ingrediente {
  nombre: string;
  removido: boolean;
}

interface Extra {
  nombre: string;
  precio: number;
  agregado: boolean;
}

@Component({
  selector: 'app-item-dialog',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cerrar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <!-- Close -->
        <button class="dialog__close" (click)="cerrar.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Top section -->
        <div class="dialog__top">
          <!-- Image -->
          <div class="dialog__image">
            <span class="dialog__emoji">{{ getEmoji() }}</span>
          </div>

          <!-- Info -->
          <div class="dialog__info">
            <!-- Row 1: Nombre -->
            <h3 class="dialog__nombre">{{ item().nombre }}</h3>

            <!-- Row 2: Cantidad + Precio + CTAs -->
            <div class="dialog__row-controls">
              <div class="dialog__cantidad">
                <button class="qty-btn" (click)="decrementQty()">−</button>
                <span class="qty-value">{{ cantidad() }}</span>
                <button class="qty-btn" (click)="incrementQty()">+</button>
              </div>
              <div class="dialog__precio">
                <span class="dialog__precio-sign">$</span>
                <input
                  class="dialog__precio-input"
                  type="text"
                  [value]="precio() | number:'1.0-0'"
                  (change)="onPrecioChange($event)"
                />
              </div>
              <div class="dialog__actions">
                <button class="dialog__action-btn" title="Descuento">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                </button>
                <button class="dialog__action-btn" title="Transferir">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 3 21 3 21 9"/><line x1="21" y1="3" x2="14" y2="10"/><polyline points="9 21 3 21 3 15"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                </button>
                <button class="dialog__action-btn dialog__action-btn--danger" title="Eliminar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
                <button class="dialog__action-btn" title="Invitar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Tags -->
            <div class="dialog__tags">
              @if (item().enviado) {
                <span class="dialog__tag dialog__tag--green">Marchado</span>
              }
            </div>

            <!-- Observaciones -->
            <input
              class="dialog__obs"
              type="text"
              placeholder="Agregar nota manual"
              [value]="observacion()"
              (input)="observacion.set(asValue($event))"
            />
          </div>
        </div>

        <!-- Bottom section: cards -->
        <div class="dialog__bottom">
          <!-- Sacar ingredientes card -->
          <div class="dialog__card">
            <h4 class="dialog__card-title">SACAR INGREDIENTES</h4>
            <div class="dialog__chips">
              @for (ing of ingredientes(); track ing.nombre) {
                <button
                  class="chip"
                  [class.chip--removed]="ing.removido"
                  (click)="toggleIngrediente(ing.nombre)"
                >
                  {{ ing.nombre }}
                </button>
              }
            </div>
          </div>

          <!-- Agregar extras card -->
          <div class="dialog__card">
            <h4 class="dialog__card-title">AGREGAR EXTRAS</h4>
            <div class="dialog__extras">
              @for (extra of extras(); track extra.nombre; let i = $index) {
                <button
                  class="extra-row"
                  [class.extra-row--added]="extra.agregado"
                  (click)="toggleExtraByIndex(i)"
                >
                  <span class="extra-row__nombre">{{ extra.nombre }}</span>
                  <span class="extra-row__precio">\${{ extra.precio | number:'1.0-0' }}</span>
                </button>
              }
              <button class="extra-row extra-row--add">
                <span class="extra-row__nombre">Agregar extra manual</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      animation: fadeIn 0.12s ease-out;
    }
    .dialog {
      background: #fff;
      border-radius: 16px;
      width: 700px;
      max-width: 95vw;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.2s ease-out;
    }
    .dialog__close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      z-index: 1;
      transition: color 0.12s;
    }
    .dialog__close:hover { color: #374151; }

    /* Top */
    .dialog__top {
      display: flex;
      gap: 24px;
      padding: 24px 24px 20px;
    }
    .dialog__image {
      width: 200px;
      height: 200px;
      border-radius: 14px;
      background: linear-gradient(135deg, #3B2610, #5C3D1E);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .dialog__emoji { font-size: 80px; }
    .dialog__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }

    /* Row 1: nombre */
    .dialog__nombre {
      font-size: 20px;
      font-weight: 700;
      color: #F27920;
      margin: 0;
      line-height: 1.2;
    }

    /* Row 2: controls */
    .dialog__row-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .dialog__actions {
      display: flex;
      gap: 6px;
      margin-left: auto;
      flex-shrink: 0;
    }
    .dialog__action-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1.5px solid #E5E7EB;
      background: #fff;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color 0.12s, color 0.12s;
    }
    .dialog__action-btn:hover { border-color: #F27920; color: #F27920; }
    .dialog__action-btn--danger:hover { border-color: #EF4444; color: #EF4444; }

    /* Row 2: cantidad + precio */
    .dialog__row-qty-price {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .dialog__cantidad {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .qty-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1.5px solid #E5E7EB;
      background: #fff;
      color: #374151;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.12s;
    }
    .qty-btn:hover { border-color: #F27920; color: #F27920; }
    .qty-value {
      font-size: 18px;
      font-weight: 800;
      min-width: 24px;
      text-align: center;
      color: #1a1a1a;
    }
    .dialog__precio {
      display: flex;
      align-items: center;
      gap: 2px;
      border: 1.5px solid #E5E7EB;
      border-radius: 8px;
      padding: 6px 12px;
      transition: border-color 0.15s;
    }
    .dialog__precio:focus-within { border-color: #F27920; }
    .dialog__precio-sign { font-size: 16px; font-weight: 700; color: #1a1a1a; }
    .dialog__precio-input {
      border: none;
      outline: none;
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      width: 100px;
      font-family: inherit;
    }

    /* Tags */
    .dialog__tags { display: flex; gap: 6px; }
    .dialog__tag {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
    .dialog__tag--green { background: #ECFDF5; color: #059669; }

    /* Observaciones */
    .dialog__obs {
      width: 100%;
      padding: 8px 12px;
      border: 1.5px solid #E5E7EB;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      color: #374151;
      outline: none;
      transition: border-color 0.15s;
    }
    .dialog__obs:focus { border-color: #F27920; }
    .dialog__obs::placeholder { color: #9CA3AF; }

    /* Bottom: cards */
    .dialog__bottom {
      display: flex;
      gap: 16px;
      padding: 0 24px 24px;
    }
    .dialog__card {
      flex: 1;
      min-width: 0;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 14px;
    }
    .dialog__card-title {
      font-size: 10px;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 10px 0;
    }

    /* Chips ingredientes */
    .dialog__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid #E5E7EB;
      background: #fff;
      color: #374151;
      font-size: 12px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.12s, border-color 0.12s;
    }
    .chip:hover { border-color: #F87171; }
    .chip--removed {
      background: #FEF2F2;
      border-color: #FECACA;
      color: #DC2626;
      text-decoration: line-through;
    }

    /* Extras */
    .dialog__extras {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .extra-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-radius: 8px;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.12s;
    }
    .extra-row:hover { background: #F0F0F0; }
    .extra-row--added { background: #FFF7ED; }
    .extra-row--added .extra-row__nombre { color: #F27920; font-weight: 600; }
    .extra-row__nombre { font-size: 13px; color: #374151; }
    .extra-row__precio { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    .extra-row--add {
      border: 1px dashed #D1D5DB;
      margin-top: 6px;
    }
    .extra-row--add .extra-row__nombre { color: #9CA3AF; font-size: 12px; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ItemDialogComponent {
  item = input.required<ItemPedido>();
  cerrar = output<void>();

  readonly cantidad = signal(0);
  readonly precio = signal(0);
  readonly observacion = signal('');

  readonly ingredientes = signal<Ingrediente[]>([
    { nombre: 'Pan de papa', removido: false },
    { nombre: 'Medallón de carne', removido: false },
    { nombre: 'Queso americano', removido: true },
    { nombre: 'Cebolla crocante', removido: false },
    { nombre: 'Bacon ahumado', removido: true },
    { nombre: 'Cheddar', removido: false },
  ]);

  readonly extras = signal<Extra[]>([
    { nombre: 'Medallón de carne', precio: 4500, agregado: false },
    { nombre: 'Medallón de carne', precio: 4500, agregado: false },
    { nombre: 'Medallón de carne', precio: 4500, agregado: false },
    { nombre: 'Medallón de carne', precio: 4500, agregado: false },
    { nombre: 'Medallón de carne', precio: 4500, agregado: false },
  ]);

  ngOnInit(): void {
    this.cantidad.set(this.item().cantidad);
    this.precio.set(this.item().precioUnitario);
  }

  getEmoji(): string {
    const n = this.item().nombre.toLowerCase();
    if (n.includes('hamburguesa') || n.includes('doble') || n.includes('simple') || n.includes('completa') || n.includes('criolla') || n.includes('bacon') || n.includes('cheddar') || n.includes('fried') || n.includes('cheese')) return '🍔';
    if (n.includes('milanesa') || n.includes('napolitana')) return '🍖';
    if (n.includes('coca') || n.includes('agua')) return '🥤';
    if (n.includes('malbec')) return '🍷';
    if (n.includes('cerveza') || n.includes('quilmes')) return '🍺';
    if (n.includes('flan') || n.includes('tiramisú') || n.includes('helado')) return '🍮';
    return '🍽️';
  }

  incrementQty(): void { this.cantidad.update(v => v + 1); }
  decrementQty(): void { this.cantidad.update(v => Math.max(1, v - 1)); }

  onPrecioChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.precio.set(+val || 0);
  }

  toggleIngrediente(nombre: string): void {
    this.ingredientes.update(list =>
      list.map(i => i.nombre === nombre ? { ...i, removido: !i.removido } : i)
    );
  }

  toggleExtraByIndex(index: number): void {
    this.extras.update(list =>
      list.map((e, i) => i === index ? { ...e, agregado: !e.agregado } : e)
    );
  }

  asValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
