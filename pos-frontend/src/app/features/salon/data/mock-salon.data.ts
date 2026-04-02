import { Salon, Mesa, CanalVenta, PedidoCanal } from '../models/salon.model';

export const MOCK_SALONES: Salon[] = [
  {
    // Vereda: mesas a lo largo de la fachada, 2 filas pegadas a la calle
    id: 'sal-1',
    nombre: 'VEREDA',
    filas: 3,
    columnas: 5,
    mesas: [
      // Fila 1 - pegada a la calle
      { id: 'm-v1', numero: 1, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 1 },
      { id: 'm-v2', numero: 2, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 2, mozo: 'Andrea', comensales: 2, horaOcupacion: '20:15', minutosOcupada: 45, montoActual: 8500 },
      { id: 'm-v3', numero: 3, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 3 },
      { id: 'm-v4', numero: 4, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 4, mozo: 'Lucas', comensales: 2, horaOcupacion: '20:40', minutosOcupada: 20, montoActual: 6200 },
      { id: 'm-v5', numero: 5, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 5 },
      // Fila 2 - contra la pared
      { id: 'm-v6', numero: 6, estado: 'RESERVADA', capacidad: 4, salonId: 'sal-1', gridRow: 2, gridCol: 1 },
      { id: 'm-v7', numero: 7, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-1', gridRow: 2, gridCol: 2 },
      { id: 'm-v8', numero: 8, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-1', gridRow: 2, gridCol: 4, mozo: 'Andrea', comensales: 3, horaOcupacion: '19:50', minutosOcupada: 70, montoActual: 18900 },
      { id: 'm-v9', numero: 9, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-1', gridRow: 2, gridCol: 5 },
      // Fila 3 - rincon
      { id: 'm-v10', numero: 10, estado: 'DISPONIBLE', capacidad: 6, salonId: 'sal-1', gridRow: 3, gridCol: 1 },
      { id: 'm-v11', numero: 11, estado: 'OCUPADA', capacidad: 6, salonId: 'sal-1', gridRow: 3, gridCol: 4, mozo: 'Lucas', comensales: 5, horaOcupacion: '20:00', minutosOcupada: 60, montoActual: 31400 },
    ],
  },
  {
    // Principal: salon grande con pasillo central, mesas distribuidas en L
    id: 'sal-2',
    nombre: 'PRINCIPAL',
    filas: 4,
    columnas: 10,
    mesas: [
      // Fila 1 - ventana lateral izquierda
      { id: 'm-p1', numero: 1, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 1 },
      { id: 'm-p3', numero: 3, estado: 'OCUPADA', capacidad: 6, salonId: 'sal-2', gridRow: 1, gridCol: 3, mozo: 'Marcos', comensales: 4, horaOcupacion: '20:30', minutosOcupada: 21, montoActual: 18700 },
      { id: 'm-p4', numero: 4, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 4 },
      { id: 'm-p5', numero: 5, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-2', gridRow: 1, gridCol: 5 },
      { id: 'm-p7', numero: 7, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 7, mozo: 'Andrea', comensales: 2, horaOcupacion: '20:50', minutosOcupada: 10, montoActual: 8400 },
      { id: 'm-p27', numero: 27, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-2', gridRow: 1, gridCol: 8 },
      { id: 'm-p28', numero: 28, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 9, mozo: 'Lucía', comensales: 3, horaOcupacion: '20:15', minutosOcupada: 45, montoActual: 19800 },
      { id: 'm-p29', numero: 29, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 10 },
      // Fila 2 - zona central
      { id: 'm-p8', numero: 8, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-2', gridRow: 2, gridCol: 1 },
      { id: 'm-p10', numero: 10, estado: 'RESERVADA', capacidad: 6, salonId: 'sal-2', gridRow: 2, gridCol: 3 },
      { id: 'm-p11', numero: 11, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 2, gridCol: 4, mozo: 'Marcos', comensales: 4, horaOcupacion: '20:00', minutosOcupada: 51, montoActual: 24300 },
      { id: 'm-p12', numero: 12, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 2, gridCol: 5 },
      { id: 'm-p14', numero: 14, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-2', gridRow: 2, gridCol: 7, mozo: 'Andrea', comensales: 2, horaOcupacion: '21:05', minutosOcupada: 5, montoActual: 2800 },
      { id: 'm-p30', numero: 30, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 2, gridCol: 8 },
      { id: 'm-p31', numero: 31, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-2', gridRow: 2, gridCol: 9, mozo: 'Marcos', comensales: 2, horaOcupacion: '21:10', minutosOcupada: 3, montoActual: 1500 },
      { id: 'm-p32', numero: 32, estado: 'RESERVADA', capacidad: 4, salonId: 'sal-2', gridRow: 2, gridCol: 10 },
      // Fila 3 - junto a la barra
      { id: 'm-p15', numero: 15, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 3, gridCol: 1, mozo: 'Lucas', comensales: 4, horaOcupacion: '20:10', minutosOcupada: 40, montoActual: 22600 },
      { id: 'm-p16', numero: 16, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 3, gridCol: 2 },
      { id: 'm-p17', numero: 17, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-2', gridRow: 3, gridCol: 3 },
      { id: 'm-p34', numero: 34, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 3, gridCol: 9, mozo: 'Lucía', comensales: 4, horaOcupacion: '19:55', minutosOcupada: 55, montoActual: 27300 },
      // Fila 4 - fondo / privado
      { id: 'm-p21', numero: 21, estado: 'DISPONIBLE', capacidad: 8, salonId: 'sal-2', gridRow: 4, gridCol: 1 },
      { id: 'm-p22', numero: 22, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 4, gridCol: 2, mozo: 'Andrea', comensales: 4, horaOcupacion: '19:30', minutosOcupada: 80, montoActual: 41200 },
      { id: 'm-p23', numero: 23, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 4, gridCol: 3 },
      { id: 'm-p25', numero: 25, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 4, gridCol: 6, mozo: 'Lucas', comensales: 2, horaOcupacion: '21:00', minutosOcupada: 8, montoActual: 4500 },
      { id: 'm-p26', numero: 26, estado: 'DISPONIBLE', capacidad: 8, salonId: 'sal-2', gridRow: 4, gridCol: 7 },
    ],
  },
  {
    // Terraza: espacio abierto arriba, mesas mas espaciadas
    id: 'sal-3',
    nombre: 'TERRAZA',
    filas: 3,
    columnas: 4,
    mesas: [
      // Fila 1 - baranda
      { id: 'm-t1', numero: 1, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-3', gridRow: 1, gridCol: 1 },
      { id: 'm-t2', numero: 2, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-3', gridRow: 1, gridCol: 2, mozo: 'Lucía', comensales: 2, horaOcupacion: '21:10', minutosOcupada: 5, montoActual: 3200 },
      { id: 'm-t3', numero: 3, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-3', gridRow: 1, gridCol: 3 },
      { id: 'm-t4', numero: 4, estado: 'RESERVADA', capacidad: 2, salonId: 'sal-3', gridRow: 1, gridCol: 4 },
      // Fila 2 - centro
      { id: 'm-t5', numero: 5, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-3', gridRow: 2, gridCol: 1, mozo: 'Lucía', comensales: 4, horaOcupacion: '20:40', minutosOcupada: 35, montoActual: 15800 },
      { id: 'm-t6', numero: 6, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-3', gridRow: 2, gridCol: 2 },
      { id: 'm-t7', numero: 7, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-3', gridRow: 2, gridCol: 3 },
      { id: 'm-t8', numero: 8, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-3', gridRow: 2, gridCol: 4, mozo: 'Lucía', comensales: 3, horaOcupacion: '20:55', minutosOcupada: 15, montoActual: 7600 },
      // Fila 3 - rincon con vista
      { id: 'm-t9', numero: 9, estado: 'DISPONIBLE', capacidad: 6, salonId: 'sal-3', gridRow: 3, gridCol: 1 },
      { id: 'm-t10', numero: 10, estado: 'RESERVADA', capacidad: 8, salonId: 'sal-3', gridRow: 3, gridCol: 3 },
      { id: 'm-t11', numero: 11, estado: 'DISPONIBLE', capacidad: 6, salonId: 'sal-3', gridRow: 3, gridCol: 4 },
    ],
  },
];

export const MOCK_CANALES: CanalVenta[] = [
  {
    tipo: 'DELIVERY',
    label: 'Delivery',
    color: '#F27920',
    colorBg: '#FFF7ED',
    iconColor: '#F27920',
    montoTotal: 55000,
    pedidos: [
      { id: 'del-1', numero: '#12', canalTipo: 'DELIVERY', monto: 28000, estado: 'EN_CURSO', hora: '20:30', minutosDesdeCreacion: 35 },
      { id: 'del-2', numero: '#13', canalTipo: 'DELIVERY', monto: 27000, estado: 'LISTO', hora: '20:45', minutosDesdeCreacion: 20 },
    ],
  },
  {
    tipo: 'MOSTRADOR',
    label: 'Mostrador',
    color: '#3B82F6',
    colorBg: '#EFF6FF',
    iconColor: '#3B82F6',
    montoTotal: 45500,
    pedidos: [
      { id: 'mos-1', numero: '#5', canalTipo: 'MOSTRADOR', monto: 22500, estado: 'EN_CURSO', hora: '20:50', minutosDesdeCreacion: 15 },
      { id: 'mos-2', numero: '#6', canalTipo: 'MOSTRADOR', monto: 23000, estado: 'EN_CURSO', hora: '21:00', minutosDesdeCreacion: 8 },
    ],
  },
  {
    tipo: 'PEDIDOS_YA',
    label: 'Pedidos Ya',
    color: '#E11D48',
    colorBg: '#FFF1F2',
    iconColor: '#E11D48',
    montoTotal: 38500,
    pedidos: [
      { id: 'py-1', numero: '#7', canalTipo: 'PEDIDOS_YA', monto: 20000, estado: 'EN_CURSO', hora: '20:20', minutosDesdeCreacion: 50 },
      { id: 'py-2', numero: '#8', canalTipo: 'PEDIDOS_YA', monto: 20000, estado: 'EN_CURSO', hora: '20:35', minutosDesdeCreacion: 30 },
      { id: 'py-3', numero: '#10', canalTipo: 'PEDIDOS_YA', monto: 20000, estado: 'LISTO', hora: '20:10', minutosDesdeCreacion: 12 },
      { id: 'py-4', numero: '#7', canalTipo: 'PEDIDOS_YA', monto: 35000, estado: 'EN_CURSO', hora: '21:05', minutosDesdeCreacion: 5 },
    ],
  },
  {
    tipo: 'RAPPI',
    label: 'Rappi',
    color: '#FF5A00',
    colorBg: '#FFF4ED',
    iconColor: '#FF5A00',
    montoTotal: 90000,
    pedidos: [
      { id: 'rap-1', numero: '#3', canalTipo: 'RAPPI', monto: 45000, estado: 'EN_CURSO', hora: '20:15', minutosDesdeCreacion: 48 },
      { id: 'rap-2', numero: '#4', canalTipo: 'RAPPI', monto: 45000, estado: 'LISTO', hora: '20:40', minutosDesdeCreacion: 22 },
    ],
  },
];
