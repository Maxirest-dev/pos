import { Injectable, signal, computed } from '@angular/core';
import { Shift, ShiftType, SHIFT_OPTIONS } from '../models';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly _activeShift = signal<Shift | null>(null);
  private readonly _selectedDate = signal<Date>(new Date());
  private readonly _selectedShiftType = signal<ShiftType | null>(null);

  readonly activeShift = this._activeShift.asReadonly();
  readonly selectedDate = this._selectedDate.asReadonly();
  readonly selectedShiftType = this._selectedShiftType.asReadonly();
  readonly hasActiveShift = computed(() => this._activeShift() !== null);

  readonly selectedShiftOption = computed(() => {
    const tipo = this._selectedShiftType();
    return tipo ? SHIFT_OPTIONS.find(s => s.tipo === tipo) ?? null : null;
  });

  selectDate(date: Date): void {
    this._selectedDate.set(date);
  }

  selectShiftType(tipo: ShiftType): void {
    this._selectedShiftType.set(tipo);
  }

  openShift(userId: string): Shift {
    const date = this._selectedDate();
    const tipo = this._selectedShiftType()!;
    const option = SHIFT_OPTIONS.find(s => s.tipo === tipo)!;

    const shift: Shift = {
      id: crypto.randomUUID(),
      fecha: date.toISOString().split('T')[0],
      tipo,
      usuarioAperturaId: userId,
      usuarioCierreId: null,
      horaApertura: option.horaInicio,
      horaCierre: null,
      estado: 'ABIERTO',
    };

    this._activeShift.set(shift);
    return shift;
  }

  closeShift(userId: string): void {
    this._activeShift.update(shift => {
      if (!shift) return null;
      return {
        ...shift,
        usuarioCierreId: userId,
        horaCierre: new Date().toTimeString().slice(0, 5),
        estado: 'CERRADO',
      };
    });
    this._activeShift.set(null);
  }

  reset(): void {
    this._selectedDate.set(new Date());
    this._selectedShiftType.set(null);
  }
}
