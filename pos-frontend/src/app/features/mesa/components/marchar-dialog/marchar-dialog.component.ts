import { Component, input, signal, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { ItemPedido } from '../../models/mesa-pedido.model';

export interface MarcharResult {
  itemIds: string[];
  nota: string;
}

@Component({
  selector: 'app-marchar-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog__head">
          <div class="dialog__head-left">
            <div>
              <h3 class="dialog__title">Marchar</h3>
              <p class="dialog__sub">{{ pedidoLabel() }}</p>
            </div>
          </div>
          <button class="dialog__close" (click)="cancelar.emit()" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="dialog__meta">
          <div>
            <div class="dialog__meta-label">Mesa</div>
            <div class="dialog__meta-value">{{ mesaLabel() }}</div>
          </div>
          <div>
            <div class="dialog__meta-label">Mozo</div>
            <div class="dialog__meta-value">{{ mozoLabel() }}</div>
          </div>
        </div>

        <div class="dialog__body">
          <div class="dialog__section-label">
            Items del pedido <span class="dialog__items-count">({{ items().length }})</span>
          </div>
          <div class="dialog__items">
            @for (it of items(); track it.id; let last = $last) {
              <div class="item-row" [class.item-row--marchado]="isMarchado(it.id)" [class.item-row--last]="last">
                <div class="item-row__qty">{{ it.cantidad }}</div>
                <div class="item-row__name">{{ it.nombre }}</div>
                <button class="item-row__btn" [class.item-row__btn--active]="isMarchado(it.id)" (click)="toggle(it.id)" type="button">
                  {{ isMarchado(it.id) ? 'Marchado' : 'Marchar' }}
                </button>
              </div>
            }
            @if (items().length === 0) {
              <div class="dialog__empty">No hay items para marchar</div>
            }
          </div>

          <div class="dialog__section-label dialog__section-label--mt">
            Nota para cocina <span class="dialog__optional">(opcional)</span>
          </div>
          <textarea
            class="dialog__textarea"
            placeholder="Ej: Sin cebolla, término medio..."
            maxlength="150"
            [value]="note()"
            (input)="onNoteInput($event)"
          ></textarea>
          <div class="dialog__char-count">{{ note().length }}/150</div>
        </div>

        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()" type="button">Cancelar</button>
          <button class="btn btn--confirm" (click)="onMarcharTodo()" type="button">Marchar todo</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 200; animation: fadeIn 0.15s ease-out; padding: 16px;
    }
    .dialog {
      background: #fff;
      border-radius: 16px;
      width: 520px; max-width: 100%;
      max-height: 90vh; overflow-y: auto;
      animation: slideUp 0.2s ease-out;
      font-family: inherit;
      color: #1a1a1a;
    }

    /* Head */
    .dialog__head {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; padding: 22px 24px 16px;
    }
    .dialog__head-left { display: flex; align-items: center; gap: 12px; }
    .dialog__head-icon { font-size: 26px; line-height: 1; }
    .dialog__title {
      font-size: 18px; font-weight: 700; color: #1a1a1a;
      margin: 0;
    }
    .dialog__sub {
      margin: 2px 0 0;
      font-size: 13px; color: #6B7280; font-weight: 500;
    }
    .dialog__close {
      width: 32px; height: 32px; border-radius: 8px;
      border: none; background: #F3F4F6; color: #6B7280;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.12s;
    }
    .dialog__close:hover { background: #E5E7EB; color: #1a1a1a; }

    /* Meta */
    .dialog__meta {
      margin: 0 24px;
      padding: 14px 18px;
      background: #FAFAFA;
      border: 1px solid #F1F5F9;
      border-radius: 12px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    .dialog__meta-label {
      font-size: 11px; color: #9CA3AF; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.4px;
      margin-bottom: 4px;
    }
    .dialog__meta-value {
      font-size: 14px; color: #1a1a1a; font-weight: 700;
    }

    /* Body */
    .dialog__body { padding: 20px 24px 16px; }
    .dialog__section-label {
      font-size: 11px; font-weight: 700; color: #6B7280;
      text-transform: uppercase; letter-spacing: 0.5px;
      display: block;
    }
    .dialog__section-label--mt { margin-top: 18px; margin-bottom: 8px; }
    .dialog__items-count { color: #9CA3AF; font-weight: 600; text-transform: none; }
    .dialog__optional { color: #9CA3AF; font-weight: 500; text-transform: none; letter-spacing: 0; }
    .dialog__items { display: flex; flex-direction: column; margin-top: 8px; }

    .item-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #F3F4F6;
      transition: opacity 0.15s;
    }
    .item-row--last { border-bottom: none; }
    .item-row--marchado { opacity: 0.55; }
    .item-row--marchado .item-row__name { text-decoration: line-through; color: #9CA3AF; }
    .item-row__qty {
      width: 26px; height: 26px; border-radius: 50%;
      background: #FFF7ED;
      color: #F27920;
      display: grid; place-items: center;
      font-size: 13px; font-weight: 700;
      flex-shrink: 0;
    }
    .item-row__name {
      flex: 1;
      font-size: 14px; font-weight: 600; color: #1a1a1a;
    }
    .item-row__btn {
      cursor: pointer;
      padding: 6px 14px; border-radius: 999px;
      border: 1.5px solid #E5E7EB;
      background: #fff; color: #6B7280;
      font-size: 12px; font-weight: 600; font-family: inherit;
      transition: all 0.15s;
    }
    .item-row__btn:hover { border-color: #F27920; color: #F27920; background: #FFF7ED; }
    .item-row__btn--active {
      border-color: #F27920; background: #FFF7ED; color: #F27920;
    }

    .dialog__empty {
      padding: 24px; text-align: center;
      color: #9CA3AF; font-size: 13px;
    }

    /* Textarea */
    .dialog__textarea {
      width: 100%;
      min-height: 80px;
      padding: 12px 14px;
      border: 1.5px solid #E5E7EB;
      border-radius: 10px;
      font-size: 14px;
      color: #374151;
      background: #fff;
      resize: vertical;
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .dialog__textarea:focus { border-color: #F27920; }
    .dialog__textarea::placeholder { color: #9CA3AF; }
    .dialog__char-count {
      text-align: right;
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 4px;
      font-weight: 500;
    }

    /* Footer */
    .dialog__footer {
      padding: 16px 24px 22px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      padding: 10px 24px; border-radius: 10px;
      font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: inherit;
      transition: background 0.15s;
    }
    .btn--cancel {
      border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280;
    }
    .btn--cancel:hover { background: #F9FAFB; }
    .btn--confirm {
      border: none; background: #F27920; color: #fff;
    }
    .btn--confirm:hover { background: #E06D15; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class MarcharDialogComponent {
  items = input.required<ItemPedido[]>();
  mesaLabel = input<string>('—');
  mozoLabel = input<string>('Sin asignar');
  pedidoLabel = input<string>('Pedido');

  confirmar = output<MarcharResult>();
  cancelar = output<void>();

  readonly note = signal('');
  readonly marchadosLocal = signal<Set<string>>(new Set());

  readonly hayAlgunoMarchado = computed(() => this.marchadosLocal().size > 0);

  isMarchado(id: string): boolean {
    return this.marchadosLocal().has(id);
  }

  toggle(id: string): void {
    this.marchadosLocal.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  onNoteInput(event: Event): void {
    this.note.set((event.target as HTMLTextAreaElement).value);
  }

  onMarcharTodo(): void {
    const ids = this.items().map(i => i.id);
    this.confirmar.emit({ itemIds: ids, nota: this.note().trim() });
  }
}
