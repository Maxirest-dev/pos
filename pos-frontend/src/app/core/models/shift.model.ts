export type ShiftType = 'MANANA' | 'TARDE' | 'NOCHE';

export interface Shift {
  id: string;
  fecha: string;
  tipo: ShiftType;
  usuarioAperturaId: string;
  usuarioCierreId: string | null;
  horaApertura: string;
  horaCierre: string | null;
  estado: 'ABIERTO' | 'CERRADO';
}

export interface ShiftOption {
  tipo: ShiftType;
  label: string;
  icon: string;
  horario: string;
  horaInicio: string;
  horaFin: string;
}

export const SHIFT_OPTIONS: ShiftOption[] = [
  { tipo: 'MANANA', label: 'Mañana', icon: '☀️', horario: '08:00 - 14:00', horaInicio: '08:00', horaFin: '14:00' },
  { tipo: 'TARDE', label: 'Tarde', icon: '🌤️', horario: '14:00 - 22:00', horaInicio: '14:00', horaFin: '22:00' },
  { tipo: 'NOCHE', label: 'Noche', icon: '🌙', horario: '22:00 - 08:00', horaInicio: '22:00', horaFin: '08:00' },
];
