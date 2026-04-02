import { Component, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-observacion-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog__header">
          <span class="dialog__icon">📝</span>
          <h3 class="dialog__title">Observaciones</h3>
        </div>
        <textarea class="dialog__textarea" placeholder="Agregar nota..." rows="4" #obs></textarea>
        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()">Cancelar</button>
          <button class="btn btn--confirm" (click)="confirmar.emit(obs.value)">Aceptar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 440px; max-width: 95vw; padding: 24px; animation: slideUp 0.2s ease-out; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__textarea { width: 100%; padding: 12px; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 14px; font-family: inherit; color: #374151; outline: none; resize: vertical; margin-bottom: 20px; box-sizing: border-box; }
    .dialog__textarea:focus { border-color: #F27920; }
    .dialog__textarea::placeholder { color: #9CA3AF; }
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
export class ObservacionDialogComponent {
  confirmar = output<string>();
  cancelar = output<void>();
}
