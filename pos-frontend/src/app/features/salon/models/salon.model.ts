export type MesaEstado = 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA';

export interface Mesa {
  id: string;
  numero: number;
  estado: MesaEstado;
  capacidad: number;
  salonId: string;
  gridRow: number;          // 1-based
  gridCol: number;          // 1-based
  rowSpan?: number;         // default 1
  colSpan?: number;         // default 1
  forma?: MesaForma;        // default 'cuadrada'
  tamano?: ItemTamano;      // default 'grande'
  mozo?: string;
  comensales?: number;
  horaOcupacion?: string;
  minutosOcupada?: number;
  pedidoId?: string;
  montoActual?: number;
}

// === Plano del salón (layout estructural) ===

export type PlanoItemTipo = 'mesa' | 'planta' | 'pared' | 'barra' | 'entrada' | 'bano' | 'caja';
export type MesaForma = 'cuadrada' | 'circular';
export type ItemTamano = 'pequeno' | 'grande';
export type ParedOrientacion = 'horizontal' | 'vertical' | 'curva';
export type CurvaRotacion = 0 | 90 | 180 | 270;
export type PisoTipo = 'ninguno' | 'madera' | 'piedra' | 'porcelanato';

export interface PlanoItem {
  id: string;
  tipo: PlanoItemTipo;
  row: number;        // 0-based para editor
  col: number;        // 0-based para editor
  rowSpan: number;
  colSpan: number;
  // Mesa
  forma?: MesaForma;
  tamano?: ItemTamano;
  numero?: number;
  comensalesMax?: number;
  // Decorativos
  label?: string;
  orientacion?: ParedOrientacion;
  curvaRotacion?: CurvaRotacion;
}

export interface Salon {
  id: string;
  nombre: string;
  filas: number;
  columnas: number;
  mesas: Mesa[];
  items?: PlanoItem[];
  piso?: PisoTipo;
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
