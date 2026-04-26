import { Component, signal, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Categoria, Producto, Subcategoria } from '../../models/mesa-pedido.model';
import { MOCK_CATEGORIAS, MOCK_SUBCATEGORIAS, MOCK_PRODUCTOS } from '../../data/mock-carta.data';

@Component({
  selector: 'app-carta-catalogo',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="carta">
      <!-- Categorías -->
      <div class="carta__categorias">
        @for (cat of categorias; track cat.id) {
          <button
            class="cat-btn"
            [class.cat-btn--active]="activeCatId() === cat.id"
            (click)="activeCatId.set(cat.id)"
          >
            <span class="cat-btn__icon">{{ cat.imagen }}</span>
            <span class="cat-btn__label">{{ cat.nombre }}</span>
          </button>
        }
      </div>

      <!-- Productos agrupados por subcategoría -->
      <div class="carta__productos">
        @for (sub of subcategoriasFiltradas(); track sub.id) {
          <div class="carta__grupo">
            <h4 class="carta__grupo-titulo">{{ sub.nombre }}</h4>
            <div class="carta__grid">
              @for (prod of productosPorSub(sub.id); track prod.id) {
                <button class="prod-card" (click)="onProductoClick(prod)">
                  <span class="prod-card__icon">{{ prod.imagen }}</span>
                  <span class="prod-card__nombre">{{ prod.nombre }}</span>
                  <span class="prod-card__precio">\${{ prod.precio | number:'1.0-0' }}</span>
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Footer actions -->
      <div class="carta__footer">
        <div class="carta__qty-wrap">
          <button class="carta__footer-btn carta__footer-btn--qty" (click)="showPad.set(!showPad())">
            <span class="carta__footer-qty">{{ cantidadNext() }}</span>
          </button>
          @if (showPad()) {
            <div class="qty-pad">
              <span class="qty-pad__title">CANTIDAD</span>
              <div class="qty-pad__display">{{ padDisplay() }}</div>
              <div class="qty-pad__keys">
                @for (row of padRows; track $index) {
                  <div class="qty-pad__row">
                    @for (key of row; track key) {
                      <button class="qty-pad__key" [class.qty-pad__key--ok]="key === 'ok'" (click)="onPadKey(key)">
                        @if (key === 'del') {
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
                        } @else if (key === 'ok') {
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        } @else {
                          {{ key }}
                        }
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
        <div class="carta__footer-right">
          <button class="carta__footer-btn" (click)="showSearch.set(!showSearch())">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          @if (showSearch()) {
            <input
              class="carta__footer-search"
              type="text"
              placeholder="Buscar plato..."
              autofocus
            />
          }
          <button class="carta__footer-btn" (click)="openNuevoArticulo.emit()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carta {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background:
        url('https://media.istockphoto.com/id/1339378316/cs/fotografie/st%C5%99%C3%ADbrn%C3%A9-pozad%C3%AD-s-kovovou-texturou-st%C5%99%C3%ADbrn%C3%BD-materi%C3%A1l-d%C3%ADky-kter%C3%A9mu-se-budete-c%C3%ADtit-z.jpg?s=612x612&w=0&k=20&c=8GNZkbSADhVwSUZCdp9CknoN2OLPnVed6TwpmBFuYH4=') center/cover no-repeat,
        linear-gradient(180deg, #D8DCE3 0%, #C8CCD4 50%, #D2D6DD 100%);
    }

    /* Categorías scroll horizontal */
    .carta__categorias {
      display: flex;
      gap: 8px;
      padding: 12px 14px;
      overflow-x: auto;
      flex-shrink: 0;
      background: transparent;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
    }
    .cat-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      border-radius: 14px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      background: #fff;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.6) inset;
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
      flex-shrink: 0;
      min-width: 85px;
    }
    .cat-btn:hover {
      border-color: #F27920;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .cat-btn--active {
      border-color: #F27920;
      background: #FFF7ED;
    }
    .cat-btn__icon {
      font-size: 30px;
    }
    .cat-btn__label {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
    }

    /* Productos */
    .carta__productos {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
    }
    .carta__grupo {
      margin-bottom: 16px;
    }
    .carta__grupo-titulo {
      font-size: 11px;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 8px 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }
    .carta__grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .prod-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 8px;
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      background: #fff;
      cursor: pointer;
      font-family: inherit;
      width: 100px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.6) inset;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
    }
    .prod-card:hover {
      border-color: #F27920;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .prod-card:active {
      transform: scale(0.97);
    }
    .prod-card__icon {
      font-size: 28px;
    }
    .prod-card__nombre {
      font-size: 10px;
      font-weight: 600;
      color: #374151;
      text-align: center;
      line-height: 1.2;
      max-height: 2.4em;
      overflow: hidden;
    }
    .prod-card__precio {
      font-size: 10px;
      font-weight: 700;
      color: #F27920;
    }

    /* Footer */
    .carta__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.25);
      background: transparent;
      flex-shrink: 0;
      gap: 10px;
    }
    .carta__footer-btn {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      background: #fff;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-family: inherit;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.6) inset;
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, color 0.15s;
    }
    .carta__footer-btn:hover {
      border-color: #F27920;
      color: #F27920;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .carta__qty-wrap {
      position: relative;
    }
    .carta__footer-btn--qty {
      width: auto;
      padding: 0 14px;
      gap: 6px;
      background: #01033E;
      border-color: #01033E;
      color: #fff;
    }
    .carta__footer-btn--qty:hover {
      background: #2A2F4A;
      border-color: #2A2F4A;
      color: #fff;
    }

    /* Qty pad popover */
    .qty-pad {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.18);
      border: 1px solid #E5E7EB;
      width: 220px;
      z-index: 50;
      animation: popUp 0.15s ease-out;
    }
    .qty-pad__title {
      display: block;
      text-align: center;
      font-size: 9px;
      font-weight: 700;
      color: #9CA3AF;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .qty-pad__display {
      text-align: center;
      font-size: 24px;
      font-weight: 800;
      color: #1a1a1a;
      padding: 6px;
      margin-bottom: 10px;
      border-bottom: 2px solid #F27920;
    }
    .qty-pad__keys {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .qty-pad__row {
      display: flex;
      gap: 6px;
      justify-content: center;
    }
    .qty-pad__key {
      width: 52px;
      height: 40px;
      border-radius: 8px;
      border: none;
      background: #F3F4F6;
      color: #1a1a1a;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.1s;
    }
    .qty-pad__key:hover { background: #E5E7EB; }
    .qty-pad__key--ok {
      background: #F27920 !important;
      color: #fff;
    }
    .qty-pad__key--ok:hover { background: #E06D15 !important; }
    @keyframes popUp {
      from { transform: translateY(8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .carta__footer-qty {
      font-size: 18px;
      font-weight: 800;
    }
    .carta__footer-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .carta__footer-search {
      height: 42px;
      padding: 0 14px;
      border-radius: 10px;
      border: 1.5px solid #E5E7EB;
      background: #fff;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      width: 200px;
      color: #1a1a1a;
      transition: border-color 0.15s;
      animation: expandSearch 0.15s ease-out;
    }
    .carta__footer-search:focus {
      border-color: #F27920;
    }
    .carta__footer-search::placeholder {
      color: #9CA3AF;
    }
    @keyframes expandSearch {
      from { width: 0; opacity: 0; }
      to { width: 200px; opacity: 1; }
    }
  `],
})
export class CartaCatalogoComponent {
  productoClick = output<{ producto: Producto; cantidad: number }>();
  openCantidadPad = output<void>();
  openNuevoArticulo = output<void>();

  readonly categorias = MOCK_CATEGORIAS;
  private readonly subcategorias = MOCK_SUBCATEGORIAS;
  private readonly productos = MOCK_PRODUCTOS;

  readonly activeCatId = signal('cat-5');
  readonly showSearch = signal(false);
  readonly showPad = signal(false);
  readonly cantidadNext = signal(1);
  readonly padDisplay = signal('1');

  readonly padRows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['.', '0', 'ok'],
  ];

  onPadKey(key: string): void {
    if (key === 'del') {
      const v = this.padDisplay();
      this.padDisplay.set(v.length > 1 ? v.slice(0, -1) : '0');
    } else if (key === 'ok') {
      this.cantidadNext.set(Math.max(1, Math.floor(parseFloat(this.padDisplay()) || 1)));
      this.showPad.set(false);
    } else {
      const v = this.padDisplay();
      if (v === '0' || v === '1') {
        this.padDisplay.set(key);
      } else {
        this.padDisplay.set(v + key);
      }
    }
  }

  onProductoClick(prod: Producto): void {
    this.productoClick.emit({ producto: prod, cantidad: this.cantidadNext() });
    this.cantidadNext.set(1);
    this.padDisplay.set('1');
    this.showPad.set(false);
  }

  readonly subcategoriasFiltradas = computed(() =>
    this.subcategorias.filter(s => s.categoriaId === this.activeCatId())
  );

  productosPorSub(subId: string): Producto[] {
    return this.productos.filter(p => p.subcategoriaId === subId);
  }
}
