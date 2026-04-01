export type UserType = 'MOZO' | 'CAJERO' | 'COCINERO';

export interface PosUser {
  id: string;
  nombre: string;
  tipo: UserType;
  avatar: string;
  pin: string;
  activo: boolean;
  bloqueado: boolean;
  intentosFallidos: number;
}

export const USER_TYPE_LABELS: Record<UserType, string> = {
  MOZO: 'Mozo',
  CAJERO: 'Cajero',
  COCINERO: 'Cocinero',
};

export const USER_TYPE_AVATARS: Record<UserType, string> = {
  MOZO: '🍽️',
  CAJERO: '💰',
  COCINERO: '👨‍🍳',
};
