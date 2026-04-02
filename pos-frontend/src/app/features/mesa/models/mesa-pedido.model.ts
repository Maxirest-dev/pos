export interface Categoria {
  id: string;
  nombre: string;
  imagen: string;
}

export interface Subcategoria {
  id: string;
  nombre: string;
  categoriaId: string;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoriaId: string;
  subcategoriaId: string;
  imagen: string;
}

export interface ItemPedido {
  id: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  comensalIndex: number;
  enviado: boolean;
}

export interface Comensal {
  index: number;
  nombre: string;
}
