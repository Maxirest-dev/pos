import { Salon, CanalVenta, PlanoItem } from '../models/salon.model';

// Decorativos por salón. Las mesas NO se duplican acá: se mergean en runtime
// desde Salon.mesas (que contiene el estado + posición).
const ITEMS_VEREDA: PlanoItem[] = [
  // Entrada al local en la esquina izquierda (fila 0)
  { id: 'dec-v-ent', tipo: 'entrada', row: 0, col: 0, rowSpan: 1, colSpan: 1 },
  // Plantas flanqueando la entrada
  { id: 'dec-v-pl1', tipo: 'planta', row: 2, col: 2, rowSpan: 1, colSpan: 1 },
  { id: 'dec-v-pl2', tipo: 'planta', row: 2, col: 4, rowSpan: 1, colSpan: 1 },
];

const ITEMS_PRINCIPAL: PlanoItem[] = [
  // Barra horizontal en la fila 2 (centro), cols 5-6
  { id: 'dec-p-bar', tipo: 'barra', row: 2, col: 5, rowSpan: 1, colSpan: 2 },
  // Caja junto a la barra
  { id: 'dec-p-cja', tipo: 'caja', row: 2, col: 4, rowSpan: 1, colSpan: 1 },
  // Baños en el fondo
  { id: 'dec-p-bno', tipo: 'bano', row: 3, col: 4, rowSpan: 1, colSpan: 1 },
  // Entrada
  { id: 'dec-p-ent', tipo: 'entrada', row: 0, col: 5, rowSpan: 1, colSpan: 1 },
  // Plantas decorativas
  { id: 'dec-p-pl1', tipo: 'planta', row: 0, col: 1, rowSpan: 1, colSpan: 1 },
  { id: 'dec-p-pl2', tipo: 'planta', row: 3, col: 9, rowSpan: 1, colSpan: 1 },
  // Pared divisoria vertical entre zona central y fondo
  { id: 'dec-p-par1', tipo: 'pared', row: 2, col: 7, rowSpan: 1, colSpan: 1, orientacion: 'vertical' },
];

const ITEMS_TERRAZA: PlanoItem[] = [
  // Plantas (baranda verde) en celdas libres del fondo y costado
  { id: 'dec-t-pl1', tipo: 'planta', row: 3, col: 0, rowSpan: 1, colSpan: 1 },
  { id: 'dec-t-pl2', tipo: 'planta', row: 2, col: 1, rowSpan: 1, colSpan: 1 },
  { id: 'dec-t-pl3', tipo: 'planta', row: 3, col: 2, rowSpan: 1, colSpan: 1 },
  // Pared curva en una esquina (rincon con vista)
  { id: 'dec-t-par1', tipo: 'pared', row: 0, col: 9, rowSpan: 1, colSpan: 1, orientacion: 'curva', curvaRotacion: 0 },
];

export const MOCK_SALONES: Salon[] = [
  {
    id: 'sal-1',
    nombre: 'VEREDA',
    filas: 4,
    columnas: 10,
    piso: 'porcelanato',
    items: ITEMS_VEREDA,
    mesas: [
      { id: 'm-v1', numero: 1, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 1, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-v2', numero: 2, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 2, forma: 'circular', tamano: 'pequeno', mozo: 'Andrea', comensales: 2, horaOcupacion: '20:15', minutosOcupada: 45, montoActual: 8500 },
      { id: 'm-v3', numero: 3, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 3, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-v4', numero: 4, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 4, forma: 'circular', tamano: 'pequeno', mozo: 'Lucas', comensales: 2, horaOcupacion: '20:40', minutosOcupada: 20, montoActual: 6200 },
      { id: 'm-v5', numero: 5, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-1', gridRow: 1, gridCol: 5, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-v6', numero: 6, estado: 'RESERVADA', capacidad: 4, salonId: 'sal-1', gridRow: 2, gridCol: 1 },
      { id: 'm-v7', numero: 7, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-1', gridRow: 2, gridCol: 2 },
      { id: 'm-v8', numero: 8, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-1', gridRow: 2, gridCol: 4, mozo: 'Andrea', comensales: 3, horaOcupacion: '19:50', minutosOcupada: 70, montoActual: 18900 },
      { id: 'm-v9', numero: 9, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-1', gridRow: 2, gridCol: 5 },
      { id: 'm-v10', numero: 10, estado: 'DISPONIBLE', capacidad: 6, salonId: 'sal-1', gridRow: 3, gridCol: 1 },
      { id: 'm-v11', numero: 11, estado: 'OCUPADA', capacidad: 6, salonId: 'sal-1', gridRow: 3, gridCol: 4, mozo: 'Lucas', comensales: 5, horaOcupacion: '20:00', minutosOcupada: 60, montoActual: 31400 },
    ],
  },
  {
    id: 'sal-2',
    nombre: 'PRINCIPAL',
    filas: 4,
    columnas: 10,
    piso: 'madera',
    items: ITEMS_PRINCIPAL,
    mesas: [
      { id: 'm-p1', numero: 1, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 1 },
      { id: 'm-p3', numero: 3, estado: 'OCUPADA', capacidad: 6, salonId: 'sal-2', gridRow: 1, gridCol: 3, mozo: 'Marcos', comensales: 4, horaOcupacion: '20:30', minutosOcupada: 21, montoActual: 18700 },
      { id: 'm-p4', numero: 4, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 4 },
      { id: 'm-p5', numero: 5, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-2', gridRow: 1, gridCol: 5, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-p7', numero: 7, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 7, mozo: 'Andrea', comensales: 2, horaOcupacion: '20:50', minutosOcupada: 10, montoActual: 8400 },
      { id: 'm-p27', numero: 27, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-2', gridRow: 1, gridCol: 8, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-p28', numero: 28, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 9, mozo: 'Lucía', comensales: 3, horaOcupacion: '20:15', minutosOcupada: 45, montoActual: 19800 },
      { id: 'm-p29', numero: 29, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 1, gridCol: 10 },
      { id: 'm-p8', numero: 8, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-2', gridRow: 2, gridCol: 1, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-p10', numero: 10, estado: 'RESERVADA', capacidad: 6, salonId: 'sal-2', gridRow: 2, gridCol: 3 },
      { id: 'm-p11', numero: 11, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 2, gridCol: 4, mozo: 'Marcos', comensales: 4, horaOcupacion: '20:00', minutosOcupada: 51, montoActual: 24300 },
      { id: 'm-p14', numero: 14, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-2', gridRow: 2, gridCol: 8, forma: 'circular', tamano: 'pequeno', mozo: 'Andrea', comensales: 2, horaOcupacion: '21:05', minutosOcupada: 5, montoActual: 2800 },
      { id: 'm-p31', numero: 31, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-2', gridRow: 2, gridCol: 9, forma: 'circular', tamano: 'pequeno', mozo: 'Marcos', comensales: 2, horaOcupacion: '21:10', minutosOcupada: 3, montoActual: 1500 },
      { id: 'm-p32', numero: 32, estado: 'RESERVADA', capacidad: 4, salonId: 'sal-2', gridRow: 2, gridCol: 10 },
      { id: 'm-p15', numero: 15, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 3, gridCol: 1, mozo: 'Lucas', comensales: 4, horaOcupacion: '20:10', minutosOcupada: 40, montoActual: 22600 },
      { id: 'm-p16', numero: 16, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 3, gridCol: 2 },
      { id: 'm-p17', numero: 17, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-2', gridRow: 3, gridCol: 3, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-p34', numero: 34, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 3, gridCol: 9, mozo: 'Lucía', comensales: 4, horaOcupacion: '19:55', minutosOcupada: 55, montoActual: 27300 },
      { id: 'm-p21', numero: 21, estado: 'DISPONIBLE', capacidad: 8, salonId: 'sal-2', gridRow: 4, gridCol: 1 },
      { id: 'm-p22', numero: 22, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 4, gridCol: 2, mozo: 'Andrea', comensales: 4, horaOcupacion: '19:30', minutosOcupada: 80, montoActual: 41200 },
      { id: 'm-p23', numero: 23, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-2', gridRow: 4, gridCol: 3 },
      { id: 'm-p25', numero: 25, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-2', gridRow: 4, gridCol: 6, mozo: 'Lucas', comensales: 2, horaOcupacion: '21:00', minutosOcupada: 8, montoActual: 4500 },
      { id: 'm-p26', numero: 26, estado: 'DISPONIBLE', capacidad: 8, salonId: 'sal-2', gridRow: 4, gridCol: 8 },
    ],
  },
  {
    id: 'sal-3',
    nombre: 'TERRAZA',
    filas: 4,
    columnas: 10,
    piso: 'piedra',
    items: ITEMS_TERRAZA,
    mesas: [
      { id: 'm-t1', numero: 1, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-3', gridRow: 1, gridCol: 1, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-t2', numero: 2, estado: 'OCUPADA', capacidad: 2, salonId: 'sal-3', gridRow: 1, gridCol: 2, forma: 'circular', tamano: 'pequeno', mozo: 'Lucía', comensales: 2, horaOcupacion: '21:10', minutosOcupada: 5, montoActual: 3200 },
      { id: 'm-t3', numero: 3, estado: 'DISPONIBLE', capacidad: 2, salonId: 'sal-3', gridRow: 1, gridCol: 3, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-t4', numero: 4, estado: 'RESERVADA', capacidad: 2, salonId: 'sal-3', gridRow: 1, gridCol: 4, forma: 'circular', tamano: 'pequeno' },
      { id: 'm-t5', numero: 5, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-3', gridRow: 2, gridCol: 1, mozo: 'Lucía', comensales: 4, horaOcupacion: '20:40', minutosOcupada: 35, montoActual: 15800 },
      { id: 'm-t6', numero: 6, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-3', gridRow: 2, gridCol: 2 },
      { id: 'm-t7', numero: 7, estado: 'DISPONIBLE', capacidad: 4, salonId: 'sal-3', gridRow: 2, gridCol: 3 },
      { id: 'm-t8', numero: 8, estado: 'OCUPADA', capacidad: 4, salonId: 'sal-3', gridRow: 2, gridCol: 4, mozo: 'Lucía', comensales: 3, horaOcupacion: '20:55', minutosOcupada: 15, montoActual: 7600 },
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
      { id: 'del-1', numero: '#12', canalTipo: 'DELIVERY', monto: 28000, estado: 'EN_CURSO', hora: '20:30', minutosDesdeCreacion: 35, cliente: 'Mariana López' },
      { id: 'del-2', numero: '#13', canalTipo: 'DELIVERY', monto: 27000, estado: 'LISTO', hora: '20:45', minutosDesdeCreacion: 20, cliente: 'Federico Sosa' },
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
      { id: 'mos-1', numero: '#5', canalTipo: 'MOSTRADOR', monto: 22500, estado: 'EN_CURSO', hora: '20:50', minutosDesdeCreacion: 15, cliente: 'Tomás Iglesias' },
      { id: 'mos-2', numero: '#6', canalTipo: 'MOSTRADOR', monto: 23000, estado: 'EN_CURSO', hora: '21:00', minutosDesdeCreacion: 8, cliente: 'Camila Ruiz' },
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
      { id: 'py-1', numero: '#7', canalTipo: 'PEDIDOS_YA', monto: 20000, estado: 'EN_CURSO', hora: '20:20', minutosDesdeCreacion: 50, cliente: 'Lucía Pereyra' },
      { id: 'py-2', numero: '#8', canalTipo: 'PEDIDOS_YA', monto: 20000, estado: 'EN_CURSO', hora: '20:35', minutosDesdeCreacion: 30, cliente: 'Diego Moreno' },
      { id: 'py-3', numero: '#10', canalTipo: 'PEDIDOS_YA', monto: 20000, estado: 'LISTO', hora: '20:10', minutosDesdeCreacion: 12, cliente: 'Sofía Romero' },
      { id: 'py-4', numero: '#7', canalTipo: 'PEDIDOS_YA', monto: 35000, estado: 'EN_CURSO', hora: '21:05', minutosDesdeCreacion: 5, cliente: 'Martín Acosta' },
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
      { id: 'rap-1', numero: '#3', canalTipo: 'RAPPI', monto: 45000, estado: 'EN_CURSO', hora: '20:15', minutosDesdeCreacion: 48, cliente: 'Valentina Costa' },
      { id: 'rap-2', numero: '#4', canalTipo: 'RAPPI', monto: 45000, estado: 'LISTO', hora: '20:40', minutosDesdeCreacion: 22, cliente: 'Bruno Maldonado' },
    ],
  },
];
