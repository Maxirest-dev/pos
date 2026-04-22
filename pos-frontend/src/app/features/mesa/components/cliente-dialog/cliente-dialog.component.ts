import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';

interface Cliente {
  id: string;
  nombre: string;
  detalle: string;
  avatar: string;
}

type DialogMode = 'list' | 'form' | 'qr';

@Component({
  selector: 'app-cliente-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <button class="dialog__close" (click)="cancelar.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="dialog__header">
          <span class="dialog__icon">👤</span>
          <h3 class="dialog__title">Clientes</h3>
        </div>

        <div class="dialog__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar por nombre, teléfono o dirección..." class="dialog__search-input" />
        </div>

        @switch (mode()) {
          @case ('list') {
            <div class="dialog__grid">
              @for (cliente of clientes(); track cliente.id) {
                <button class="card" (click)="confirmar.emit(cliente.id)">
                  <span class="card__avatar">{{ cliente.avatar }}</span>
                  <span class="card__nombre">{{ cliente.nombre }}</span>
                  <span class="card__detalle">{{ cliente.detalle }}</span>
                </button>
              }
            </div>

            <div class="dialog__footer">
              <button class="btn btn--ghost" (click)="confirmar.emit('sin-cliente')">Continuar sin cliente</button>
              <button class="btn btn--secondary" (click)="mode.set('qr')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Escanear QR
              </button>
              <button class="btn btn--confirm" (click)="mode.set('form')">+ Nuevo Cliente</button>
            </div>
          }
          @case ('form') {
            <div class="nuevo-form">
              <div class="nuevo-form__row">
                <div class="nuevo-form__field nuevo-form__field--lg">
                  <label class="nuevo-form__label">Nombre completo</label>
                  <input type="text" class="nuevo-form__input" placeholder="Nombre y apellido" #nombreInput />
                </div>
                <div class="nuevo-form__field">
                  <label class="nuevo-form__label">Teléfono</label>
                  <input type="text" class="nuevo-form__input" placeholder="11-XXXX-XXXX" />
                </div>
              </div>
              <div class="nuevo-form__field">
                <label class="nuevo-form__label">Email</label>
                <input type="email" class="nuevo-form__input" placeholder="nombre@correo.com" />
              </div>
              <div class="nuevo-form__field">
                <label class="nuevo-form__label">Dirección</label>
                <input type="text" class="nuevo-form__input" placeholder="Calle, número, piso, depto..." />
              </div>
              <div class="nuevo-form__row">
                <div class="nuevo-form__field">
                  <label class="nuevo-form__label">Localidad</label>
                  <input type="text" class="nuevo-form__input" placeholder="Barrio / Localidad" />
                </div>
                <div class="nuevo-form__field">
                  <label class="nuevo-form__label">Observaciones</label>
                  <input type="text" class="nuevo-form__input" placeholder="Timbre, referencias..." />
                </div>
              </div>
            </div>

            <div class="dialog__footer">
              <button class="btn btn--secondary" (click)="mode.set('list')">Volver</button>
              <button class="btn btn--confirm" (click)="onCrearCliente(nombreInput.value)">Crear y asignar</button>
            </div>
          }
          @case ('qr') {
            <div class="qr-scan">
              <div class="qr-scan__frame">
                <span class="qr-scan__corner qr-scan__corner--tl"></span>
                <span class="qr-scan__corner qr-scan__corner--tr"></span>
                <span class="qr-scan__corner qr-scan__corner--bl"></span>
                <span class="qr-scan__corner qr-scan__corner--br"></span>
                <div class="qr-scan__laser"></div>
                <svg class="qr-scan__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F27920" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div class="qr-scan__text">
                <h4 class="qr-scan__title">Esperando escaneo…</h4>
                <p class="qr-scan__desc">Pedile al cliente que escanee el QR desde su teléfono para completar sus datos automáticamente.</p>
              </div>
            </div>

            <div class="dialog__footer">
              <button class="btn btn--secondary" (click)="mode.set('list')">Volver</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 580px; max-width: 95vw; padding: 24px; position: relative; animation: slideUp 0.2s ease-out; }
    .dialog__close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 6px; }
    .dialog__close:hover { color: #374151; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__search { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1.5px solid #E5E7EB; border-radius: 10px; margin-bottom: 16px; }
    .dialog__search-input { border: none; outline: none; flex: 1; font-size: 13px; font-family: inherit; color: #374151; }
    .dialog__search-input::placeholder { color: #9CA3AF; }
    .dialog__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 8px; border-radius: 12px; border: 1.5px solid #E5E7EB; background: #fff; cursor: pointer; font-family: inherit; transition: border-color 0.12s, background 0.12s, transform 0.12s; }
    .card:hover { border-color: #F27920; background: #FFF7ED; transform: translateY(-1px); }
    .card:hover .card__avatar { background: #F27920; color: #fff; }
    .card:active { transform: translateY(0); }
    .card__avatar { width: 40px; height: 40px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: background 0.12s, color 0.12s; }
    .card__nombre { font-size: 12px; font-weight: 600; color: #1a1a1a; text-align: center; }
    .card__detalle { font-size: 10px; color: #9CA3AF; text-align: center; }
    .dialog__footer { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
    .btn--secondary { border: 1.5px solid #E5E7EB; background: #fff; color: #374151; }
    .btn--secondary:hover { background: #F9FAFB; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }
    .btn--confirm:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn--ghost { border: none; background: none; color: #9CA3AF; text-decoration: underline; padding: 10px 12px; }
    .btn--ghost:hover { color: #6B7280; }

    /* Nuevo form */
    .nuevo-form { margin-bottom: 20px; }
    .nuevo-form__row { display: flex; gap: 12px; margin-bottom: 12px; }
    .nuevo-form__field { flex: 1; margin-bottom: 12px; }
    .nuevo-form__field--lg { flex: 2; }
    .nuevo-form__label { display: block; font-size: 11px; font-weight: 600; color: #6B7280; margin-bottom: 4px; }
    .nuevo-form__input {
      width: 100%; padding: 9px 12px; border: 1.5px solid #E5E7EB; border-radius: 8px;
      font-size: 13px; font-family: inherit; color: #374151; outline: none; box-sizing: border-box;
    }
    .nuevo-form__input:focus { border-color: #F27920; }
    .nuevo-form__input::placeholder { color: #D1D5DB; }

    /* QR scan mock */
    .qr-scan {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      padding: 20px 0 24px;
    }
    .qr-scan__frame {
      position: relative;
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: repeating-linear-gradient(45deg, #F8FAFC, #F8FAFC 8px, #F1F5F9 8px, #F1F5F9 16px);
      border-radius: 16px;
      overflow: hidden;
    }
    .qr-scan__corner {
      position: absolute;
      width: 26px;
      height: 26px;
      border: 3px solid #F27920;
    }
    .qr-scan__corner--tl { top: 10px; left: 10px; border-right: none; border-bottom: none; border-top-left-radius: 8px; }
    .qr-scan__corner--tr { top: 10px; right: 10px; border-left: none; border-bottom: none; border-top-right-radius: 8px; }
    .qr-scan__corner--bl { bottom: 10px; left: 10px; border-right: none; border-top: none; border-bottom-left-radius: 8px; }
    .qr-scan__corner--br { bottom: 10px; right: 10px; border-left: none; border-top: none; border-bottom-right-radius: 8px; }
    .qr-scan__laser {
      position: absolute;
      left: 18px;
      right: 18px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #F27920, transparent);
      box-shadow: 0 0 10px rgba(242, 121, 32, 0.6);
      animation: laser 2s ease-in-out infinite;
    }
    .qr-scan__icon {
      opacity: 0.3;
    }
    .qr-scan__text {
      text-align: center;
      max-width: 360px;
    }
    .qr-scan__title {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 6px;
    }
    .qr-scan__desc {
      font-size: 12px;
      color: #6B7280;
      margin: 0;
      line-height: 1.5;
    }

    @keyframes laser {
      0% { top: 20px; opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { top: 160px; opacity: 0; }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ClienteDialogComponent {
  confirmar = output<string>();
  cancelar = output<void>();
  readonly mode = signal<DialogMode>('list');

  readonly clientes = signal<Cliente[]>([
    { id: 'c1', nombre: 'Juan Carlos Lali', avatar: '👤', detalle: 'Av. Corrientes 1234' },
    { id: 'c2', nombre: 'María González', avatar: '👤', detalle: 'Palermo' },
    { id: 'c3', nombre: 'Pedro Martínez', avatar: '👤', detalle: 'Av. Libertador 5500' },
    { id: 'c4', nombre: 'José Rodríguez', avatar: '👤', detalle: 'San Telmo' },
    { id: 'c5', nombre: 'Pedro Gimenez', avatar: '👤', detalle: 'Recoleta' },
    { id: 'c6', nombre: 'Laura Sanchez', avatar: '👤', detalle: 'Belgrano R' },
  ]);

  onCrearCliente(nombre: string): void {
    const id = 'c-new-' + Date.now();
    this.clientes.update(list => [...list, { id, nombre: nombre || 'Nuevo Cliente', avatar: '👤', detalle: 'Nuevo' }]);
    this.confirmar.emit(id);
  }
}
