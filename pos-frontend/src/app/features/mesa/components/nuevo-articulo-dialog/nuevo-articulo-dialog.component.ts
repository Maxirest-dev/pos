import { Component, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-nuevo-articulo-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog__header">
          <span class="dialog__icon">🍽️</span>
          <div>
            <h3 class="dialog__title">Nuevo Artículo</h3>
            <p class="dialog__subtitle">Agregar un artículo o pedido</p>
          </div>
        </div>

        <div class="dialog__row">
          <div class="dialog__field dialog__field--sm">
            <label class="dialog__label">Cantidad</label>
            <input type="number" class="dialog__input" value="1" min="1" />
          </div>
          <div class="dialog__field dialog__field--lg">
            <label class="dialog__label">Detalle</label>
            <input type="text" class="dialog__input" placeholder="Nombre del artículo" />
          </div>
          <div class="dialog__field dialog__field--md">
            <label class="dialog__label">Precio Unitario</label>
            <input type="text" class="dialog__input" placeholder="$0.00" />
          </div>
        </div>

        <div class="dialog__field">
          <label class="dialog__label">Estación de trabajo</label>
          <select class="dialog__select">
            <option value="">Seleccionar...</option>
            <option value="cocina">Cocina</option>
            <option value="parrilla">Parrilla</option>
            <option value="barra">Barra</option>
            <option value="pasteleria">Pastelería</option>
            <option value="despacho">Despacho</option>
          </select>
        </div>

        <div class="dialog__field">
          <label class="dialog__label">Especificaciones</label>
          <textarea class="dialog__textarea" placeholder="Notas adicionales..." rows="3"></textarea>
        </div>

        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" (click)="confirmar.emit()">Aceptar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 500px; max-width: 95vw; padding: 24px; animation: slideUp 0.2s ease-out; }
    .dialog__header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .dialog__icon { font-size: 32px; background: #FFF7ED; width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__subtitle { font-size: 12px; color: #9CA3AF; margin: 2px 0 0 0; }
    .dialog__row { display: flex; gap: 12px; margin-bottom: 14px; }
    .dialog__field { margin-bottom: 14px; }
    .dialog__field--sm { width: 70px; flex-shrink: 0; }
    .dialog__field--md { width: 130px; flex-shrink: 0; }
    .dialog__field--lg { flex: 1; }
    .dialog__label { display: block; font-size: 11px; font-weight: 600; color: #6B7280; margin-bottom: 4px; }
    .dialog__input, .dialog__select, .dialog__textarea {
      width: 100%; padding: 8px 12px; border: 1.5px solid #E5E7EB; border-radius: 8px;
      font-size: 13px; font-family: inherit; color: #374151; outline: none; box-sizing: border-box;
    }
    .dialog__input:focus, .dialog__select:focus, .dialog__textarea:focus { border-color: #F27920; }
    .dialog__input::placeholder, .dialog__textarea::placeholder { color: #D1D5DB; }
    .dialog__select { background: #fff; appearance: auto; }
    .dialog__textarea { resize: vertical; }
    .dialog__footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
    .btn { padding: 10px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--cancel { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--cancel:hover { background: #F9FAFB; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class NuevoArticuloDialogComponent {
  confirmar = output<void>();
  cancelar = output<void>();
}
