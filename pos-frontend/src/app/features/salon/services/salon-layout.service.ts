import { Injectable, signal, computed, effect } from '@angular/core';
import { CanalVentaTipo } from '../models/salon.model';

export type MainView = 'salon' | CanalVentaTipo;

const STORAGE_KEY = 'pos.salon.mainView';

/**
 * Controla qué ocupa el "escenario principal" de la vista /salon.
 * Por defecto es 'salon' (plano de mesas). Cualquier canal de venta
 * puede tomar el escenario, dejando el Salón como item reducido en el lateral.
 * Persistencia en sessionStorage: se mantiene mientras dure la pestaña;
 * se pierde al refresh / cerrar turno (via reset).
 */
@Injectable({ providedIn: 'root' })
export class SalonLayoutService {
  readonly mainView = signal<MainView>(this.readInitial());
  readonly isMainSalon = computed(() => this.mainView() === 'salon');

  constructor() {
    effect(() => {
      const v = this.mainView();
      try { sessionStorage.setItem(STORAGE_KEY, v); } catch {}
    });
  }

  setMain(v: MainView): void { this.mainView.set(v); }
  reset(): void { this.mainView.set('salon'); }

  private readInitial(): MainView {
    try {
      const v = sessionStorage.getItem(STORAGE_KEY);
      if (v === 'salon' || v === 'DELIVERY' || v === 'MOSTRADOR' || v === 'PEDIDOS_YA' || v === 'RAPPI') {
        return v;
      }
    } catch {}
    return 'salon';
  }
}
