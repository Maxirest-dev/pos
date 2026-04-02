export type MesaEstado = 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA';

export interface Mesa {
  id: string;
  numero: number;
  estado: MesaEstado;
  capacidad: number;
  salonId: string;
  gridRow: number;
  gridCol: number;
  mozo?: string;
  comensales?: number;
  horaOcupacion?: string;
  minutosOcupada?: number;
  pedidoId?: string;
  montoActual?: number;
}

export interface Salon {
  id: string;
  nombre: string;
  filas: number;
  columnas: number;
  mesas: Mesa[];
}

export type CanalVentaTipo = 'DELIVERY' | 'MOSTRADOR' | 'PEDIDOS_YA' | 'RAPPI';

export interface PedidoCanal {
  id: string;
  numero: string;
  canalTipo: CanalVentaTipo;
  monto: number;
  estado: 'EN_CURSO' | 'LISTO' | 'ENTREGADO';
  hora: string;
  minutosDesdeCreacion: number;
}

export interface CanalVenta {
  tipo: CanalVentaTipo;
  label: string;
  color: string;
  colorBg: string;
  iconColor: string;
  montoTotal: number;
  pedidos: PedidoCanal[];
}
