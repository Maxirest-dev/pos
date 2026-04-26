import { Component, input, computed, output, ChangeDetectionStrategy } from '@angular/core';

interface Persona {
  id: string;
  nombre: string;
  rol: string;
  avatar: string;
}

@Component({
  selector: 'app-mozo-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <button class="dialog__close" (click)="cancelar.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="dialog__header">
          <h3 class="dialog__title">{{ modoPedido() ? 'Repartidores' : 'Mozos' }}</h3>
        </div>

        <div class="dialog__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" [placeholder]="modoPedido() ? 'Buscar por nombre o zona...' : 'Buscar por nombre, turno o cobertura...'" class="dialog__search-input" />
        </div>

        <div class="dialog__grid">
          @for (p of personas(); track p.id) {
            <button class="card" (click)="confirmar.emit(p.id)">
              <span class="card__avatar">{{ p.avatar }}</span>
              <span class="card__nombre">{{ p.nombre }}</span>
              <span class="card__rol">{{ p.rol }}</span>
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.12s ease-out; }
    .dialog { background: #fff; border-radius: 16px; width: 560px; max-width: 95vw; padding: 24px; position: relative; animation: slideUp 0.2s ease-out; }
    .dialog__close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 6px; }
    .dialog__close:hover { color: #374151; }
    .dialog__header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .dialog__icon { font-size: 24px; }
    .dialog__title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
    .dialog__search { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1.5px solid #E5E7EB; border-radius: 10px; margin-bottom: 16px; }
    .dialog__search-input { border: none; outline: none; flex: 1; font-size: 13px; font-family: inherit; color: #374151; }
    .dialog__search-input::placeholder { color: #9CA3AF; }
    .dialog__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 8px; border-radius: 12px; border: 1.5px solid #E5E7EB; background: #fff; cursor: pointer; font-family: inherit; transition: border-color 0.12s, background 0.12s, transform 0.1s; }
    .card:hover { border-color: #F27920; background: #FFF7ED; }
    .card:active { transform: scale(0.97); }
    .card__avatar { width: 40px; height: 40px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .card__nombre { font-size: 12px; font-weight: 600; color: #1a1a1a; text-align: center; }
    .card__rol { font-size: 10px; color: #9CA3AF; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class MozoDialogComponent {
  modoPedido = input<boolean>(false);
  confirmar = output<string>();
  cancelar = output<void>();

  private readonly mozos: Persona[] = [
    { id: 'm1', nombre: 'Carlos Méndez', rol: 'Mozo', avatar: '🍽️' },
    { id: 'm2', nombre: 'María López', rol: 'Moza', avatar: '🍽️' },
    { id: 'm3', nombre: 'Roberto Gentile', rol: 'Mozo', avatar: '🍽️' },
    { id: 'm4', nombre: 'Marta López', rol: 'Moza', avatar: '🍽️' },
    { id: 'm5', nombre: 'Diego Hernández', rol: 'Mozo', avatar: '🍽️' },
    { id: 'm6', nombre: 'Julia Ramirez', rol: 'Moza', avatar: '🍽️' },
    { id: 'm7', nombre: 'Pablo Sánchez', rol: 'Mozo', avatar: '🍽️' },
    { id: 'm8', nombre: 'Laura Torres', rol: 'Moza', avatar: '🍽️' },
  ];

  private readonly repartidores: Persona[] = [
    { id: 'r1', nombre: 'Martín Ruiz', rol: 'Moto', avatar: '🛵' },
    { id: 'r2', nombre: 'Facundo Pérez', rol: 'Bici', avatar: '🚲' },
    { id: 'r3', nombre: 'Nicolás Gómez', rol: 'Moto', avatar: '🛵' },
    { id: 'r4', nombre: 'Agustín Díaz', rol: 'Auto', avatar: '🚗' },
    { id: 'r5', nombre: 'Tomás Fernández', rol: 'Moto', avatar: '🛵' },
    { id: 'r6', nombre: 'Luciano Castro', rol: 'Bici', avatar: '🚲' },
  ];

  readonly personas = computed(() => this.modoPedido() ? this.repartidores : this.mozos);
}
