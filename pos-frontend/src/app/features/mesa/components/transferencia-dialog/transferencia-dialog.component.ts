import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-transferencia-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog__header">
          <span class="dialog__icon">🔄</span>
          <h3 class="dialog__title">Transferencia</h3>
        </div>

        <div class="dialog__section">
          <div class="dialog__section-header">
            <span class="dialog__label">Origen</span>
            <div class="dialog__tabs">
              <button class="tab" [class.tab--active]="tab() === 'salon'" (click)="tab.set('salon')">Salón</button>
              <button class="tab" [class.tab--active]="tab() === 'delivery'" (click)="tab.set('delivery')">Delivery</button>
            </div>
          </div>
          <span class="dialog__sublabel">Selecciona el canal de transferencia</span>
          <div class="dialog__channels">
            @for (ch of canales; track ch.id) {
              <button class="channel" [class.channel--selected]="selectedCanal() === ch.id" (click)="selectedCanal.set(ch.id)">
                <span class="channel__icon">{{ ch.icon }}</span>
                <span class="channel__nombre">{{ ch.nombre }}</span>
                <span class="channel__detalle">{{ ch.detalle }}</span>
              </button>
            }
          </div>
        </div>

        <div class="dialog__section">
          <span class="dialog__sublabel">Selecciona el pedido</span>
          <div class="dialog__pedidos">
            @for (p of pedidos; track p.id) {
              <button class="pedido" [class.pedido--selected]="selectedPedido() === p.id" (click)="selectedPedido.set(p.id)">
                <span class="pedido__icon">{{ p.icon }}</span>
                <div class="pedido__info">
                  <span class="pedido__nombre">{{ p.nombre }}</span>
                  <span class="pedido__detalle">{{ p.detalle }}</span>
                </div>
              </button>
            }
          </div>
        </div>

        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" (click)="confirmar.emit()">Transferir</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 500px; max-width: 95vw; padding: 24px; position: relative; animation: slideUp 0.2s ease-out; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__section { margin-bottom: 20px; }
    .dialog__section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .dialog__label { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    .dialog__sublabel { font-size: 11px; color: #9CA3AF; display: block; margin-bottom: 10px; }
    .dialog__tabs { display: flex; gap: 2px; background: #F3F4F6; border-radius: 8px; padding: 2px; }
    .tab { padding: 5px 14px; border-radius: 6px; border: none; background: none; font-size: 12px; font-weight: 600; color: #6B7280; cursor: pointer; font-family: inherit; }
    .tab--active { background: #fff; color: #1a1a1a; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
    .dialog__channels { display: flex; gap: 10px; }
    .channel { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 20px; border-radius: 12px; border: 1.5px solid #E5E7EB; background: #fff; cursor: pointer; font-family: inherit; flex: 1; transition: border-color 0.12s; }
    .channel:hover { border-color: #F27920; }
    .channel--selected { border-color: #F27920; background: #FFF7ED; }
    .channel__icon { font-size: 24px; }
    .channel__nombre { font-size: 12px; font-weight: 600; color: #1a1a1a; }
    .channel__detalle { font-size: 10px; color: #9CA3AF; }
    .dialog__pedidos { display: flex; gap: 10px; }
    .pedido { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #E5E7EB; background: #fff; cursor: pointer; font-family: inherit; flex: 1; transition: border-color 0.12s; }
    .pedido:hover { border-color: #F27920; }
    .pedido--selected { border-color: #F27920; background: #FFF7ED; }
    .pedido__icon { font-size: 20px; }
    .pedido__info { display: flex; flex-direction: column; }
    .pedido__nombre { font-size: 12px; font-weight: 600; color: #1a1a1a; }
    .pedido__detalle { font-size: 10px; color: #9CA3AF; }
    .dialog__footer { display: flex; justify-content: flex-end; gap: 10px; }
    .btn { padding: 10px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--cancel { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class TransferenciaDialogComponent {
  confirmar = output<void>();
  cancelar = output<void>();
  readonly tab = signal<'salon' | 'delivery'>('salon');
  readonly selectedCanal = signal<string | null>(null);
  readonly selectedPedido = signal<string | null>(null);

  readonly canales = [
    { id: 'ch1', nombre: 'Salón', icon: '🍽️', detalle: 'Servicio en mesa' },
    { id: 'ch2', nombre: 'Mostrador', icon: '🏪', detalle: 'Take away' },
    { id: 'ch3', nombre: 'Delivery', icon: '🛵', detalle: 'Envío a domicilio' },
  ];

  readonly pedidos = [
    { id: 'p1', nombre: 'Nueva Pedido', icon: '📋', detalle: 'Crear uno nuevo' },
    { id: 'p2', nombre: 'Pedido #024', icon: '📋', detalle: 'Mesa 5' },
  ];
}
