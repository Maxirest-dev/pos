import { Injectable, signal, computed } from '@angular/core';

/**
 * Overrides del plano del salón válidos SOLO durante la sesión (en memoria).
 * La configuración estructural permanente vive en el backoffice.
 *
 * - moves: reposiciones aplicadas sobre mesas e items decorativos.
 * - hidden: ids de mesas/items ocultos temporalmente.
 *
 * Al refresh del navegador se pierde todo. Llamar reset() al cerrar turno.
 */
@Injectable({ providedIn: 'root' })
export class SessionPlanoService {
  private readonly _moves = signal<Map<string, { row: number; col: number }>>(new Map());
  private readonly _hidden = signal<Set<string>>(new Set());

  readonly moves = this._moves.asReadonly();
  readonly hidden = this._hidden.asReadonly();
  readonly hasChanges = computed(() => this._moves().size > 0 || this._hidden().size > 0);

  getPosition(itemId: string): { row: number; col: number } | null {
    return this._moves().get(itemId) ?? null;
  }

  setPosition(itemId: string, row: number, col: number): void {
    this._moves.update(m => {
      const next = new Map(m);
      next.set(itemId, { row, col });
      return next;
    });
  }

  /** Intercambia posiciones absolutas entre dos items. */
  swap(idA: string, posA: { row: number; col: number }, idB: string, posB: { row: number; col: number }): void {
    this._moves.update(m => {
      const next = new Map(m);
      next.set(idA, posB);
      next.set(idB, posA);
      return next;
    });
  }

  isHidden(itemId: string): boolean {
    return this._hidden().has(itemId);
  }

  toggleHidden(itemId: string): void {
    this._hidden.update(s => {
      const next = new Set(s);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  resetSalon(): void {
    this._moves.set(new Map());
    this._hidden.set(new Set());
  }
}
