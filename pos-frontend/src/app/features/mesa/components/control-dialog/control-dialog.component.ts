import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-control-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cerrar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        @if (!enviado()) {
          <div class="dialog__icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F27920" stroke-width="2">
              <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
          </div>
          <h3 class="dialog__title">Control de mesa</h3>
          <p class="dialog__msg">Se va a emitir la impresión del control de mesa con el detalle del pedido actual.</p>
          <div class="dialog__footer">
            <button class="btn btn--cancel" (click)="cerrar.emit()">Cancelar</button>
            <button class="btn btn--confirm" (click)="enviar()">Imprimir control</button>
          </div>
        } @else {
          <div class="dialog__icon-wrap dialog__icon-wrap--success">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3 class="dialog__title">Control emitido</h3>
          <p class="dialog__msg">La impresión del control de mesa se envió correctamente.</p>
          <div class="dialog__footer">
            <button class="btn btn--confirm" (click)="cerrar.emit()">Aceptar</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 400px; max-width: 95vw; padding: 28px; display: flex; flex-direction: column; align-items: center; gap: 12px; animation: slideUp 0.2s ease-out; text-align: center; }
    .dialog__icon-wrap { width: 64px; height: 64px; border-radius: 50%; background: #FFF7ED; display: flex; align-items: center; justify-content: center; }
    .dialog__icon-wrap--success { background: #ECFDF5; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__msg { font-size: 14px; color: #6B7280; margin: 0; line-height: 1.5; }
    .dialog__footer { display: flex; gap: 10px; margin-top: 8px; }
    .btn { padding: 10px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--cancel { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--cancel:hover { background: #F9FAFB; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ControlDialogComponent {
  cerrar = output<void>();
  readonly enviado = signal(false);

  enviar(): void {
    this.enviado.set(true);
  }
}
