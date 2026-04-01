# Arquitectura - Modulo Punto de Venta (POS)

**Modulo**: Punto de Venta (POS)
**Version**: 1.0.0
**Fecha**: 2026-04-01
**Estado**: Prototipo Frontend-Only con Mock Data

---

## Tabla de Contenidos

1. [Vision General](#1-vision-general)
2. [Diagrama de Arquitectura](#2-diagrama-de-arquitectura)
3. [Tech Stack Detallado](#3-tech-stack-detallado)
4. [Decisiones de Arquitectura (ADRs)](#4-decisiones-de-arquitectura-adrs)
5. [Estructura de Navegacion y Flujos](#5-estructura-de-navegacion-y-flujos)
6. [Modelo de Datos](#6-modelo-de-datos)
7. [Patrones de Diseno](#7-patrones-de-diseno)
8. [Endpoints REST (Futuro)](#8-endpoints-rest-futuro)
9. [Seguridad](#9-seguridad)
10. [Performance y Optimizacion](#10-performance-y-optimizacion)
11. [Escalabilidad](#11-escalabilidad)
12. [Responsive y Breakpoints](#12-responsive-y-breakpoints)
13. [Glosario](#13-glosario)

---

## 1. Vision General

El modulo de Punto de Venta (POS) es la interfaz operativa del sistema Maxirest donde el personal del restaurante (mozos, cajeros, cocineros) realiza las operaciones diarias: tomar pedidos, cobrar mesas y emitir comprobantes.

A diferencia de los modulos de backoffice (Inventario, Ventas, Produccion), el POS es una aplicacion de uso intensivo en tiempo real, orientada a tablets en modo landscape como dispositivo principal, con una interfaz tipo kiosco optimizada para velocidad de operacion.

### Alcance del Prototipo (v1.0)

El prototipo actual cubre unicamente el **flujo de login y apertura de turno**:

```
+------------------------------------------------------------------+
|                     FLUJO DE LOGIN POS                            |
|                                                                   |
|  [Selector de Usuario] --> [Ingreso de PIN] --> [Selector de     |
|       (avatares)            (teclado numerico)    Turno]          |
|                                                    (calendario    |
|                                                    + turnos)      |
|                                            --> [Confirmacion     |
|                                                  de Turno]        |
|                                                  ("Abrir")        |
+------------------------------------------------------------------+
```

### Secciones Futuras

| Seccion      | Descripcion                                       | Prioridad |
|-------------|---------------------------------------------------|-----------|
| Salon View  | Plano del salon con mesas y estados               | Alta      |
| Mesa View   | Toma de pedidos por mesa, categorias, items        | Alta      |
| Cobro       | Formas de pago, division de cuenta, propinas       | Alta      |
| Estadisticas| Dashboard de turno, ventas por mozo, items top     | Media     |
| Settings    | Configuracion de impresoras, turnos, permisos      | Baja      |

---

## 2. Diagrama de Arquitectura

### 2.1 Arquitectura General (Vision Completa)

```
+---------------------------------------------------------------+
|                        NAVEGADOR / TABLET                      |
|  +----------------------------------------------------------+ |
|  |              Angular 19+ SPA (Standalone)                 | |
|  |                                                           | |
|  |  +------------+  +------------+  +--------------------+   | |
|  |  |   Login    |  |   Salon    |  |    Mesa / Cobro    |   | |
|  |  |   Flow     |  |   View     |  |    View            |   | |
|  |  +-----+------+  +-----+------+  +---------+----------+   | |
|  |        |                |                   |              | |
|  |  +-----+----------------+-------------------+----------+   | |
|  |  |              Core Services Layer                    |   | |
|  |  |  AuthService | TurnoService | PedidoService        |   | |
|  |  |  MesaService | CobroService | NotificationService   |   | |
|  |  +-----+----------------------------------------------+   | |
|  |        |                                                   | |
|  |  +-----+----------------------------------------------+   | |
|  |  |          Mock Data Layer (Prototipo)                |   | |
|  |  |  mock-usuarios.data.ts | mock-turnos.data.ts        |   | |
|  |  |  mock-mesas.data.ts    | mock-menu.data.ts          |   | |
|  |  +-----+----------------------------------------------+   | |
|  +---------|--------------------------------------------------+ |
|            | (futuro: HTTP)                                     |
+------------|----------------------------------------------------+
             |
             v  (futuro)
+---------------------------------------------------------------+
|                    NGINX REVERSE PROXY                          |
|                    /api/* --> backend:8080                      |
+---------------------------------------------------------------+
             |
             v
+---------------------------------------------------------------+
|                SPRING BOOT 3.4.x (futuro)                      |
|  +-------------------+  +------------------+  +-----------+    |
|  | AuthController    |  | TurnoController  |  | Pedido    |    |
|  | POST /auth/login  |  | POST /turnos     |  | Controller|    |
|  | POST /auth/pin    |  | PUT /turnos/{id} |  |           |    |
|  +--------+----------+  +--------+---------+  +-----+-----+    |
|           |                      |                   |          |
|  +--------+----------------------+-------------------+------+   |
|  |                    Service Layer                         |   |
|  +--------+----------------------+-------------------+------+   |
|           |                      |                   |          |
|  +--------+----------------------+-------------------+------+   |
|  |              Spring Data JPA Repositories                |   |
|  +--------+-------------------------------------------------+   |
+------------|----------------------------------------------------+
             |
             v
+---------------------------------------------------------------+
|              MySQL 8.0 (Schema por Tenant)                     |
|  +-------------------+  +------------------------------------+ |
|  | tenant_master     |  | tenant_{nombre}                    | |
|  |  - tenants        |  |  - usuarios                        | |
|  |  - suscripciones  |  |  - turnos                          | |
|  |                   |  |  - mesas                            | |
|  |                   |  |  - pedidos                          | |
|  |                   |  |  - pedido_items                     | |
|  +-------------------+  +------------------------------------+ |
+---------------------------------------------------------------+
```

### 2.2 Arquitectura del Prototipo (Actual)

```
+---------------------------------------------------------------+
|                     NAVEGADOR / TABLET                         |
|  +----------------------------------------------------------+ |
|  |              Angular 19+ SPA (Standalone)                 | |
|  |                                                           | |
|  |  +------------------------------------------------------+ | |
|  |  |              LOGIN FEATURE MODULE                     | | |
|  |  |                                                       | | |
|  |  |  UserSelectorComponent --> PinEntryComponent          | | |
|  |  |         |                        |                    | | |
|  |  |         v                        v                    | | |
|  |  |  ShiftSelectorComponent --> ShiftConfirmComponent     | | |
|  |  +------------------+-----------------------------------+ | |
|  |                     |                                     | |
|  |  +------------------+-----------------------------------+ | |
|  |  |            AuthService (signals)                     | | |
|  |  |  currentUser: Signal<Usuario | null>                 | | |
|  |  |  currentShift: Signal<Turno | null>                  | | |
|  |  |  isAuthenticated: Signal<boolean>                    | | |
|  |  |  pinAttempts: Signal<number>                         | | |
|  |  +------------------+-----------------------------------+ | |
|  |                     |                                     | |
|  |  +------------------+-----------------------------------+ | |
|  |  |            Mock Data Layer                           | | |
|  |  |  MOCK_USUARIOS: Usuario[]                            | | |
|  |  |  MOCK_TURNOS: TurnoConfig[]                          | | |
|  |  +------------------------------------------------------+ | |
|  +----------------------------------------------------------+ |
+---------------------------------------------------------------+
```

---

## 3. Tech Stack Detallado

### 3.1 Frontend (Prototipo Actual)

| Tecnologia                | Version   | Proposito                                        |
|--------------------------|-----------|--------------------------------------------------|
| Angular                  | 19+       | Framework SPA, standalone components             |
| TypeScript               | 5.6+      | Lenguaje, strict mode                            |
| Signals                  | nativo    | Estado reactivo (NO NgRx, NO RxJS para estado)   |
| CSS Custom Properties    | -         | Variables para theming dark/light                |
| AG-Grid Community        | 32.x      | Tablas de datos (secciones futuras)              |
| @mro/shared-ui           | -         | ToastContainer, NotificationService (si aplica)  |

**NO se usa**: Angular Material, TailwindCSS, NgRx, PrimeNG.

### 3.2 Backend (Futuro)

| Tecnologia               | Version   | Proposito                                        |
|--------------------------|-----------|--------------------------------------------------|
| Java                    | 21 LTS    | Lenguaje                                         |
| Spring Boot             | 3.4.x     | Framework                                        |
| Spring Data JPA         | 3.4.x     | ORM/Persistencia                                 |
| Spring Security         | 6.x       | Autenticacion PIN, roles                         |
| MapStruct               | 1.6.x     | Mapping DTOs                                     |
| Lombok                  | 1.18.x    | Boilerplate reduction                            |
| MySQL                   | 8.0       | RDBMS multi-tenant                               |

### 3.3 Infraestructura (Futuro)

| Tecnologia               | Proposito                                        |
|--------------------------|--------------------------------------------------|
| Docker + Docker Compose  | Desarrollo local                                 |
| Nginx                   | Reverse proxy, servir SPA                        |
| Vercel                  | Deploy del prototipo frontend                    |
| GCP Cloud Run           | Deploy produccion (futuro)                       |

### 3.4 Tooling

| Herramienta              | Proposito                                        |
|--------------------------|--------------------------------------------------|
| Angular CLI              | Scaffolding, build, serve                        |
| Vite (via Angular CLI)   | Bundler rapido para dev                          |
| ESLint                   | Linting TypeScript                               |
| Prettier                 | Formatting                                       |

---

## 4. Decisiones de Arquitectura (ADRs)

### ADR-001: Frontend-Only Prototype con Mock Data

**Estado**: Aceptada
**Contexto**: El POS requiere validacion rapida de UX antes de invertir en backend.
**Decision**: El prototipo v1.0 sera frontend-only con datos mockeados. Los servicios Angular abstraeran el acceso a datos mediante una interfaz que permita reemplazar mocks por HTTP sin cambiar componentes.
**Consecuencias**:
- (+) Iteracion rapida de UX/UI
- (+) Deploy simple en Vercel
- (+) Sin dependencia de infraestructura backend
- (-) No hay persistencia real entre sesiones
- (-) El flujo de autenticacion es simulado

### ADR-002: Dark Theme para Login Flow

**Estado**: Aceptada
**Contexto**: El POS opera en ambientes con iluminacion variable (salones de restaurante, barras). Un tema oscuro reduce fatiga visual y distraccion en ambiente de trabajo.
**Decision**: El flujo de login usa dark theme completo. El salon view y mesa view tendran su propio tema (TBD).
**Consecuencias**:
- (+) Mejor experiencia visual en tablets en ambientes con poca luz
- (+) Diferenciacion visual clara respecto a modulos backoffice
- (-) Requiere paleta CSS dedicada

### ADR-003: Autenticacion por PIN (No Password)

**Estado**: Aceptada
**Contexto**: El personal de restaurante necesita acceso rapido. Un teclado numerico de 6 digitos es mas rapido que usuario+password, especialmente en tablets.
**Decision**: El login POS usa seleccion de usuario (avatar) + PIN de 6 digitos. Limite de 3 intentos antes de bloqueo temporal.
**Consecuencias**:
- (+) Login en menos de 5 segundos
- (+) Compatible con pantalla tactil
- (-) Menor seguridad que password complejo (mitigado por ser red interna)
- (-) Requiere endpoint de validacion de PIN separado del login tradicional

### ADR-004: Turno Unico Global

**Estado**: Aceptada
**Contexto**: En un restaurante, todos los empleados trabajan en el mismo turno. No tiene sentido que cada usuario abra su propio turno.
**Decision**: Solo puede haber un turno abierto a la vez. Un usuario abre el turno y queda abierto para todos. Un usuario cierra el turno y se cierra para todos.
**Consecuencias**:
- (+) Simplicidad operativa
- (+) Consistencia en reportes de turno
- (-) Si alguien cierra el turno por error, afecta a todos
- Mitigacion: confirmacion explicita antes de cerrar turno

### ADR-005: Standalone Components con Inline Templates

**Estado**: Aceptada
**Contexto**: Patron establecido en todos los modulos Maxirest.
**Decision**: Todos los componentes Angular son standalone con ChangeDetectionStrategy.OnPush, inline template e inline styles.
**Consecuencias**:
- (+) Consistencia con el ecosistema Maxirest
- (+) Tree-shaking optimo
- (+) Colocation de template + logica + estilos

### ADR-006: Signals para Estado (No NgRx, No RxJS Store)

**Estado**: Aceptada
**Contexto**: Angular 19+ tiene signals nativos maduros. El POS tiene estado local relativamente simple (usuario actual, turno actual, mesa seleccionada, pedido en curso).
**Decision**: Usar `signal()`, `computed()` y `effect()` nativos de Angular. El estado de autenticacion y turno se gestiona en servicios singleton con signals expuestos como readonly.
**Consecuencias**:
- (+) Zero dependencies adicionales
- (+) Rendimiento optimo con OnPush
- (+) API simple y predecible
- (-) Para estado muy complejo (futuro: multiple mesas con pedidos simultaneos) podria requerirse una solucion mas robusta

### ADR-007: Calendario con Seleccion Libre de Fecha

**Estado**: Aceptada
**Contexto**: Los dispositivos POS pueden tener la fecha del sistema incorrecta. El personal debe poder seleccionar la fecha real del turno.
**Decision**: El selector de turno incluye un calendario que defaultea a hoy pero permite seleccionar cualquier fecha. No se restringe a fechas pasadas o futuras.
**Consecuencias**:
- (+) Flexibilidad operativa
- (+) Resuelve problema real de dispositivos con fecha incorrecta
- (-) Riesgo de abrir turnos en fechas incorrectas por error humano
- Mitigacion: confirmacion explicita mostrando fecha + turno seleccionado

### ADR-008: Tipos de Usuario con Permisos Diferenciados

**Estado**: Aceptada
**Contexto**: Existen tres roles operativos en el POS, cada uno con acceso a funcionalidades diferentes.
**Decision**: Tres tipos de usuario POS:
- **Mozo (waiter)**: Tomar pedidos, ver salon, ver su historial
- **Cajero (cashier)**: Todo lo del mozo + cobrar + abrir/cerrar turno + estadisticas
- **Cocinero (cook)**: Ver pedidos entrantes, marcar como preparados
**Consecuencias**:
- (+) Seguridad por rol
- (+) Interfaz adaptada a cada rol (menos opciones = menos confusion)
- (-) Complejidad adicional en guards y routing

### ADR-009: Kiosk-Style UI Optimizada para Tablet Landscape

**Estado**: Aceptada
**Contexto**: El dispositivo principal es una tablet en orientacion landscape, usada como terminal POS.
**Decision**: La UI se disena primero para tablet landscape (1024x768 minimo). Se adapta a desktop y mobile pero la experiencia primaria es tablet.
**Consecuencias**:
- (+) Botones grandes, areas de toque amplias
- (+) Navegacion optimizada para un solo dedo
- (-) Puede verse "grande" en pantallas desktop
- (-) Mobile portrait tiene limitaciones de espacio

### ADR-010: Componente Calendario Custom (No Libreria Externa)

**Estado**: Aceptada
**Contexto**: El selector de turno necesita un calendario simple (seleccion de una fecha). Las librerias de date picker agregan peso significativo para una funcionalidad minima.
**Decision**: Implementar un calendario simple como componente standalone. Solo necesita navegacion mes a mes y seleccion de un dia.
**Consecuencias**:
- (+) Zero dependencies adicionales
- (+) Control total del look & feel dark theme
- (+) Peso minimo en el bundle
- (-) Esfuerzo de desarrollo del componente

---

## 5. Estructura de Navegacion y Flujos

### 5.1 Mapa de Rutas

```
/                           --> Redirect a /login
/login                      --> Redirect a /login/users
/login/users                --> UserSelectorComponent
/login/pin                  --> PinEntryComponent (requiere usuario seleccionado)
/login/shift                --> ShiftSelectorComponent (requiere PIN validado)
/login/shift/confirm        --> ShiftConfirmComponent (requiere turno seleccionado)
/salon                      --> SalonViewComponent (requiere turno abierto) [FUTURO]
/mesa/:id                   --> MesaViewComponent (requiere turno abierto) [FUTURO]
/cobro/:mesaId              --> CobroComponent (requiere pedido activo) [FUTURO]
/estadisticas               --> EstadisticasComponent (requiere rol cajero) [FUTURO]
/settings                   --> SettingsComponent (requiere rol cajero) [FUTURO]
```

### 5.2 Flujo de Login Detallado

```
                    +-------------------+
                    |   / (redirect)    |
                    +--------+----------+
                             |
                             v
                    +-------------------+
                    | /login/users      |
                    | "Quien anda ahi?" |
                    |                   |
                    | [Grid de avatares] |
                    | [Barra busqueda]  |
                    +--------+----------+
                             |  click avatar
                             v
                    +-------------------+
                    | /login/pin        |
                    | "Ingresa tu PIN"  |
                    |                   |
                    | [Avatar usuario]  |
                    | [6 dots]          |
                    | [Teclado numerico]|
                    | [Volver]          |
                    +--------+----------+
                             |  PIN valido
                             |
                    +--------+----------+
                    |  PIN invalido?    |
                    |  intentos < 3:    +----> Shake + "PIN incorrecto"
                    |  intentos >= 3:   +----> Bloqueo + volver a /login/users
                    +--------+----------+
                             |  PIN valido
                             v
                    +-------------------+
                    | /login/shift      |
                    | "Selecciona turno"|
                    |                   |
                    | [Calendario]      |
                    | [3 opciones turno]|
                    |  - Manana 08-14   |
                    |  - Tarde  14-22   |
                    |  - Noche  22-08   |
                    | [Volver]          |
                    +--------+----------+
                             |  selecciona fecha + turno
                             v
                    +-------------------+
                    | /login/shift/     |
                    |   confirm         |
                    | "Confirmar turno" |
                    |                   |
                    | Fecha: 01/04/2026 |
                    | Turno: Tarde      |
                    | Horario: 14-22    |
                    | Usuario: Juan     |
                    |                   |
                    | [Cancelar][Abrir] |
                    +--------+----------+
                             |  click "Abrir"
                             v
                    +-------------------+
                    | /salon            |
                    | (vista del salon) |
                    +-------------------+
```

### 5.3 Guards de Navegacion

| Guard                    | Protege                    | Condicion                          |
|-------------------------|----------------------------|------------------------------------|
| `userSelectedGuard`     | /login/pin                 | `authService.currentUser() !== null` |
| `pinValidatedGuard`     | /login/shift               | `authService.isPinValidated()`      |
| `shiftSelectedGuard`    | /login/shift/confirm       | `authService.selectedShift() !== null` |
| `turnoAbiertoGuard`     | /salon, /mesa, /cobro      | `turnoService.turnoActual() !== null` |
| `rolCajeroGuard`        | /estadisticas, /settings   | `authService.currentUser().rol === 'cajero'` |

---

## 6. Modelo de Datos

### 6.1 Interfaces TypeScript (Prototipo)

```typescript
// === USUARIOS ===

type RolPOS = 'mozo' | 'cajero' | 'cocinero';

interface Usuario {
  id: string;               // UUID
  nombre: string;           // "Juan Perez"
  nombreCorto: string;      // "Juan"
  rol: RolPOS;
  avatar: string;           // emoji o URL de imagen
  pin: string;              // hash del PIN de 6 digitos (mock: plaintext)
  activo: boolean;
  colorAvatar: string;      // color de fondo del avatar
}

// === TURNOS ===

type TurnoTipo = 'manana' | 'tarde' | 'noche';

interface TurnoConfig {
  tipo: TurnoTipo;
  nombre: string;           // "Manana", "Tarde", "Noche"
  horaInicio: string;       // "08:00"
  horaFin: string;          // "14:00"
  icono: string;            // emoji representativo
}

interface Turno {
  id: string;               // UUID
  fecha: string;            // "2026-04-01" (ISO date)
  tipo: TurnoTipo;
  estado: 'abierto' | 'cerrado';
  apertura: {
    usuarioId: string;
    timestamp: string;      // ISO datetime
  };
  cierre?: {
    usuarioId: string;
    timestamp: string;
  };
}

// === MESAS (futuro) ===

type EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'cuenta-pedida' | 'por-limpiar';

interface Mesa {
  id: string;
  numero: number;
  sector: string;           // "Salon Principal", "Terraza", "Barra"
  capacidad: number;
  estado: EstadoMesa;
  posX: number;             // posicion en el plano
  posY: number;
  forma: 'cuadrada' | 'redonda' | 'rectangular';
  pedidoActualId?: string;
}

// === PEDIDOS (futuro) ===

type EstadoPedido = 'abierto' | 'enviado-cocina' | 'en-preparacion' | 'listo' | 'entregado' | 'cobrado';

interface Pedido {
  id: string;
  mesaId: string;
  turnoId: string;
  mozoId: string;
  estado: EstadoPedido;
  items: PedidoItem[];
  createdAt: string;
  updatedAt: string;
}

interface PedidoItem {
  id: string;
  articuloId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
  estado: 'pendiente' | 'en-preparacion' | 'listo' | 'entregado';
}
```

### 6.2 Schema MySQL (Futuro)

```sql
-- Schema: tenant_{nombre}

CREATE TABLE usuarios_pos (
  id          VARCHAR(36) PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  nombre_corto VARCHAR(50) NOT NULL,
  rol         ENUM('mozo', 'cajero', 'cocinero') NOT NULL,
  pin_hash    VARCHAR(255) NOT NULL,
  avatar_url  VARCHAR(255),
  color_avatar VARCHAR(7) DEFAULT '#6366F1',
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by  VARCHAR(36),
  updated_by  VARCHAR(36),
  INDEX idx_usuarios_pos_rol (rol),
  INDEX idx_usuarios_pos_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE turnos (
  id              VARCHAR(36) PRIMARY KEY,
  fecha           DATE NOT NULL,
  tipo            ENUM('manana', 'tarde', 'noche') NOT NULL,
  estado          ENUM('abierto', 'cerrado') NOT NULL DEFAULT 'abierto',
  apertura_usuario_id  VARCHAR(36) NOT NULL,
  apertura_timestamp   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cierre_usuario_id    VARCHAR(36),
  cierre_timestamp     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_turno_fecha_tipo (fecha, tipo),
  INDEX idx_turnos_estado (estado),
  INDEX idx_turnos_fecha (fecha),
  FOREIGN KEY (apertura_usuario_id) REFERENCES usuarios_pos(id),
  FOREIGN KEY (cierre_usuario_id) REFERENCES usuarios_pos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mesas (
  id          VARCHAR(36) PRIMARY KEY,
  numero      INT NOT NULL,
  sector      VARCHAR(100) NOT NULL,
  capacidad   INT NOT NULL DEFAULT 4,
  estado      ENUM('libre', 'ocupada', 'reservada', 'cuenta-pedida', 'por-limpiar')
              NOT NULL DEFAULT 'libre',
  pos_x       DECIMAL(6,2) DEFAULT 0,
  pos_y       DECIMAL(6,2) DEFAULT 0,
  forma       ENUM('cuadrada', 'redonda', 'rectangular') DEFAULT 'cuadrada',
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_mesa_numero_sector (numero, sector),
  INDEX idx_mesas_estado (estado),
  INDEX idx_mesas_sector (sector)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedidos (
  id          VARCHAR(36) PRIMARY KEY,
  mesa_id     VARCHAR(36) NOT NULL,
  turno_id    VARCHAR(36) NOT NULL,
  mozo_id     VARCHAR(36) NOT NULL,
  estado      ENUM('abierto', 'enviado-cocina', 'en-preparacion', 'listo', 'entregado', 'cobrado')
              NOT NULL DEFAULT 'abierto',
  subtotal    DECIMAL(12,2) DEFAULT 0,
  descuento   DECIMAL(12,2) DEFAULT 0,
  total       DECIMAL(12,2) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id),
  FOREIGN KEY (turno_id) REFERENCES turnos(id),
  FOREIGN KEY (mozo_id) REFERENCES usuarios_pos(id),
  INDEX idx_pedidos_turno (turno_id),
  INDEX idx_pedidos_mesa (mesa_id),
  INDEX idx_pedidos_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedido_items (
  id              VARCHAR(36) PRIMARY KEY,
  pedido_id       VARCHAR(36) NOT NULL,
  articulo_id     VARCHAR(36) NOT NULL,
  nombre          VARCHAR(200) NOT NULL,
  cantidad        INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL,
  notas           TEXT,
  estado          ENUM('pendiente', 'en-preparacion', 'listo', 'entregado')
                  NOT NULL DEFAULT 'pendiente',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  INDEX idx_pedido_items_pedido (pedido_id),
  INDEX idx_pedido_items_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para estadisticas de turno
CREATE VIEW v_turno_resumen AS
SELECT
  t.id AS turno_id,
  t.fecha,
  t.tipo,
  t.estado,
  COUNT(DISTINCT p.id) AS total_pedidos,
  COUNT(DISTINCT p.mesa_id) AS mesas_atendidas,
  SUM(p.total) AS facturacion_total,
  ua.nombre AS abierto_por,
  uc.nombre AS cerrado_por
FROM turnos t
LEFT JOIN pedidos p ON p.turno_id = t.id
LEFT JOIN usuarios_pos ua ON ua.id = t.apertura_usuario_id
LEFT JOIN usuarios_pos uc ON uc.id = t.cierre_usuario_id
GROUP BY t.id;
```

---

## 7. Patrones de Diseno

### 7.1 Patron de Estado de Autenticacion (Service con Signals)

El `AuthService` actua como store singleton para todo el estado de autenticacion:

```
+----------------------------------------------------------+
|                    AuthService                            |
|                                                           |
|  Estado (signals privados):                              |
|    _currentUser = signal<Usuario | null>(null)           |
|    _isPinValidated = signal(false)                       |
|    _pinAttempts = signal(0)                              |
|    _selectedDate = signal<string>(today)                 |
|    _selectedShift = signal<TurnoConfig | null>(null)     |
|    _turnoActual = signal<Turno | null>(null)             |
|                                                           |
|  Computed (publicos, readonly):                          |
|    currentUser = this._currentUser.asReadonly()           |
|    isAuthenticated = computed(() => ...)                  |
|    isBlocked = computed(() => _pinAttempts() >= 3)        |
|                                                           |
|  Metodos:                                                |
|    selectUser(user: Usuario): void                       |
|    validatePin(pin: string): boolean                     |
|    selectShift(date, shift): void                        |
|    openTurno(): Turno                                    |
|    closeTurno(): void                                    |
|    logout(): void                                        |
+----------------------------------------------------------+
```

### 7.2 Patron Step-by-Step (Wizard Flow)

El login es un flujo secuencial donde cada paso depende del anterior. Se implementa como rutas hijas con guards:

```
/login
  |-- /users      (paso 1: siempre accesible)
  |-- /pin        (paso 2: requiere usuario seleccionado)
  |-- /shift      (paso 3: requiere PIN validado)
  |-- /shift/confirm (paso 4: requiere turno seleccionado)
```

Cada componente solo avanza al siguiente paso. Si el estado se pierde (ej: refresh), los guards redirigen al paso correcto.

### 7.3 Patron de Abstraccion de Datos (Mock/HTTP Swap)

Para facilitar la transicion de mock a API real:

```
                  +---------------------+
                  |   DataProvider      |
                  |   (interface)       |
                  +---------------------+
                  | getUsuarios()       |
                  | validatePin()       |
                  | openTurno()         |
                  +----------+----------+
                             |
              +--------------+--------------+
              |                             |
    +---------+---------+       +-----------+---------+
    | MockDataProvider  |       | HttpDataProvider    |
    | (prototipo)       |       | (futuro)            |
    +---------+---------+       +-----------+---------+
              |                             |
    +---------+---------+       +-----------+---------+
    | mock-*.data.ts    |       | HttpClient          |
    +-------------------+       | /api/v1/*           |
                                +---------------------+
```

Se usa `InjectionToken` + `provide` en `app.config.ts` para intercambiar implementaciones.

### 7.4 Patron Container/Presentational

```
LoginComponent (container, smart)
  |-- UserSelectorComponent (presentational)
  |     |-- UserAvatarCardComponent (presentational)
  |     |-- SearchBarComponent (presentational)
  |
  |-- PinEntryComponent (presentational)
  |     |-- PinDotsComponent (presentational)
  |     |-- NumericKeypadComponent (presentational)
  |
  |-- ShiftSelectorComponent (presentational)
  |     |-- CalendarComponent (presentational)
  |     |-- ShiftOptionComponent (presentational)
  |
  |-- ShiftConfirmComponent (presentational)
```

### 7.5 Emojis por Rol de Usuario

| Rol       | Emoji/Icono | Color de Fondo | Descripcion         |
|-----------|-------------|----------------|---------------------|
| Mozo      | Icono persona sirviendo | Indigo (#6366F1)  | Toma pedidos        |
| Cajero    | Icono caja registradora | Emerald (#10B981) | Cobra y gestiona    |
| Cocinero  | Icono gorro de chef     | Amber (#F59E0B)   | Prepara pedidos     |

---

## 8. Endpoints REST (Futuro)

Base URL: `/api/v1`
Seguridad: Bearer JWT + Header `X-Tenant-ID`

### 8.1 Autenticacion

| Metodo | Endpoint              | Descripcion                    | Body                          | Response              |
|--------|-----------------------|--------------------------------|-------------------------------|-----------------------|
| GET    | `/pos/usuarios`       | Lista usuarios POS activos     | -                             | `Usuario[]`           |
| POST   | `/pos/auth/pin`       | Validar PIN de usuario         | `{ usuarioId, pin }`         | `{ valid, token }`    |
| POST   | `/pos/auth/logout`    | Cerrar sesion POS              | -                             | `204 No Content`      |

### 8.2 Turnos

| Metodo | Endpoint              | Descripcion                    | Body                          | Response              |
|--------|-----------------------|--------------------------------|-------------------------------|-----------------------|
| GET    | `/pos/turnos/actual`  | Turno abierto actual (si hay)  | -                             | `Turno` o `404`       |
| POST   | `/pos/turnos`         | Abrir nuevo turno              | `{ fecha, tipo }`            | `Turno` (201)         |
| PUT    | `/pos/turnos/{id}/cerrar` | Cerrar turno               | -                             | `Turno`               |
| GET    | `/pos/turnos/{id}/resumen` | Resumen de turno            | -                             | `TurnoResumen`        |

### 8.3 Mesas (Futuro)

| Metodo | Endpoint              | Descripcion                    | Body                          | Response              |
|--------|-----------------------|--------------------------------|-------------------------------|-----------------------|
| GET    | `/pos/mesas`          | Todas las mesas del salon      | -                             | `Mesa[]`              |
| PUT    | `/pos/mesas/{id}/estado` | Cambiar estado de mesa      | `{ estado }`                 | `Mesa`                |

### 8.4 Pedidos (Futuro)

| Metodo | Endpoint                          | Descripcion                    | Body                      | Response          |
|--------|-----------------------------------|--------------------------------|---------------------------|-------------------|
| POST   | `/pos/pedidos`                    | Crear pedido en mesa           | `{ mesaId, items[] }`    | `Pedido` (201)    |
| GET    | `/pos/pedidos/{id}`               | Obtener pedido                 | -                         | `Pedido`          |
| POST   | `/pos/pedidos/{id}/items`         | Agregar items al pedido        | `{ items[] }`            | `Pedido`          |
| PUT    | `/pos/pedidos/{id}/enviar-cocina` | Enviar a cocina                | -                         | `Pedido`          |
| PUT    | `/pos/pedidos/{id}/cobrar`        | Marcar como cobrado            | `{ formaPago, monto }`  | `Pedido`          |

### 8.5 Errores Estandar

```json
{
  "timestamp": "2026-04-01T14:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "PIN incorrecto. Intentos restantes: 2",
  "path": "/api/v1/pos/auth/pin",
  "errors": []
}
```

---

## 9. Seguridad

### 9.1 Modelo de Seguridad del POS

```
+---------------------------------------------------------------+
|                    CAPAS DE SEGURIDAD                          |
|                                                                |
|  1. Red Interna                                               |
|     - POS opera en red local del restaurante                  |
|     - Acceso desde internet requiere VPN (futuro)             |
|                                                                |
|  2. Tenant Isolation                                          |
|     - Schema MySQL separado por tenant                        |
|     - Header X-Tenant-ID validado en cada request             |
|     - No hay acceso cross-tenant                              |
|                                                                |
|  3. Autenticacion PIN                                         |
|     - PIN de 6 digitos (mock: plaintext, prod: bcrypt hash)   |
|     - Maximo 3 intentos consecutivos                          |
|     - Bloqueo temporal de 5 minutos tras 3 fallos             |
|     - JWT emitido tras validacion exitosa                     |
|                                                                |
|  4. Autorizacion por Rol                                      |
|     - mozo: /salon, /mesa, /pedidos (propios)                 |
|     - cajero: todo lo anterior + /cobro, /estadisticas,       |
|               /settings, abrir/cerrar turno                   |
|     - cocinero: /cocina (vista de pedidos entrantes)          |
|                                                                |
|  5. Validaciones                                              |
|     - No se puede abrir turno si ya hay uno abierto           |
|     - No se puede cerrar turno con mesas con cuenta abierta   |
|     - No se puede cobrar sin items en el pedido               |
+---------------------------------------------------------------+
```

### 9.2 Seguridad del Prototipo

En el prototipo frontend-only:
- PINs almacenados en plaintext en mock data (SOLO para desarrollo)
- Validacion de PIN en el cliente (sin seguridad real)
- Guards de ruta basados en signals del AuthService
- Sin JWT ni headers de tenant

### 9.3 Seguridad en Produccion (Futuro)

- PIN hasheado con bcrypt en MySQL
- JWT con claims: `{ userId, tenantId, rol, turnoId, exp }`
- Token expiration: 12 horas (duracion maxima de un turno)
- Refresh token: no aplica (re-login con PIN es rapido)
- CORS restringido a dominio del tenant
- Rate limiting en endpoint de PIN: 3 intentos por usuario por 5 minutos

---

## 10. Performance y Optimizacion

### 10.1 Estrategias de Performance

| Estrategia                   | Aplicacion en POS                                  |
|-----------------------------|-----------------------------------------------------|
| Lazy Loading                | Cada seccion (login, salon, mesa) es un lazy chunk  |
| OnPush Change Detection     | Todos los componentes, zero excepciones             |
| Signals (no zone.js)        | Estado reactivo sin zone.js overhead                |
| Preloading Strategy         | Preload salon view mientras esta en login           |
| CSS containment             | `contain: content` en cards y grid items            |
| Image optimization          | Avatares como emojis/iconos SVG (no bitmaps)        |
| Virtual scrolling           | AG-Grid para listas largas (menu items)             |

### 10.2 Metricas Objetivo

| Metrica                     | Objetivo        | Contexto                        |
|-----------------------------|-----------------|----------------------------------|
| First Contentful Paint      | < 1.5s          | Tablet con WiFi local            |
| Time to Interactive         | < 2.5s          | Login screen funcional           |
| Login flow completo         | < 10s           | Desde avatar click hasta salon   |
| Bundle size (login)         | < 150 KB gzip   | Chunk del flujo de login         |
| Bundle total (POS)          | < 500 KB gzip   | Toda la aplicacion               |

### 10.3 Offline Considerations (Futuro)

El POS deberia funcionar con conectividad intermitente:
- Service Worker para cache de assets
- IndexedDB para queue de pedidos offline
- Sync cuando se recupera conectividad
- Indicador visual de estado de conexion

---

## 11. Escalabilidad

### 11.1 Escalabilidad del Frontend

```
Prototipo (actual)          Produccion (futuro)
+------------------+        +----------------------------------+
| Vercel Static    |        | CDN (CloudFlare/GCP)             |
| Single deploy    |        | Multi-region cache               |
| Mock data        |        | Assets cached, API dynamic       |
+------------------+        +----------------------------------+
```

### 11.2 Escalabilidad del Backend (Futuro)

```
+------------------+     +------------------+     +------------------+
| POS Instance 1   |     | POS Instance 2   |     | POS Instance N   |
| (Tenant A)       |     | (Tenant B)       |     | (Tenant N)       |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                        +---------+---------+
                        | Cloud Run         |
                        | Auto-scaling      |
                        | (0 to N instances)|
                        +---------+---------+
                                  |
                        +---------+---------+
                        | Cloud SQL (MySQL) |
                        | Schema per tenant |
                        | Read replicas     |
                        +-------------------+
```

### 11.3 Consideraciones de Escala

| Dimension                 | Estrategia                                          |
|--------------------------|-----------------------------------------------------|
| Multiples restaurantes   | Schema por tenant en MySQL                          |
| Multiples terminales     | Stateless backend, estado en BD                     |
| Picos de hora            | Cloud Run auto-scaling, connection pooling           |
| Datos historicos         | Particionamiento de pedidos por mes                  |
| Concurrencia en mesa     | Optimistic locking con version field                 |

---

## 12. Responsive y Breakpoints

### 12.1 Breakpoints

| Breakpoint   | Rango           | Dispositivo                      | Prioridad  |
|-------------|-----------------|----------------------------------|------------|
| `tablet-lg` | >= 1024px       | Tablet landscape (primario)      | PRIMARIA   |
| `desktop`   | >= 1280px       | Monitor/laptop                   | Secundaria |
| `tablet-sm` | 768px - 1023px  | Tablet portrait                  | Secundaria |
| `mobile`    | < 768px         | Telefono                         | Terciaria  |

### 12.2 Layout por Breakpoint - Login Flow

```
TABLET LANDSCAPE (1024px+) - PRIMARIO
+------------------------------------------+
|            "Quien anda ahi?"             |
|                                          |
|  [Avatar] [Avatar] [Avatar] [Avatar]    |
|  [Avatar] [Avatar] [Avatar] [Avatar]    |
|  [Avatar] [Avatar] [Avatar] [Avatar]    |
|                                          |
|           [____Buscar____]               |
+------------------------------------------+

MOBILE (< 768px)
+--------------------+
| "Quien anda ahi?" |
|                    |
| [Avatar] [Avatar]  |
| [Avatar] [Avatar]  |
| [Avatar] [Avatar]  |
| [Avatar] [Avatar]  |
|                    |
| [____Buscar____]   |
+--------------------+
```

### 12.3 CSS Custom Properties (Dark Theme)

```css
:root {
  /* === Dark Theme POS Login === */
  --pos-bg-primary: #0F172A;        /* Slate 900 - fondo principal */
  --pos-bg-secondary: #1E293B;      /* Slate 800 - cards/panels */
  --pos-bg-elevated: #334155;       /* Slate 700 - hover states */
  --pos-border: #475569;            /* Slate 600 - bordes */
  --pos-text-primary: #F8FAFC;      /* Slate 50 - texto principal */
  --pos-text-secondary: #94A3B8;    /* Slate 400 - texto secundario */
  --pos-text-muted: #64748B;        /* Slate 500 - texto muted */

  /* === Colores de Acento === */
  --pos-accent: #F97316;            /* Orange 500 - acento Maxirest */
  --pos-accent-hover: #EA580C;      /* Orange 600 */
  --pos-accent-light: rgba(249, 115, 22, 0.15); /* Orange con opacidad */

  /* === Colores de Rol === */
  --pos-rol-mozo: #6366F1;          /* Indigo 500 */
  --pos-rol-cajero: #10B981;        /* Emerald 500 */
  --pos-rol-cocinero: #F59E0B;      /* Amber 500 */

  /* === Colores de Estado === */
  --pos-success: #22C55E;           /* Green 500 */
  --pos-warning: #EAB308;           /* Yellow 500 */
  --pos-error: #EF4444;             /* Red 500 */
  --pos-info: #3B82F6;              /* Blue 500 */

  /* === Spacing === */
  --pos-radius-sm: 8px;
  --pos-radius-md: 12px;
  --pos-radius-lg: 16px;
  --pos-radius-xl: 24px;
  --pos-radius-full: 9999px;

  /* === Sombras (dark theme) === */
  --pos-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --pos-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --pos-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);

  /* === Teclado Numerico === */
  --pos-key-bg: #1E293B;
  --pos-key-hover: #334155;
  --pos-key-active: #475569;
  --pos-key-text: #F8FAFC;
  --pos-key-size: 72px;             /* Tamanio minimo para touch */
}
```

---

## 13. Glosario

| Termino          | Descripcion                                                          |
|-----------------|----------------------------------------------------------------------|
| **POS**         | Punto de Venta - terminal donde se toman pedidos y cobran            |
| **Turno**       | Periodo operativo del restaurante (manana, tarde, noche)             |
| **Mozo**        | Mesero/camarero que toma pedidos y atiende mesas                     |
| **Cajero**      | Operador que cobra, abre/cierra turnos y tiene permisos ampliados    |
| **Cocinero**    | Personal de cocina que recibe y prepara pedidos                      |
| **Mesa**        | Ubicacion fisica en el salon donde se sientan comensales             |
| **Salon**       | Vista de plano del restaurante con todas las mesas                   |
| **Pedido**      | Conjunto de items ordenados por una mesa en un turno                 |
| **Tenant**      | Restaurante individual en el sistema multi-tenant                    |
| **Mock Data**   | Datos simulados para el prototipo sin backend                        |
| **PIN**         | Numero de 6 digitos para autenticacion rapida en POS                 |
| **Kiosk**       | Modo de interfaz donde la app ocupa toda la pantalla                 |

---

## Apendice: Estructura de Archivos del Prototipo

```
pos/
  architecture.md                    # Este archivo
  project-structure.md               # Estructura detallada de carpetas
  api-specification.yaml             # OpenAPI 3.0.3 (endpoints futuro)
  database-schema.sql                # DDL MySQL (futuro)
  bocetos/                           # Mockups y screenshots de referencia
  docker-compose.yml                 # Orquestacion local (futuro)
  pos-frontend/                      # Angular 19+ SPA
    src/
      app/
        app.ts
        app.config.ts
        app.routes.ts
        core/
          guards/
            user-selected.guard.ts
            pin-validated.guard.ts
            shift-selected.guard.ts
            turno-abierto.guard.ts
          services/
            auth.service.ts
            turno.service.ts
            data-provider.token.ts
          index.ts
        shared/
          components/
            numeric-keypad/
            calendar/
            pin-dots/
            search-bar/
          pipes/
          directives/
        features/
          login/
            login.component.ts
            login.routes.ts
            components/
              user-selector/
                user-selector.component.ts
              user-avatar-card/
                user-avatar-card.component.ts
              pin-entry/
                pin-entry.component.ts
              shift-selector/
                shift-selector.component.ts
              shift-option/
                shift-option.component.ts
              shift-confirm/
                shift-confirm.component.ts
            models/
              usuario.model.ts
              turno.model.ts
              index.ts
            data/
              mock-usuarios.data.ts
              mock-turnos.data.ts
            services/
              mock-auth.provider.ts
            index.ts
          salon/                     # [FUTURO]
          mesa/                      # [FUTURO]
          cobro/                     # [FUTURO]
          estadisticas/              # [FUTURO]
          settings/                  # [FUTURO]
      styles/
        _dark-theme.scss
        _variables.scss
        styles.scss
      index.html
      main.ts
```
