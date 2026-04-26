import { Component, signal, computed, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ElementRef, viewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PedidoListComponent } from './components/pedido-list/pedido-list.component';
import { CartaCatalogoComponent } from './components/carta-catalogo/carta-catalogo.component';
import { ComensalesDialogComponent } from './components/comensales-dialog/comensales-dialog.component';
import { ItemDialogComponent } from './components/item-dialog/item-dialog.component';
import { MozoDialogComponent } from './components/mozo-dialog/mozo-dialog.component';
import { ClienteDialogComponent } from './components/cliente-dialog/cliente-dialog.component';
import { DescuentoDialogComponent } from './components/descuento-dialog/descuento-dialog.component';
import { ObservacionDialogComponent } from './components/observacion-dialog/observacion-dialog.component';
import { AnularDialogComponent } from './components/anular-dialog/anular-dialog.component';
import { TransferenciaDialogComponent } from './components/transferencia-dialog/transferencia-dialog.component';
import { CantidadPadComponent } from './components/cantidad-pad/cantidad-pad.component';
import { NuevoArticuloDialogComponent } from './components/nuevo-articulo-dialog/nuevo-articulo-dialog.component';
import { ControlDialogComponent } from './components/control-dialog/control-dialog.component';
import { CobrarDialogComponent } from './components/cobrar-dialog/cobrar-dialog.component';
import { MarcharDialogComponent } from './components/marchar-dialog/marchar-dialog.component';
import { ItemPedido, Comensal, Producto } from './models/mesa-pedido.model';

@Component({
  selector: 'app-mesa',
  standalone: true,
  imports: [PedidoListComponent, CartaCatalogoComponent, ComensalesDialogComponent, ItemDialogComponent, MozoDialogComponent, ClienteDialogComponent, DescuentoDialogComponent, ObservacionDialogComponent, AnularDialogComponent, TransferenciaDialogComponent, CantidadPadComponent, NuevoArticuloDialogComponent, ControlDialogComponent, CobrarDialogComponent, MarcharDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mesa-view">
      <!-- Main content -->
      <div class="mesa-view__body" #body>
        <div class="mesa-view__pedido" [style.width.px]="pedidoWidth()">
          <!-- Mesa info bar -->
          <div class="mesa-view__mesa-bar">
            <div class="mesa-view__left">
              <button class="mesa-view__back" (click)="goBack()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
              </button>
              <h2 class="mesa-view__title">{{ modoPedido() ? 'PEDIDO' : 'MESA' }} {{ mesaNumero() }}</h2>
            </div>
            <div class="mesa-view__time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ horaActual() }}
            </div>
          </div>
          <app-pedido-list
            [items]="items()"
            [comensales]="comensales()"
            [modoPedido]="modoPedido()"
            (marcha)="onMarcha()"
            (editComensales)="showComensalesDialog.set(true)"
            (incrementItem)="onIncrementItem($event)"
            (decrementItem)="onDecrementItem($event)"
            (itemClick)="onItemClick($event)"
            (openMozo)="showMozoDialog.set(true)"
            (openCliente)="showClienteDialog.set(true)"
            (openObservacion)="showObservacionDialog.set(true)"
            (openTransferencia)="showTransferenciaDialog.set(true)"
            (openAnular)="showAnularDialog.set(true)"
            (openDescuento)="showDescuentoDialog.set(true)"
            (openControl)="showControlDialog.set(true)"
            (openCobrar)="showCobrarDialog.set(true)"
            (facturar)="onFacturar($event)"
          />
        </div>
        <div class="mesa-view__resizer"
             [class.mesa-view__resizer--dragging]="isResizing()"
             (mousedown)="onResizeStart($event)"
             title="Arrastrar para redimensionar">
          <span class="mesa-view__resizer-grip"></span>
        </div>
        <div class="mesa-view__carta">
          <app-carta-catalogo
            (productoClick)="onProductoClick($event)"
            (openCantidadPad)="showCantidadPad.set(true)"
            (openNuevoArticulo)="showNuevoArticulo.set(true)"
          />
        </div>
      </div>
    </div>

    @if (showComensalesDialog()) {
      <app-comensales-dialog
        [showObservaciones]="false"
        (confirmar)="onEditComensales($event)"
        (cancelar)="showComensalesDialog.set(false)"
      />
    }

    @if (selectedItem()) {
      <app-item-dialog
        [item]="selectedItem()!"
        (cerrar)="selectedItem.set(null)"
      />
    }

    @if (showMozoDialog()) {
      <app-mozo-dialog [modoPedido]="modoPedido()" (confirmar)="showMozoDialog.set(false)" (cancelar)="showMozoDialog.set(false)" />
    }

    @if (showClienteDialog()) {
      <app-cliente-dialog (confirmar)="showClienteDialog.set(false)" (cancelar)="showClienteDialog.set(false)" />
    }

    @if (showDescuentoDialog()) {
      <app-descuento-dialog (aplicar)="showDescuentoDialog.set(false)" (cancelar)="showDescuentoDialog.set(false)" />
    }

    @if (showObservacionDialog()) {
      <app-observacion-dialog (confirmar)="showObservacionDialog.set(false)" (cancelar)="showObservacionDialog.set(false)" />
    }

    @if (showAnularDialog()) {
      <app-anular-dialog [itemNombre]="(modoPedido() ? 'Pedido' : 'Mesa') + ' ' + mesaNumero()" (confirmar)="showAnularDialog.set(false)" (cancelar)="showAnularDialog.set(false)" />
    }

    @if (showTransferenciaDialog()) {
      <app-transferencia-dialog (confirmar)="showTransferenciaDialog.set(false)" (cancelar)="showTransferenciaDialog.set(false)" />
    }


    @if (showNuevoArticulo()) {
      <app-nuevo-articulo-dialog (confirmar)="showNuevoArticulo.set(false)" (cancelar)="showNuevoArticulo.set(false)" />
    }

    @if (showControlDialog()) {
      <app-control-dialog (cerrar)="showControlDialog.set(false)" />
    }

    @if (showCobrarDialog()) {
      <app-cobrar-dialog
        [total]="totalPedido()"
        [pedidoLabel]="(modoPedido() ? 'Pedido' : 'Mesa') + ' ' + mesaNumero()"
        (confirmar)="showCobrarDialog.set(false)"
        (cancelar)="showCobrarDialog.set(false)"
      />
    }

    @if (showMarcharDialog()) {
      <app-marchar-dialog
        [items]="itemsParaMarchar()"
        [mesaLabel]="(modoPedido() ? 'Pedido' : 'Mesa') + ' ' + mesaNumero()"
        [mozoLabel]="mozoLabel()"
        [pedidoLabel]="'Pedido #' + mesaNumero()"
        (confirmar)="onMarcharConfirm($event)"
        (cancelar)="showMarcharDialog.set(false)"
      />
    }

  `,
  styles: [`
    .mesa-view {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
      background: #F8FAFC;
    }

    /* Body */
    .mesa-view__body {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .mesa-view__pedido {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: #F1F5F9;
      min-width: 420px;
    }
    .mesa-view__resizer {
      width: 6px;
      flex-shrink: 0;
      background: #CBD5E1;
      cursor: col-resize;
      position: relative;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    .mesa-view__resizer:hover,
    .mesa-view__resizer--dragging {
      background: #F27920;
    }
    .mesa-view__resizer-grip {
      width: 2px;
      height: 32px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 1px;
      pointer-events: none;
      transition: background 0.15s;
    }
    .mesa-view__resizer:hover .mesa-view__resizer-grip,
    .mesa-view__resizer--dragging .mesa-view__resizer-grip {
      background: rgba(255, 255, 255, 0.95);
    }

    /* Mesa info bar (cinta dark arriba del panel pedido) */
    .mesa-view__mesa-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: linear-gradient(180deg, #0A0E4A 0%, #01033E 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      flex-shrink: 0;
    }
    .mesa-view__left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mesa-view__back {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      transition: color 0.15s;
    }
    .mesa-view__back:hover { color: #fff; }
    .mesa-view__title {
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .mesa-view__time {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255,255,255,0.5);
      font-size: 13px;
      font-weight: 500;
    }
    .mesa-view__carta {
      flex: 1;
      min-width: 0;
    }

    @media (max-width: 768px) {
      .mesa-view__body { flex-direction: column; }
      .mesa-view__pedido { width: 100%; height: 50%; }
      .mesa-view__carta { height: 50%; }
    }
  `],
})
export class MesaComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly bodyRef = viewChild<ElementRef<HTMLElement>>('body');

  readonly pedidoMinWidth = 420;
  readonly pedidoWidth = signal(420);
  readonly isResizing = signal(false);
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private mouseUpHandler?: () => void;

  readonly mesaNumero = signal(1);
  readonly modoPedido = signal(false);
  readonly canalOrigen = signal('');
  readonly comensales = signal<Comensal[]>([]);
  readonly items = signal<ItemPedido[]>([]);
  readonly horaActual = signal('');
  readonly showComensalesDialog = signal(false);
  readonly selectedItem = signal<ItemPedido | null>(null);
  readonly showMozoDialog = signal(false);
  readonly showClienteDialog = signal(false);
  readonly showDescuentoDialog = signal(false);
  readonly showObservacionDialog = signal(false);
  readonly showAnularDialog = signal(false);
  readonly showTransferenciaDialog = signal(false);
  readonly showCantidadPad = signal(false);
  readonly showNuevoArticulo = signal(false);
  readonly showControlDialog = signal(false);
  readonly showCobrarDialog = signal(false);
  readonly showMarcharDialog = signal(false);
  readonly mozoLabel = signal('Sin asignar');

  readonly totalPedido = computed(() =>
    this.items().reduce((sum, i) => sum + i.subtotal, 0)
  );

  private itemCounter = 0;

  ngOnInit(): void {
    const num = this.route.snapshot.paramMap.get('numero');
    if (num) this.mesaNumero.set(+num);

    const modo = this.route.snapshot.queryParamMap.get('modo');
    if (modo === 'pedido') this.modoPedido.set(true);

    const canal = this.route.snapshot.queryParamMap.get('canal');
    if (canal) this.canalOrigen.set(canal);

    const cantComensales = +(this.route.snapshot.queryParamMap.get('comensales') ?? '2');
    const comensales: Comensal[] = [];
    for (let i = 0; i < cantComensales; i++) {
      comensales.push({ index: i, nombre: `Comensal ${i + 1}` });
    }
    this.comensales.set(comensales);
    this.updateTime();
    setInterval(() => this.updateTime(), 30000);
  }

  private updateTime(): void {
    const now = new Date();
    this.horaActual.set(now.toTimeString().slice(0, 5));
  }

  onProductoClick(event: { producto: Producto; cantidad: number }): void {
    const { producto, cantidad } = event;
    const qty = Math.max(1, Math.floor(cantidad || 1));
    const existing = this.items().find(
      i => i.productoId === producto.id && i.comensalIndex === 0 && !i.enviado
    );
    if (existing) {
      this.items.update(items =>
        items.map(i => i.id === existing.id
          ? { ...i, cantidad: i.cantidad + qty, subtotal: (i.cantidad + qty) * i.precioUnitario }
          : i
        )
      );
    } else {
      this.items.update(items => [
        ...items,
        {
          id: `item-${++this.itemCounter}`,
          productoId: producto.id,
          nombre: producto.nombre,
          cantidad: qty,
          precioUnitario: producto.precio,
          subtotal: producto.precio * qty,
          comensalIndex: 0,
          enviado: false,
        },
      ]);
    }
  }

  onEditComensales(result: { cantidad: number; observaciones: string[] }): void {
    this.showComensalesDialog.set(false);
    const comensales: Comensal[] = [];
    for (let i = 0; i < result.cantidad; i++) {
      comensales.push({ index: i, nombre: `Comensal ${i + 1}` });
    }
    this.comensales.set(comensales);
  }

  onItemClick(item: ItemPedido): void {
    this.selectedItem.set(item);
  }

  onIncrementItem(itemId: string): void {
    this.items.update(items =>
      items.map(i => i.id === itemId
        ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioUnitario }
        : i
      )
    );
  }

  onDecrementItem(itemId: string): void {
    this.items.update(items =>
      items
        .map(i => i.id === itemId
          ? { ...i, cantidad: i.cantidad - 1, subtotal: (i.cantidad - 1) * i.precioUnitario }
          : i
        )
        .filter(i => i.cantidad > 0)
    );
  }

  readonly itemsParaMarchar = computed(() =>
    this.items().filter(i => !i.enviado),
  );

  onMarcha(): void {
    if (this.itemsParaMarchar().length === 0) return;
    this.showMarcharDialog.set(true);
  }

  onMarcharConfirm(result: { itemIds: string[]; nota: string }): void {
    this.showMarcharDialog.set(false);
    const ids = new Set(result.itemIds);
    this.items.update(items =>
      items.map(i => ids.has(i.id) ? { ...i, enviado: true } : i),
    );
    if (result.nota) {
      // TODO: persistir nota para cocina
      console.log('Nota cocina:', result.nota);
    }
  }

  goBack(): void {
    this.router.navigate(['/salon']);
  }

  onFacturar(tipo: 'factura-a' | 'factura-b' | 'ticket'): void {
    // TODO: integrar con servicio de facturación
    console.log('Facturar', tipo);
  }

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    const body = this.bodyRef()?.nativeElement;
    if (!body) return;

    const bodyRect = body.getBoundingClientRect();
    this.isResizing.set(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    this.mouseMoveHandler = (e: MouseEvent) => {
      const newWidth = e.clientX - bodyRect.left;
      const maxWidth = bodyRect.width - 320; // catálogo min 320px
      const clamped = Math.max(this.pedidoMinWidth, Math.min(newWidth, maxWidth));
      this.pedidoWidth.set(clamped);
    };
    this.mouseUpHandler = () => this.onResizeEnd();

    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
  }

  private onResizeEnd(): void {
    this.isResizing.set(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    if (this.mouseMoveHandler) document.removeEventListener('mousemove', this.mouseMoveHandler);
    if (this.mouseUpHandler) document.removeEventListener('mouseup', this.mouseUpHandler);
    this.mouseMoveHandler = undefined;
    this.mouseUpHandler = undefined;
  }

  ngOnDestroy(): void {
    this.onResizeEnd();
  }
}
