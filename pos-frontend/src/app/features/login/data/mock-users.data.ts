import { PosUser } from '../../../core/models';

/** PIN de prueba para todos los usuarios: 0000 */
export const MOCK_PIN = '0000';

export const MOCK_USERS: PosUser[] = [
  { id: '1', nombre: 'Andrea', tipo: 'MOZO', avatar: '🍽️', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '2', nombre: 'Federico', tipo: 'CAJERO', avatar: '💰', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '3', nombre: 'Carmela', tipo: 'COCINERO', avatar: '👨‍🍳', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '4', nombre: 'Marcos', tipo: 'MOZO', avatar: '🍽️', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '5', nombre: 'Lucía', tipo: 'CAJERO', avatar: '💰', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '6', nombre: 'Juan', tipo: 'COCINERO', avatar: '👨‍🍳', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '7', nombre: 'Lucas', tipo: 'MOZO', avatar: '🍽️', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '8', nombre: 'Valentina', tipo: 'CAJERO', avatar: '💰', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '9', nombre: 'Matías', tipo: 'COCINERO', avatar: '👨‍🍳', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '10', nombre: 'Sofía', tipo: 'MOZO', avatar: '🍽️', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '11', nombre: 'Tomás', tipo: 'CAJERO', avatar: '💰', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
  { id: '12', nombre: 'Camila', tipo: 'COCINERO', avatar: '👨‍🍳', pin: MOCK_PIN, activo: true, bloqueado: false, intentosFallidos: 0 },
];
