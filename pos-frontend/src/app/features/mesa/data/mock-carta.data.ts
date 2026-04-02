import { Categoria, Subcategoria, Producto } from '../models/mesa-pedido.model';

export const MOCK_CATEGORIAS: Categoria[] = [
  { id: 'cat-1', nombre: 'Entradas', imagen: '🥗' },
  { id: 'cat-2', nombre: 'Principal', imagen: '🍽️' },
  { id: 'cat-3', nombre: 'Aves', imagen: '🍗' },
  { id: 'cat-4', nombre: 'Carnes', imagen: '🥩' },
  { id: 'cat-5', nombre: 'Hamburguesas', imagen: '🍔' },
  { id: 'cat-6', nombre: 'Parrilla', imagen: '🔥' },
  { id: 'cat-7', nombre: 'Pescados', imagen: '🐟' },
  { id: 'cat-8', nombre: 'Pastas', imagen: '🍝' },
  { id: 'cat-9', nombre: 'Bebidas', imagen: '🥤' },
  { id: 'cat-10', nombre: 'Postres', imagen: '🍮' },
];

export const MOCK_SUBCATEGORIAS: Subcategoria[] = [
  { id: 'sub-1', nombre: 'De la casa', categoriaId: 'cat-5' },
  { id: 'sub-2', nombre: 'Clásicas', categoriaId: 'cat-5' },
  { id: 'sub-3', nombre: 'Internacional', categoriaId: 'cat-5' },
  { id: 'sub-4', nombre: 'Fríos', categoriaId: 'cat-1' },
  { id: 'sub-5', nombre: 'Calientes', categoriaId: 'cat-1' },
  { id: 'sub-6', nombre: 'Al horno', categoriaId: 'cat-3' },
  { id: 'sub-7', nombre: 'A la plancha', categoriaId: 'cat-3' },
  { id: 'sub-8', nombre: 'Cortes', categoriaId: 'cat-4' },
  { id: 'sub-9', nombre: 'Minutas', categoriaId: 'cat-4' },
  { id: 'sub-10', nombre: 'Parrilla mixta', categoriaId: 'cat-6' },
  { id: 'sub-11', nombre: 'Individual', categoriaId: 'cat-6' },
  { id: 'sub-12', nombre: 'Mar', categoriaId: 'cat-7' },
  { id: 'sub-13', nombre: 'Río', categoriaId: 'cat-7' },
  { id: 'sub-14', nombre: 'Rellenas', categoriaId: 'cat-8' },
  { id: 'sub-15', nombre: 'Con salsa', categoriaId: 'cat-8' },
  { id: 'sub-16', nombre: 'Gaseosas', categoriaId: 'cat-9' },
  { id: 'sub-17', nombre: 'Vinos', categoriaId: 'cat-9' },
  { id: 'sub-18', nombre: 'Cervezas', categoriaId: 'cat-9' },
  { id: 'sub-19', nombre: 'Platos fuertes', categoriaId: 'cat-2' },
  { id: 'sub-20', nombre: 'Guarniciones', categoriaId: 'cat-2' },
  { id: 'sub-21', nombre: 'Dulces', categoriaId: 'cat-10' },
  { id: 'sub-22', nombre: 'Helados', categoriaId: 'cat-10' },
];

export const MOCK_PRODUCTOS: Producto[] = [
  // Hamburguesas - De la casa
  { id: 'p-1', nombre: 'Completa', precio: 12000, categoriaId: 'cat-5', subcategoriaId: 'sub-1', imagen: '🍔' },
  { id: 'p-2', nombre: 'Doble queso', precio: 14000, categoriaId: 'cat-5', subcategoriaId: 'sub-1', imagen: '🍔' },
  { id: 'p-3', nombre: 'Con cheddar', precio: 13500, categoriaId: 'cat-5', subcategoriaId: 'sub-1', imagen: '🍔' },
  { id: 'p-4', nombre: 'Criolla', precio: 12500, categoriaId: 'cat-5', subcategoriaId: 'sub-1', imagen: '🍔' },
  { id: 'p-5', nombre: 'Con bacon', precio: 14500, categoriaId: 'cat-5', subcategoriaId: 'sub-1', imagen: '🍔' },
  // Hamburguesas - Clásicas
  { id: 'p-6', nombre: 'Simple', precio: 9500, categoriaId: 'cat-5', subcategoriaId: 'sub-2', imagen: '🍔' },
  { id: 'p-7', nombre: 'Con tomate', precio: 10000, categoriaId: 'cat-5', subcategoriaId: 'sub-2', imagen: '🍔' },
  { id: 'p-8', nombre: 'Con lechuga', precio: 10000, categoriaId: 'cat-5', subcategoriaId: 'sub-2', imagen: '🍔' },
  // Hamburguesas - Internacional
  { id: 'p-9', nombre: 'Fried Onion', precio: 15000, categoriaId: 'cat-5', subcategoriaId: 'sub-3', imagen: '🍔' },
  { id: 'p-10', nombre: 'Cheese Bacon', precio: 16000, categoriaId: 'cat-5', subcategoriaId: 'sub-3', imagen: '🍔' },
  // Entradas - Fríos
  { id: 'p-11', nombre: 'Bruschetta', precio: 7500, categoriaId: 'cat-1', subcategoriaId: 'sub-4', imagen: '🥗' },
  { id: 'p-12', nombre: 'Tabla fiambre', precio: 14000, categoriaId: 'cat-1', subcategoriaId: 'sub-4', imagen: '🧀' },
  { id: 'p-13', nombre: 'Ensalada César', precio: 9000, categoriaId: 'cat-1', subcategoriaId: 'sub-4', imagen: '🥗' },
  // Entradas - Calientes
  { id: 'p-14', nombre: 'Provoleta', precio: 8500, categoriaId: 'cat-1', subcategoriaId: 'sub-5', imagen: '🧀' },
  { id: 'p-15', nombre: 'Empanadas x3', precio: 7000, categoriaId: 'cat-1', subcategoriaId: 'sub-5', imagen: '🥟' },
  { id: 'p-16', nombre: 'Rabas', precio: 11000, categoriaId: 'cat-1', subcategoriaId: 'sub-5', imagen: '🦑' },
  // Carnes - Cortes
  { id: 'p-17', nombre: 'Bife de chorizo', precio: 18000, categoriaId: 'cat-4', subcategoriaId: 'sub-8', imagen: '🥩' },
  { id: 'p-18', nombre: 'Ojo de bife', precio: 19500, categoriaId: 'cat-4', subcategoriaId: 'sub-8', imagen: '🥩' },
  { id: 'p-19', nombre: 'Entraña', precio: 17000, categoriaId: 'cat-4', subcategoriaId: 'sub-8', imagen: '🥩' },
  { id: 'p-20', nombre: 'Vacío', precio: 16500, categoriaId: 'cat-4', subcategoriaId: 'sub-8', imagen: '🥩' },
  // Carnes - Minutas
  { id: 'p-21', nombre: 'Milanesa', precio: 12000, categoriaId: 'cat-4', subcategoriaId: 'sub-9', imagen: '🍖' },
  { id: 'p-22', nombre: 'Napolitana', precio: 14000, categoriaId: 'cat-4', subcategoriaId: 'sub-9', imagen: '🍖' },
  { id: 'p-23', nombre: 'Suprema', precio: 13000, categoriaId: 'cat-4', subcategoriaId: 'sub-9', imagen: '🍗' },
  // Aves
  { id: 'p-24', nombre: 'Pollo al horno', precio: 13500, categoriaId: 'cat-3', subcategoriaId: 'sub-6', imagen: '🍗' },
  { id: 'p-25', nombre: 'Pollo grillé', precio: 14000, categoriaId: 'cat-3', subcategoriaId: 'sub-7', imagen: '🍗' },
  { id: 'p-26', nombre: 'Pechuga plancha', precio: 12500, categoriaId: 'cat-3', subcategoriaId: 'sub-7', imagen: '🍗' },
  // Bebidas
  { id: 'p-27', nombre: 'Coca Cola', precio: 3500, categoriaId: 'cat-9', subcategoriaId: 'sub-16', imagen: '🥤' },
  { id: 'p-28', nombre: 'Agua mineral', precio: 2500, categoriaId: 'cat-9', subcategoriaId: 'sub-16', imagen: '💧' },
  { id: 'p-29', nombre: 'Malbec', precio: 12000, categoriaId: 'cat-9', subcategoriaId: 'sub-17', imagen: '🍷' },
  { id: 'p-30', nombre: 'Quilmes', precio: 4500, categoriaId: 'cat-9', subcategoriaId: 'sub-18', imagen: '🍺' },
  // Postres
  { id: 'p-31', nombre: 'Flan casero', precio: 6000, categoriaId: 'cat-10', subcategoriaId: 'sub-21', imagen: '🍮' },
  { id: 'p-32', nombre: 'Tiramisú', precio: 7500, categoriaId: 'cat-10', subcategoriaId: 'sub-21', imagen: '🍰' },
  { id: 'p-33', nombre: 'Helado x3', precio: 6500, categoriaId: 'cat-10', subcategoriaId: 'sub-22', imagen: '🍨' },
  // Parrilla
  { id: 'p-34', nombre: 'Mixta p/2', precio: 28000, categoriaId: 'cat-6', subcategoriaId: 'sub-10', imagen: '🔥' },
  { id: 'p-35', nombre: 'Mixta p/4', precio: 48000, categoriaId: 'cat-6', subcategoriaId: 'sub-10', imagen: '🔥' },
  { id: 'p-36', nombre: 'Asado', precio: 16000, categoriaId: 'cat-6', subcategoriaId: 'sub-11', imagen: '🔥' },
  { id: 'p-37', nombre: 'Costilla', precio: 15000, categoriaId: 'cat-6', subcategoriaId: 'sub-11', imagen: '🔥' },
  // Pescados
  { id: 'p-38', nombre: 'Salmón grillé', precio: 19000, categoriaId: 'cat-7', subcategoriaId: 'sub-12', imagen: '🐟' },
  { id: 'p-39', nombre: 'Merluza', precio: 14000, categoriaId: 'cat-7', subcategoriaId: 'sub-12', imagen: '🐟' },
  { id: 'p-40', nombre: 'Trucha', precio: 16000, categoriaId: 'cat-7', subcategoriaId: 'sub-13', imagen: '🐟' },
  // Pastas
  { id: 'p-41', nombre: 'Ravioles', precio: 11000, categoriaId: 'cat-8', subcategoriaId: 'sub-14', imagen: '🍝' },
  { id: 'p-42', nombre: 'Sorrentinos', precio: 12000, categoriaId: 'cat-8', subcategoriaId: 'sub-14', imagen: '🍝' },
  { id: 'p-43', nombre: 'Ñoquis', precio: 10000, categoriaId: 'cat-8', subcategoriaId: 'sub-15', imagen: '🍝' },
  { id: 'p-44', nombre: 'Tallarines', precio: 9500, categoriaId: 'cat-8', subcategoriaId: 'sub-15', imagen: '🍝' },
  // Principal
  { id: 'p-45', nombre: 'Lomo completo', precio: 16000, categoriaId: 'cat-2', subcategoriaId: 'sub-19', imagen: '🍽️' },
  { id: 'p-46', nombre: 'Bondiola', precio: 14500, categoriaId: 'cat-2', subcategoriaId: 'sub-19', imagen: '🍽️' },
  { id: 'p-47', nombre: 'Papas fritas', precio: 5000, categoriaId: 'cat-2', subcategoriaId: 'sub-20', imagen: '🍟' },
  { id: 'p-48', nombre: 'Ensalada mixta', precio: 5500, categoriaId: 'cat-2', subcategoriaId: 'sub-20', imagen: '🥗' },
  { id: 'p-49', nombre: 'Puré', precio: 4500, categoriaId: 'cat-2', subcategoriaId: 'sub-20', imagen: '🥔' },
];
