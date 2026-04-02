import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { PosHeaderComponent } from './components/pos-header/pos-header.component';
import { MesaGridComponent } from './components/mesa-grid/mesa-grid.component';
import { ActiveOrdersComponent } from './components/active-orders/active-orders.component';
import { ComensalesDialogComponent } from '../mesa/components/comensales-dialog/comensales-dialog.component';
import { ClienteDialogComponent } from '../mesa/components/cliente-dialog/cliente-dialog.component';
import { CerrarTurnoDialogComponent } from './components/cerrar-turno-dialog/cerrar-turno-dialog.component';
import { AuthService } from '../../core/services/auth.service';
import { ShiftService } from '../../core/services/shift.service';
import { Mesa } from './models/salon.model';
import { MOCK_SALONES, MOCK_CANALES } from './data/mock-salon.data';

@Component({
  selector: 'app-salon',
  standalone: true,
  imports: [PosHeaderComponent, MesaGridComponent, ActiveOrdersComponent, ComensalesDialogComponent, ClienteDialogComponent, CerrarTurnoDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; width: 100%; height: 100%;' },
  template: `
    <div class="salon">
      <app-pos-header (cerrarTurno)="onCerrarTurno()" />

      <div class="salon__body">
        <app-mesa-grid
          [salones]="salones"
          (mesaClick)="onMesaClick($event)"
        />
        <app-active-orders [canales]="canales" (nuevoPedidoCanal)="onNuevoPedidoCanal($event)" />
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
    }
    .salon__body {
      display: flex;
      gap: 0;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      width: 100%;
      background: url('/floor-texture.svg') center/cover;
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

  readonly salones = MOCK_SALONES;
  readonly canales = MOCK_CANALES;
  readonly showComensalesDialog = signal(false);
  readonly showClienteDialog = signal(false);
  readonly showCerrarTurno = signal(false);
  private mesaSeleccionada: Mesa | null = null;
  private canalPedidoNuevo: string | null = null;
  private pedidoCounter = 100;

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
    this.router.navigate(['/login']);
  }
}
