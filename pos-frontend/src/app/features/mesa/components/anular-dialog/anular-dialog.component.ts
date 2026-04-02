import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-anular-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog__header">
          <span class="dialog__icon">🚫</span>
          <h3 class="dialog__title">Anular</h3>
        </div>
        <p class="dialog__msg">Vas a Anular el artículo <strong>{{ itemNombre() }}</strong> de la mesa. ¿Querés continuar?</p>
        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" (click)="confirmar.emit()">Aceptar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 420px; max-width: 95vw; padding: 24px; animation: slideUp 0.2s ease-out; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__msg { font-size: 14px; color: #374151; margin: 0 0 24px 0; line-height: 1.5; }
    .dialog__msg strong { color: #1a1a1a; }
    .dialog__footer { display: flex; justify-content: flex-end; gap: 10px; }
    .btn { padding: 10px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn--cancel { border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; }
    .btn--cancel:hover { background: #F9FAFB; }
    .btn--confirm { border: none; background: #F27920; color: #fff; }
    .btn--confirm:hover { background: #E06D15; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class AnularDialogComponent {
  itemNombre = input.required<string>();
  confirmar = output<void>();
  cancelar = output<void>();
}
