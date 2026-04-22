import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { PosHeaderComponent } from './components/pos-header/pos-header.component';
import { MesaGridComponent } from './components/mesa-grid/mesa-grid.component';
import { ActiveOrdersComponent } from './components/active-orders/active-orders.component';
import { SalonReducedComponent } from './components/salon-reduced/salon-reduced.component';
import { ChannelMainComponent } from './components/channel-main/channel-main.component';
import { ComensalesDialogComponent } from '../mesa/components/comensales-dialog/comensales-dialog.component';
import { ClienteDialogComponent } from '../mesa/components/cliente-dialog/cliente-dialog.component';
import { CerrarTurnoDialogComponent } from './components/cerrar-turno-dialog/cerrar-turno-dialog.component';
import { AuthService } from '../../core/services/auth.service';
import { ShiftService } from '../../core/services/shift.service';
import { SalonLayoutService, MainView } from './services/salon-layout.service';
import { Mesa, CanalVenta, CanalVentaTipo, PedidoCanal } from './models/salon.model';
import { MOCK_SALONES, MOCK_CANALES } from './data/mock-salon.data';

@Component({
  selector: 'app-salon',
  standalone: true,
  imports: [
    PosHeaderComponent,
    MesaGridComponent,
    ActiveOrdersComponent,
    SalonReducedComponent,
    ChannelMainComponent,
    ComensalesDialogComponent,
    ClienteDialogComponent,
    CerrarTurnoDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; width: 100%; height: 100%;' },
  template: `
    <div class="salon">
      <app-pos-header (cerrarTurno)="onCerrarTurno()" />

      <div class="salon__body">
        @if (layout.isMainSalon()) {
          <!-- MAIN: plano de mesas -->
          <div class="main-slot"
            [class.main-slot--drop]="isDragOverMain()"
            (dragover)="onMainDragOver($event)"
            (dragleave)="onMainDragLeave()"
            (drop)="onMainDrop($event)"
          >
            <app-mesa-grid [salones]="salones" (mesaClick)="onMesaClick($event)" />
            @if (isDragOverMain()) { <div class="drop-hint">Soltá acá para poner {{ draggingLabel() }} en el plano</div> }
          </div>

          <!-- LATERAL: pedidos activos (4 canales) -->
          <app-active-orders
            [canales]="canales"
            (nuevoPedidoCanal)="onNuevoPedidoCanal($event)"
            (canalDragStart)="onCanalDragStart($event)"
            (canalDragEnd)="onDragEnd()"
          />
        } @else {
          <!-- MAIN: canal de venta grande -->
          <div class="main-slot"
            [class.main-slot--drop]="isDragOverMain()"
            (dragover)="onMainDragOver($event)"
            (dragleave)="onMainDragLeave()"
            (drop)="onMainDrop($event)"
          >
            <app-channel-main
              [canal]="activeChannelMain()!"
              (nuevoPedido)="onNuevoPedidoCanal(activeChannelMain()!.tipo)"
              (pedidoClick)="onPedidoClick($event)"
              (restaurar)="layout.reset()"
            />
            @if (isDragOverMain()) { <div class="drop-hint">Soltá acá para poner {{ draggingLabel() }} como principal</div> }
          </div>

          <!-- LATERAL: salón reducido + canales restantes -->
          <app-active-orders
            [canales]="otherChannels()"
            (nuevoPedidoCanal)="onNuevoPedidoCanal($event)"
            (canalDragStart)="onCanalDragStart($event)"
            (canalDragEnd)="onDragEnd()"
          >
            <app-salon-reduced prepend
              [salones]="salones"
              (mesaClick)="onMesaClick($event)"
              (dragStart)="onSalonDragStart($event)"
              (dragEnd)="onDragEnd()"
            />
          </app-active-orders>
        }
      </div>
    </div>

    @if (showComensalesDialog()) {
      <app-comensales-dialog
        (confirmar)="onComensalesConfirm($event)"
        (cancelar)="showComensalesDialog.set(false)"
      />
    }

    @if (showClienteDialog()) {
      <app-cliente-dialog
        (confirmar)="onClienteConfirm($event)"
        (cancelar)="showClienteDialog.set(false)"
      />
    }

    @if (showCerrarTurno()) {
      <app-cerrar-turno-dialog
        (cancelar)="showCerrarTurno.set(false)"
        (cerrarConfirmado)="onCerrarTurnoConfirmado()"
      />
    }
  `,
  styles: [`
    .salon {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
      background: #F8FAFC;
    }
    .salon__body {
      display: flex;
      gap: 0;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      width: 100%;
      background: transparent;
    }

    .main-slot {
      display: flex;
      flex: 1;
      min-width: 0;
      position: relative;
      transition: box-shadow 0.15s, background 0.15s;
    }
    .main-slot--drop {
      background: rgba(242, 121, 32, 0.06);
      box-shadow: 0 0 0 3px rgba(242, 121, 32, 0.5) inset;
    }

    .drop-hint {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 10px 18px;
      border-radius: 999px;
      background: #F27920;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(242, 121, 32, 0.5);
      pointer-events: none;
      z-index: 50;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .salon__body {
        flex-direction: column;
        overflow-y: auto;
      }
    }
  `],
})
export class SalonComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly shiftService = inject(ShiftService);
  readonly layout = inject(SalonLayoutService);

  readonly salones = MOCK_SALONES;
  readonly canales = MOCK_CANALES;
  readonly showComensalesDialog = signal(false);
  readonly showClienteDialog = signal(false);
  readonly showCerrarTurno = signal(false);

  // Drag state para swap
  readonly draggingSource = signal<MainView | null>(null);
  readonly isDragOverMain = signal(false);

  private mesaSeleccionada: Mesa | null = null;
  private canalPedidoNuevo: string | null = null;
  private pedidoCounter = 100;

  readonly activeChannelMain = computed<CanalVenta | null>(() => {
    const v = this.layout.mainView();
    if (v === 'salon') return null;
    return this.canales.find(c => c.tipo === v) ?? null;
  });

  readonly otherChannels = computed<CanalVenta[]>(() => {
    const v = this.layout.mainView();
    if (v === 'salon') return this.canales;
    return this.canales.filter(c => c.tipo !== v);
  });

  readonly draggingLabel = computed(() => {
    const s = this.draggingSource();
    if (!s) return '';
    if (s === 'salon') return 'el Salón';
    return this.canales.find(c => c.tipo === s)?.label ?? s;
  });

  // === Handlers de mesa/pedido ===
  onMesaClick(mesa: Mesa): void {
    if (mesa.estado === 'DISPONIBLE') {
      this.mesaSeleccionada = mesa;
      this.showComensalesDialog.set(true);
    } else if (mesa.estado === 'OCUPADA') {
      this.router.navigate(['/mesa', mesa.numero], {
        queryParams: { comensales: mesa.comensales ?? 2 },
      });
    }
  }

  onComensalesConfirm(cantidad: number): void {
    this.showComensalesDialog.set(false);
    if (this.mesaSeleccionada) {
      this.router.navigate(['/mesa', this.mesaSeleccionada.numero], {
        queryParams: { comensales: cantidad },
      });
    }
  }

  onNuevoPedidoCanal(canalTipo: string): void {
    this.canalPedidoNuevo = canalTipo;
    this.showClienteDialog.set(true);
  }

  onClienteConfirm(clienteId: string): void {
    this.showClienteDialog.set(false);
    if (this.canalPedidoNuevo) {
      this.router.navigate(['/mesa', ++this.pedidoCounter], {
        queryParams: { comensales: 1, modo: 'pedido', canal: this.canalPedidoNuevo },
      });
      this.canalPedidoNuevo = null;
    }
  }

  onPedidoClick(pedido: PedidoCanal): void {
    // Placeholder: abrir detalle del pedido
    this.router.navigate(['/mesa', pedido.numero.replace('#', '')], {
      queryParams: { modo: 'pedido', canal: pedido.canalTipo },
    });
  }

  onCerrarTurno(): void {
    this.showCerrarTurno.set(true);
  }

  onCerrarTurnoConfirmado(): void {
    this.showCerrarTurno.set(false);
    const user = this.authService.currentUser();
    if (user) {
      this.shiftService.closeShift(user.id);
      this.authService.logout();
    }
    this.layout.reset();
    this.router.navigate(['/login']);
  }

  // === Drag & drop: swap entre main y lateral ===
  onCanalDragStart(e: { tipo: CanalVentaTipo; event: DragEvent }): void {
    this.draggingSource.set(e.tipo);
    if (e.event.dataTransfer) e.event.dataTransfer.effectAllowed = 'move';
  }

  onSalonDragStart(event: DragEvent): void {
    this.draggingSource.set('salon');
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragEnd(): void {
    this.draggingSource.set(null);
    this.isDragOverMain.set(false);
  }

  onMainDragOver(event: DragEvent): void {
    if (!this.draggingSource()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    if (!this.isDragOverMain()) this.isDragOverMain.set(true);
  }

  onMainDragLeave(): void {
    this.isDragOverMain.set(false);
  }

  onMainDrop(event: DragEvent): void {
    event.preventDefault();
    const source = this.draggingSource();
    if (source && source !== this.layout.mainView()) {
      this.layout.setMain(source);
    }
    this.onDragEnd();
  }
}
