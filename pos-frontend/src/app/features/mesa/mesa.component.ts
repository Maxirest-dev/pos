import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PosHeaderComponent } from '../salon/components/pos-header/pos-header.component';
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
import { FacturarDialogComponent } from './components/facturar-dialog/facturar-dialog.component';
import { ItemPedido, Comensal, Producto } from './models/mesa-pedido.model';

@Component({
  selector: 'app-mesa',
  standalone: true,
  imports: [PosHeaderComponent, PedidoListComponent, CartaCatalogoComponent, ComensalesDialogComponent, ItemDialogComponent, MozoDialogComponent, ClienteDialogComponent, DescuentoDialogComponent, ObservacionDialogComponent, AnularDialogComponent, TransferenciaDialogComponent, CantidadPadComponent, NuevoArticuloDialogComponent, ControlDialogComponent, CobrarDialogComponent, FacturarDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mesa-view">
      <app-pos-header (cerrarTurno)="goBack()" />

      <!-- Main content -->
      <div class="mesa-view__body">
        <div class="mesa-view__pedido">
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
            (openFacturar)="showFacturarDialog.set(true)"
          />
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
      <app-cobrar-dialog [total]="totalPedido()" (confirmar)="showCobrarDialog.set(false)" (cancelar)="showCobrarDialog.set(false)" />
    }

    @if (showFacturarDialog()) {
      <app-facturar-dialog (confirmar)="showFacturarDialog.set(false)" (cancelar)="showFacturarDialog.set(false)" />
    }
  `,
  styles: [`
    .mesa-view {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
      background: #F5F5F5;
    }

    /* Body */
    .mesa-view__body {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .mesa-view__pedido {
      width: 420px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: #01033E;
      border-right: 2px solid #E5E7EB;
    }

    /* Mesa info bar (inside pedido column) */
    .mesa-view__mesa-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
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
export class MesaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
  readonly showFacturarDialog = signal(false);

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

  onProductoClick(producto: Producto): void {
    const existing = this.items().find(
      i => i.productoId === producto.id && i.comensalIndex === 0 && !i.enviado
    );
    if (existing) {
      this.items.update(items =>
        items.map(i => i.id === existing.id
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioUnitario }
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
          cantidad: 1,
          precioUnitario: producto.precio,
          subtotal: producto.precio,
          comensalIndex: 0,
          enviado: false,
        },
      ]);
    }
  }

  onEditComensales(cantidad: number): void {
    this.showComensalesDialog.set(false);
    const comensales: Comensal[] = [];
    for (let i = 0; i < cantidad; i++) {
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

  onMarcha(): void {
    this.items.update(items =>
      items.map(i => ({ ...i, enviado: true }))
    );
  }

  goBack(): void {
    this.router.navigate(['/salon']);
  }
}
