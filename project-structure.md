# Estructura del Proyecto - Modulo POS (Punto de Venta)

> Maxirest Online - Sistema de Gestion para Restaurantes
> Ultima actualizacion: Abril 2026

---

## Tabla de Contenidos

1. [Vision General del Monorepo](#1-vision-general-del-monorepo)
2. [Arbol Completo de Directorios](#2-arbol-completo-de-directorios)
3. [Archivos Raiz del Proyecto](#3-archivos-raiz-del-proyecto)
4. [Frontend Angular - pos-frontend](#4-frontend-angular---pos-frontend)
5. [Backend Spring Boot - pos-backend (Futuro)](#5-backend-spring-boot---pos-backend-futuro)
6. [Convenciones de Naming](#6-convenciones-de-naming)
7. [Limites de Modulo y Dependencias](#7-limites-de-modulo-y-dependencias)
8. [Guia de Desarrollo Local](#8-guia-de-desarrollo-local)

---

## 1. Vision General del Monorepo

El modulo POS sigue el patron monorepo estandar de Maxirest: un directorio raiz con documentacion de planificacion y dos sub-proyectos independientes (frontend y backend) que se comunican via API REST.

```
pos/                          # Raiz del monorepo
  pos-frontend/               # Angular 19+ standalone SPA
  pos-backend/                # Spring Boot 3.4.x (desarrollo futuro)
```

**Diferencias clave respecto a otros modulos Maxirest (inventario, ventas, produccion):**

- El POS es una aplicacion orientada a **operacion en tiempo real** (toma de pedidos, cobro), no a gestion CRUD como inventario o ventas.
- El frontend tiene un flujo de navegacion **secuencial** (login -> turno -> salon -> mesa -> pedido -> cobro) en lugar del patron master-detail con AG-Grid.
- La UI prioriza **touch-first** con botones grandes, teclados numericos en pantalla y feedback visual inmediato.
- El feature de login esta disenado para **multiples usuarios en un mismo dispositivo** (tablets compartidas en el restaurante).

---

## 2. Arbol Completo de Directorios

```
pos/
|-- README.md                          # Descripcion general del proyecto
|-- architecture.md                    # Arquitectura, ADRs, tech stack, seguridad
|-- project-structure.md               # Este archivo
|-- api-specification.yaml             # OpenAPI 3.0.3 - contratos REST
|-- database-schema.sql                # DDL MySQL 8.0 con tablas, indices, seeds
|-- design-patterns.md                 # Patrones de diseno aplicados
|-- docker-compose.yml                 # Orquestacion local (MySQL + backend + frontend)
|-- bocetos/                           # Mockups y screenshots de referencia UI
|
|-- pos-frontend/                      # -------- ANGULAR SPA --------
|   |-- angular.json
|   |-- package.json
|   |-- tsconfig.json
|   |-- tsconfig.app.json
|   |-- tsconfig.spec.json
|   |-- .editorconfig
|   |-- src/
|   |   |-- index.html
|   |   |-- main.ts
|   |   |-- styles.css                 # Estilos globales y CSS custom properties
|   |   |-- environments/
|   |   |   |-- environment.ts         # Config desarrollo
|   |   |   |-- environment.prod.ts    # Config produccion
|   |   |
|   |   |-- app/
|   |   |   |-- app.ts                 # AppComponent standalone (raiz)
|   |   |   |-- app.config.ts          # provideRouter, provideHttpClient, etc.
|   |   |   |-- app.routes.ts          # Rutas principales con lazy loading
|   |   |   |
|   |   |   |-- core/                  # --- SINGLETON SERVICES ---
|   |   |   |   |-- guards/
|   |   |   |   |   |-- auth.guard.ts
|   |   |   |   |   |-- shift.guard.ts
|   |   |   |   |-- interceptors/
|   |   |   |   |   |-- auth.interceptor.ts
|   |   |   |   |-- services/
|   |   |   |   |   |-- auth.service.ts
|   |   |   |   |   |-- shift.service.ts
|   |   |   |   |   |-- user.service.ts
|   |   |   |   |-- models/
|   |   |   |   |   |-- user.model.ts
|   |   |   |   |   |-- shift.model.ts
|   |   |   |   |   |-- user-type.enum.ts
|   |   |   |   |-- index.ts           # Barrel export
|   |   |   |
|   |   |   |-- shared/                # --- COMPONENTES REUTILIZABLES ---
|   |   |   |   |-- components/
|   |   |   |   |   |-- numeric-keypad/
|   |   |   |   |   |   |-- numeric-keypad.component.ts
|   |   |   |   |   |-- avatar-card/
|   |   |   |   |   |   |-- avatar-card.component.ts
|   |   |   |   |   |-- calendar-picker/
|   |   |   |   |   |   |-- calendar-picker.component.ts
|   |   |   |   |   |-- shift-selector/
|   |   |   |   |   |   |-- shift-selector.component.ts
|   |   |   |   |   |-- pin-input/
|   |   |   |   |   |   |-- pin-input.component.ts
|   |   |   |   |-- pipes/
|   |   |   |   |-- directives/
|   |   |   |   |-- index.ts           # Barrel export
|   |   |   |
|   |   |   |-- features/              # --- FEATURE MODULES ---
|   |   |   |   |-- login/
|   |   |   |   |   |-- login.routes.ts
|   |   |   |   |   |-- pages/
|   |   |   |   |   |   |-- user-selector/
|   |   |   |   |   |   |   |-- user-selector.component.ts
|   |   |   |   |   |   |-- pin-entry/
|   |   |   |   |   |   |   |-- pin-entry.component.ts
|   |   |   |   |   |   |-- shift-selector/
|   |   |   |   |   |   |   |-- shift-selector.component.ts
|   |   |   |   |   |   |-- shift-confirmation/
|   |   |   |   |   |   |   |-- shift-confirmation.component.ts
|   |   |   |   |   |-- components/
|   |   |   |   |   |-- models/
|   |   |   |   |   |-- services/
|   |   |   |   |   |-- data/
|   |   |   |   |   |   |-- mock-login.data.ts
|   |   |   |   |
|   |   |   |   |-- salon/             # Futuro: gestion de pisos y mesas
|   |   |   |   |-- mesa/              # Futuro: toma de pedidos
|   |   |   |   |-- estadisticas/      # Futuro: reportes y dashboards
|   |   |   |   |-- config/            # Futuro: configuracion del POS
|
|-- pos-backend/                       # -------- SPRING BOOT (FUTURO) --------
|   |-- pom.xml
|   |-- src/
|   |   |-- main/
|   |   |   |-- java/com/maxisistemas/maxirestonline/pos/
|   |   |   |   |-- PosApplication.java
|   |   |   |   |-- ServletInitializer.java
|   |   |   |   |-- config/
|   |   |   |   |   |-- SecurityConfig.java
|   |   |   |   |   |-- DBConfigMREST.java
|   |   |   |   |   |-- DataSeeder.java
|   |   |   |   |-- controller/
|   |   |   |   |   |-- AuthController.java
|   |   |   |   |   |-- ShiftController.java
|   |   |   |   |   |-- HealthController.java
|   |   |   |   |-- service/
|   |   |   |   |   |-- AuthService.java
|   |   |   |   |   |-- ShiftService.java
|   |   |   |   |-- repository/
|   |   |   |   |   |-- mrest/
|   |   |   |   |   |   |-- UserRepository.java
|   |   |   |   |   |   |-- ShiftRepository.java
|   |   |   |   |-- model/
|   |   |   |   |   |-- UserEntity.java
|   |   |   |   |   |-- ShiftEntity.java
|   |   |   |   |   |-- UserTypeEnum.java
|   |   |   |   |   |-- dto/
|   |   |   |   |   |   |-- LoginRequestDto.java
|   |   |   |   |   |   |-- LoginResponseDto.java
|   |   |   |   |   |   |-- ShiftDto.java
|   |   |   |   |   |   |-- ShiftOpenDto.java
|   |   |   |   |   |-- mapper/
|   |   |   |   |   |   |-- UserMapper.java
|   |   |   |   |   |   |-- ShiftMapper.java
|   |   |-- resources/
|   |   |   |-- application.yml
|   |   |   |-- application-dev.yml
|   |   |   |-- application-prod.yml
```

---

## 3. Archivos Raiz del Proyecto

Cada archivo en la raiz cumple un rol especifico en la planificacion y documentacion del modulo.

### README.md

Punto de entrada del proyecto. Contiene:
- Descripcion funcional del modulo POS
- Instrucciones de setup rapido (`docker-compose up`)
- Links a la documentacion detallada
- Estado actual del desarrollo

### architecture.md

Documento tecnico principal. Define:
- Vision general y diagramas de componentes (ASCII art)
- ADRs (Architecture Decision Records) con justificaciones
- Tech stack detallado con versiones
- Estrategia de seguridad (autenticacion PIN, JWT, sesiones)
- Patrones de diseno seleccionados
- Endpoints REST planificados
- Consideraciones de performance y escalabilidad

### project-structure.md (este archivo)

Mapa completo de directorios y archivos. Explica el proposito de cada carpeta, convenciones de naming, limites de modulo y como agregar nuevos features.

### api-specification.yaml

Contrato OpenAPI 3.0.3 para la comunicacion frontend-backend. Incluye:
- Endpoints REST bajo `/api/v1/`
- Schemas de request/response (DTOs)
- Security scheme (Bearer JWT + header `X-Tenant-ID`)
- Paginacion estandar (`page`, `size`, `sort`)
- Respuestas de error estandarizadas (`ApiError`)

### database-schema.sql

DDL MySQL 8.0 completo:
- Tablas con IDs UUID (`VARCHAR(36)`)
- Timestamps (`created_at`, `updated_at`) y audit trails (`created_by`, `updated_by`)
- Soft delete via campo `activo BOOLEAN DEFAULT TRUE`
- Indices en campos de busqueda frecuente
- Vistas para queries complejas
- Seeds de datos iniciales
- `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`

### design-patterns.md

Catalogo de patrones de diseno GoF aplicados en el modulo, con justificacion y ejemplos de codigo concretos.

### docker-compose.yml

Orquestacion para desarrollo local:
- **mysql**: MySQL 8.0 con volumen persistente y schema inicial
- **pos-backend**: Spring Boot con hot-reload (futuro)
- **pos-frontend**: Angular dev server con proxy a backend
- **nginx**: Reverse proxy (opcional, para simular produccion)

### bocetos/

Carpeta con imagenes de referencia para la UI: mockups, wireframes, capturas de pantalla de aplicaciones similares. Estos bocetos guian el diseno visual de los componentes Angular.

---

## 4. Frontend Angular - pos-frontend

### 4.1. Archivos de Configuracion Raiz

| Archivo | Proposito |
|---------|-----------|
| `angular.json` | Configuracion del workspace Angular: build, serve, test |
| `package.json` | Dependencias npm y scripts (`ng serve`, `ng build`, `ng test`) |
| `tsconfig.json` | Configuracion TypeScript base del proyecto |
| `tsconfig.app.json` | Extends base, config especifica para la aplicacion |
| `tsconfig.spec.json` | Extends base, config especifica para tests |
| `.editorconfig` | Convenciones de formato (indentacion, charset, etc.) |

### 4.2. src/ - Codigo Fuente

#### src/index.html

HTML raiz de la SPA. Contiene el tag `<app-root>` y carga de fuentes/iconos si aplica.

#### src/main.ts

Punto de entrada que llama `bootstrapApplication(AppComponent, appConfig)`. Usa la API standalone de Angular 19+.

#### src/styles.css

Estilos globales de la aplicacion. Define:
- **CSS custom properties** para theming: `--gray-100` a `--gray-900`, colores primarios, colores de estado
- Reset CSS basico
- Tipografia base
- Utilidades globales (`.container`, `.card`, `.btn-primary`, `.btn-secondary`)
- Media queries para responsive (breakpoints en 1024px y 768px)

**No se usa** TailwindCSS ni Angular Material. Todo el theming es via CSS custom properties siguiendo la convencion Maxirest.

#### src/environments/

Archivos de configuracion por entorno:

- **environment.ts** - Desarrollo local: `apiUrl: 'http://localhost:8080/api/v1'`, `useMockData: true`
- **environment.prod.ts** - Produccion: URL real de Cloud Run, `useMockData: false`

---

### 4.3. app/ - Modulo Principal

#### app.ts - AppComponent

Componente raiz de la aplicacion. Standalone con `ChangeDetectionStrategy.OnPush`. Contiene el `<router-outlet>` y cualquier layout shell global (si aplica). En el POS, el layout es minimal porque cada pantalla ocupa el 100% del viewport.

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`
})
export class AppComponent {}
```

#### app.config.ts

Configuracion de providers para `bootstrapApplication`:
- `provideRouter(routes)` con lazy loading
- `provideHttpClient(withInterceptors([authInterceptor]))`
- `provideAnimationsAsync()` si se usan animaciones

#### app.routes.ts

Rutas principales con lazy loading por feature:

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.routes')
      .then(m => m.LOGIN_ROUTES)
  },
  {
    path: 'salon',
    canActivate: [authGuard, shiftGuard],
    loadChildren: () => import('./features/salon/salon.routes')
      .then(m => m.SALON_ROUTES)
  },
  // ... mesa, estadisticas, config
];
```

---

### 4.4. core/ - Servicios Singleton

La carpeta `core/` contiene servicios, guards e interceptors que se instancian una sola vez en la aplicacion (`providedIn: 'root'`). Ningun componente visual vive aqui.

#### core/guards/

**auth.guard.ts**
Guard que protege rutas que requieren usuario autenticado. Verifica que exista un usuario activo en `AuthService`. Si no, redirige a `/login`.

**shift.guard.ts**
Guard que protege rutas que requieren un turno abierto. Verifica que exista un turno activo en `ShiftService`. Si no, redirige a `/login/shift-selector`. Esto es critico en POS porque un operador no puede tomar pedidos sin un turno contable abierto.

#### core/interceptors/

**auth.interceptor.ts**
Interceptor funcional (Angular 19+ style) que agrega headers a cada request HTTP:
- `Authorization: Bearer {jwt}` desde `AuthService`
- `X-Tenant-ID: {tenantId}` para multi-tenancy
- Manejo de errores 401 (redireccion a login)

#### core/services/

**auth.service.ts**
Servicio central de autenticacion. Responsabilidades:
- Estado del usuario actual (`currentUser: WritableSignal<User | null>`)
- Login por PIN (`login(userId: string, pin: string): Observable<LoginResponse>`)
- Logout y limpieza de sesion
- Almacenamiento del JWT en memoria (no localStorage por seguridad en dispositivos compartidos)
- Signal computed `isAuthenticated = computed(() => this.currentUser() !== null)`

**shift.service.ts**
Servicio de gestion de turnos. Responsabilidades:
- Estado del turno actual (`currentShift: WritableSignal<Shift | null>`)
- Abrir turno (`openShift(date: string, shiftType: string): Observable<Shift>`)
- Cerrar turno con resumen de caja
- Verificar si existe un turno abierto para la fecha/tipo seleccionado
- Signal computed `hasOpenShift = computed(() => this.currentShift() !== null)`

**user.service.ts**
Servicio para obtener la lista de usuarios habilitados para el POS. Responsabilidades:
- Cargar usuarios desde API o mock data (`getUsers(): Observable<User[]>`)
- Filtrar por tipo de usuario (mozo, cajero, encargado)
- Cache en signal para evitar llamadas repetidas

#### core/models/

**user.model.ts**
```typescript
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  avatarUrl: string | null;
  iniciales: string;        // Calculadas: "VP" para "Valentino Pecile"
  tipo: UserType;
  activo: boolean;
}
```

**shift.model.ts**
```typescript
export interface Shift {
  id: string;
  fecha: string;            // ISO date "2026-04-01"
  tipo: ShiftType;          // 'almuerzo' | 'cena' | 'desayuno'
  estado: ShiftStatus;      // 'abierto' | 'cerrado'
  abiertoPor: string;       // userId
  abiertoEn: string;        // ISO datetime
  cerradoEn: string | null;
}
```

**user-type.enum.ts**
```typescript
export enum UserType {
  MOZO = 'MOZO',
  CAJERO = 'CAJERO',
  ENCARGADO = 'ENCARGADO',
  ADMIN = 'ADMIN'
}

export enum ShiftType {
  DESAYUNO = 'DESAYUNO',
  ALMUERZO = 'ALMUERZO',
  CENA = 'CENA'
}

export enum ShiftStatus {
  ABIERTO = 'ABIERTO',
  CERRADO = 'CERRADO'
}
```

#### core/index.ts

Barrel export que re-exporta todos los elementos publicos de `core/`:
```typescript
export * from './guards/auth.guard';
export * from './guards/shift.guard';
export * from './interceptors/auth.interceptor';
export * from './services/auth.service';
export * from './services/shift.service';
export * from './services/user.service';
export * from './models/user.model';
export * from './models/shift.model';
export * from './models/user-type.enum';
```

---

### 4.5. shared/ - Componentes Reutilizables

La carpeta `shared/` contiene componentes, pipes y directivas que son **reutilizables entre features**. Todos son standalone components con `OnPush`. No dependen de ningun feature especifico.

#### shared/components/numeric-keypad/

**numeric-keypad.component.ts**

Teclado numerico visual de 12 teclas (0-9, borrar, confirmar) disenado para entrada tactil. Se usa en la pantalla de PIN y potencialmente en cobro.

- **Inputs**: `maxLength: number` (longitud maxima de entrada), `showConfirmButton: boolean`
- **Outputs**: `digitPressed: EventEmitter<string>`, `deletePressed: EventEmitter<void>`, `confirmPressed: EventEmitter<void>`
- Estilo: botones grandes (minimo 64px), feedback visual al presionar, grid 3x4

#### shared/components/avatar-card/

**avatar-card.component.ts**

Tarjeta visual que representa un usuario. Muestra avatar circular (imagen o iniciales con color de fondo generado), nombre y rol.

- **Inputs**: `user: User`, `selected: boolean`, `size: 'sm' | 'md' | 'lg'`
- **Outputs**: `clicked: EventEmitter<User>`
- Estilo: tarjeta con borde redondeado, efecto hover/active, borde coloreado cuando `selected`

#### shared/components/calendar-picker/

**calendar-picker.component.ts**

Selector de fecha tipo calendario mensual. Disenado para seleccionar la fecha del turno a abrir.

- **Inputs**: `selectedDate: string` (ISO), `minDate: string`, `maxDate: string`, `highlightedDates: string[]` (fechas con turnos existentes)
- **Outputs**: `dateSelected: EventEmitter<string>`
- Estilo: grid 7 columnas (L-D), dia actual resaltado, dias con turnos marcados

#### shared/components/shift-selector/

**shift-selector.component.ts**

Selector visual de tipo de turno (desayuno, almuerzo, cena). Muestra cada opcion como una tarjeta con icono, nombre y rango horario.

- **Inputs**: `shifts: ShiftType[]`, `selectedShift: ShiftType | null`, `disabledShifts: ShiftType[]` (turnos ya abiertos)
- **Outputs**: `shiftSelected: EventEmitter<ShiftType>`
- Estilo: tarjetas horizontales, icono representativo, estado disabled para turnos ya existentes

#### shared/components/pin-input/

**pin-input.component.ts**

Indicador visual del PIN ingresado. Muestra N circulos (llenos o vacios) segun los digitos ya escritos. No es un input HTML sino una representacion visual.

- **Inputs**: `length: number` (tipicamente 4), `filledCount: number`, `error: boolean`
- **Outputs**: ninguno (solo visual)
- Estilo: circulos de 16px, relleno solido cuando hay digito, animacion shake cuando `error` es true

#### shared/pipes/ y shared/directives/

Carpetas reservadas para futuras pipes y directivas compartidas. Ejemplos futuros:
- `currency-ars.pipe.ts` - Formateo de moneda argentina
- `touch-feedback.directive.ts` - Feedback visual tactil en botones

#### shared/index.ts

Barrel export de todos los componentes compartidos.

---

### 4.6. features/ - Modulos de Funcionalidad

Cada subcarpeta dentro de `features/` es un modulo funcional autocontenido con sus propias rutas, componentes, servicios y datos.

---

#### 4.6.1. features/login/ - Flujo de Login (Foco Actual)

El feature de login es el **primer flujo a implementar** y tiene una complejidad particular: el POS usa autenticacion por PIN en dispositivos compartidos, no un formulario tipico de usuario/contrasena.

**Flujo secuencial de pantallas:**

```
/login
  |-- /login                    (1) user-selector    "Quien anda ahi?"
  |-- /login/pin/:userId        (2) pin-entry        Ingreso de PIN
  |-- /login/shift              (3) shift-selector    Fecha + turno
  |-- /login/shift/confirm      (4) shift-confirmation Resumen y apertura
  |-- --> /salon                    Redireccion al salon principal
```

##### login.routes.ts

Define las sub-rutas del feature de login con lazy loading:

```typescript
export const LOGIN_ROUTES: Routes = [
  { path: '', component: UserSelectorComponent },
  { path: 'pin/:userId', component: PinEntryComponent },
  { path: 'shift', component: ShiftSelectorComponent, canActivate: [authGuard] },
  { path: 'shift/confirm', component: ShiftConfirmationComponent, canActivate: [authGuard] }
];
```

##### pages/user-selector/

**user-selector.component.ts** - Pantalla "Quien anda ahi?"

Primera pantalla del POS. Muestra una grilla de tarjetas con todos los usuarios habilitados. El operador toca su tarjeta para identificarse.

- Usa `UserService` para cargar la lista de usuarios
- Renderiza un grid de `AvatarCard` components
- Al seleccionar un usuario, navega a `/login/pin/{userId}`
- Estado: `users = signal<User[]>([])`, `loading = signal(true)`
- Layout: titulo centrado arriba, grid responsive de tarjetas (3-4 columnas en tablet, 2 en mobile)

##### pages/pin-entry/

**pin-entry.component.ts** - Pantalla de Ingreso de PIN

Pantalla donde el usuario ingresa su PIN numerico de 4 digitos. Combina el componente `PinInput` (visual) con `NumericKeypad` (entrada).

- Lee `userId` de la ruta via `ActivatedRoute`
- Muestra el nombre del usuario seleccionado arriba
- `PinInput` muestra los 4 circulos
- `NumericKeypad` captura los digitos
- Al completar 4 digitos, llama `AuthService.login()` automaticamente
- Manejo de error: animacion shake en `PinInput`, mensaje "PIN incorrecto", limpieza automatica
- Boton "Volver" para regresar a seleccion de usuario
- Estado: `pin = signal('')`, `error = signal(false)`, `loading = signal(false)`

##### pages/shift-selector/

**shift-selector.component.ts** - Pantalla de Seleccion de Turno

Pantalla donde el usuario autenticado selecciona fecha y tipo de turno para abrir.

- Combina `CalendarPicker` (seleccion de fecha) y `ShiftSelector` (tipo de turno)
- `ShiftService` consulta turnos existentes para la fecha seleccionada
- Turnos ya abiertos se muestran deshabilitados
- Boton "Continuar" activo solo cuando hay fecha y turno seleccionados
- Estado: `selectedDate = signal(today)`, `selectedShift = signal<ShiftType | null>(null)`, `existingShifts = signal<Shift[]>([])`
- Layout: dos columnas en tablet (calendario izquierda, turnos derecha), una columna en mobile

##### pages/shift-confirmation/

**shift-confirmation.component.ts** - Pantalla de Confirmacion y Apertura

Pantalla de resumen antes de abrir el turno. Muestra toda la informacion seleccionada y pide confirmacion.

- Muestra: usuario autenticado, fecha seleccionada, tipo de turno, hora actual
- Boton "Abrir Turno" que llama `ShiftService.openShift()`
- En caso de exito, navega a `/salon`
- En caso de error, muestra mensaje y permite reintentar
- Boton "Volver" para cambiar la seleccion de turno
- Estado: `confirming = signal(false)`

##### components/

Subcarpeta para componentes compartidos **solo dentro del feature de login**. No se exportan fuera del feature. Ejemplos potenciales:
- `login-header/` - Header consistente en todas las pantallas de login (logo, titulo de paso)
- `step-indicator/` - Indicador visual del paso actual (1 de 4, 2 de 4, etc.)

##### models/

Interfaces y tipos especificos del feature de login:
- `login-request.model.ts` - `{ userId: string, pin: string }`
- `login-response.model.ts` - `{ token: string, user: User }`

##### services/

Servicios HTTP especificos del feature de login (si los hay). La mayor parte de la logica vive en `core/services/` porque `AuthService` y `ShiftService` son globales.

##### data/

**mock-login.data.ts**

Datos mock para desarrollo sin backend. Contiene:
- Lista de usuarios de prueba con diferentes roles
- PINs hardcodeados para cada usuario
- Turnos simulados
- Funcion `mockLogin(userId, pin)` que simula el delay de red y valida credenciales

```typescript
export const MOCK_USERS: User[] = [
  {
    id: '1', nombre: 'Carlos', apellido: 'Rodriguez',
    avatarUrl: null, iniciales: 'CR',
    tipo: UserType.ENCARGADO, activo: true
  },
  // ... mas usuarios
];

export const MOCK_PINS: Record<string, string> = {
  '1': '1234',
  '2': '5678',
  // ...
};
```

---

#### 4.6.2. features/salon/ (Futuro)

Gestion del salon: visualizacion del plano del restaurante, mesas, estados (libre, ocupada, reservada, pidiendo, esperando cuenta).

Estructura prevista:
```
salon/
  salon.routes.ts
  pages/
    floor-view/              # Vista del plano con mesas
    table-detail/            # Detalle de una mesa
  components/
    table-card/              # Representacion visual de una mesa
    floor-map/               # Mapa interactivo del salon
    status-legend/           # Leyenda de colores de estado
  models/
    table.model.ts
    floor.model.ts
  services/
    table.service.ts
    floor.service.ts
  data/
    mock-salon.data.ts
```

#### 4.6.3. features/mesa/ (Futuro)

Toma de pedidos en una mesa: menu interactivo, seleccion de platos, modificadores, envio a cocina.

#### 4.6.4. features/estadisticas/ (Futuro)

Dashboards y reportes: ventas del dia, productos mas vendidos, tiempos de servicio. Aqui si se usara AG-Grid para tablas de datos.

#### 4.6.5. features/config/ (Futuro)

Configuracion del POS: gestion de mesas, pisos, turnos habilitados, impresoras, usuarios.

---

## 5. Backend Spring Boot - pos-backend (Futuro)

El backend se implementara cuando el frontend tenga su flujo principal estabilizado con mock data. Sigue el patron estandar Maxirest.

### Package base: `com.maxisistemas.maxirestonline.pos`

### 5.1. config/

| Archivo | Proposito |
|---------|-----------|
| `SecurityConfig.java` | Configuracion Spring Security: endpoints publicos vs protegidos, CORS, filtro JWT |
| `DBConfigMREST.java` | Datasource multi-tenant: resuelve schema desde header `X-Tenant-ID` |
| `DataSeeder.java` | Seed de datos iniciales al arrancar (usuarios demo, turnos, etc.) |

### 5.2. controller/

| Archivo | Proposito |
|---------|-----------|
| `AuthController.java` | `POST /api/v1/auth/login` - Autenticacion por PIN, devuelve JWT |
| `ShiftController.java` | CRUD de turnos: abrir, cerrar, listar por fecha |
| `HealthController.java` | `GET /api/v1/health` - Health check para Docker/K8s |

Patron: los controllers solo manejan HTTP (parseo de request, validacion basica, respuesta). Toda la logica de negocio esta en services.

### 5.3. service/

| Archivo | Proposito |
|---------|-----------|
| `AuthService.java` | Validacion de PIN, generacion de JWT, manejo de intentos fallidos |
| `ShiftService.java` | Reglas de negocio de turnos: validar que no exista turno abierto duplicado, calcular resumen de caja al cerrar |

### 5.4. repository/mrest/

Repositorios Spring Data JPA conectados al schema `mrest` del tenant.

| Archivo | Proposito |
|---------|-----------|
| `UserRepository.java` | Queries de usuarios: findByIdAndActivo, findAllByTipo |
| `ShiftRepository.java` | Queries de turnos: findByFechaAndTipo, findOpenShifts |

### 5.5. model/

#### Entidades JPA

| Archivo | Proposito |
|---------|-----------|
| `UserEntity.java` | Entidad `usuarios_pos` - mapeada a tabla MySQL |
| `ShiftEntity.java` | Entidad `turnos` - mapeada a tabla MySQL |
| `UserTypeEnum.java` | Enum persistido como `VARCHAR` en BD |

#### dto/

DTOs separados para cada operacion (patron Maxirest estandar):

| Archivo | Proposito |
|---------|-----------|
| `LoginRequestDto.java` | `{ userId, pin }` - Request de login |
| `LoginResponseDto.java` | `{ token, user, expiresAt }` - Response de login |
| `ShiftDto.java` | Representacion completa de un turno (lectura) |
| `ShiftOpenDto.java` | `{ fecha, tipo }` - Request para abrir turno |

#### mapper/

MapStruct mappers para conversion entre entidades JPA y DTOs:

| Archivo | Proposito |
|---------|-----------|
| `UserMapper.java` | `UserEntity <-> User fields in LoginResponseDto` |
| `ShiftMapper.java` | `ShiftEntity <-> ShiftDto` |

---

## 6. Convenciones de Naming

### 6.1. Archivos y Carpetas

| Contexto | Convencion | Ejemplo |
|----------|------------|---------|
| Carpetas | `kebab-case` | `user-selector/`, `numeric-keypad/` |
| Componentes Angular | `{nombre}.component.ts` | `user-selector.component.ts` |
| Servicios Angular | `{entidad}.service.ts` | `auth.service.ts` |
| Guards | `{nombre}.guard.ts` | `auth.guard.ts` |
| Interceptors | `{nombre}.interceptor.ts` | `auth.interceptor.ts` |
| Modelos/Interfaces | `{entidad}.model.ts` | `user.model.ts` |
| Enums | `{entidad}-{tipo}.enum.ts` | `user-type.enum.ts` |
| Mock data | `mock-{feature}.data.ts` | `mock-login.data.ts` |
| Rutas de feature | `{feature}.routes.ts` | `login.routes.ts` |
| Barrel exports | `index.ts` | En cada subcarpeta publica |
| Clases Java | `PascalCase` | `AuthService.java`, `UserEntity.java` |
| Paquetes Java | `lowercase` | `controller`, `service`, `repository` |

### 6.2. Clases y Tipos TypeScript

| Contexto | Convencion | Ejemplo |
|----------|------------|---------|
| Componentes | `PascalCase + Component` | `UserSelectorComponent` |
| Servicios | `PascalCase + Service` | `AuthService` |
| Interfaces | `PascalCase` (sin prefijo I) | `User`, `Shift` |
| Enums | `PascalCase` | `UserType`, `ShiftStatus` |
| Signals | `camelCase` (sustantivo) | `currentUser`, `loading`, `selectedDate` |
| Computed | `camelCase` (sustantivo/adjetivo) | `isAuthenticated`, `filteredUsers` |
| Event emitters | `camelCase` (verbo pasado) | `clicked`, `dateSelected`, `shiftSelected` |

### 6.3. CSS

| Contexto | Convencion | Ejemplo |
|----------|------------|---------|
| Custom properties | `--{categoria}-{variante}` | `--gray-200`, `--primary-500` |
| Clases CSS | `kebab-case` | `.avatar-card`, `.pin-circle` |
| Clases de estado | `.is-{estado}` | `.is-active`, `.is-error`, `.is-disabled` |
| Clases de layout | `.{nombre}-container` | `.login-container`, `.keypad-grid` |

### 6.4. Rutas URL

| Convencion | Ejemplo |
|------------|---------|
| Sustantivos en singular o plural segun contexto | `/login`, `/salon` |
| Parametros con `:` | `/login/pin/:userId` |
| Sub-rutas separadas por `/` | `/login/shift/confirm` |
| Kebab-case para rutas compuestas | `/shift-selector` (si fuera ruta) |

---

## 7. Limites de Modulo y Dependencias

### 7.1. Reglas de Importacion

```
app.ts / app.config.ts / app.routes.ts
  |
  |-- puede importar de --> core/
  |-- puede importar de --> shared/
  |-- lazy-load ----------> features/*
  
core/
  |-- NO importa de features/
  |-- NO importa de shared/ (excepto modelos si es necesario)
  |-- Es autocontenido (guards, interceptors, services, models)

shared/
  |-- NO importa de features/
  |-- puede importar de --> core/models/ (solo interfaces/tipos)
  |-- Es reutilizable por cualquier feature

features/login/
  |-- puede importar de --> core/ (services, guards, models)
  |-- puede importar de --> shared/ (components)
  |-- NO importa de --> features/salon/ ni otros features
  
features/salon/
  |-- puede importar de --> core/
  |-- puede importar de --> shared/
  |-- NO importa de --> features/login/ ni otros features
```

**Regla fundamental**: los features NUNCA se importan entre si. Si dos features necesitan compartir funcionalidad, esta se eleva a `shared/` (componentes visuales) o `core/` (servicios y logica).

### 7.2. Dependencia entre Features via Servicios Core

Los features se comunican indirectamente a traves de los servicios singleton de `core/`:

```
login/pin-entry ---llama---> AuthService.login()
                              |
                              |--- actualiza signal ---> currentUser
                              |
salon/floor-view ---lee-----> AuthService.currentUser()
```

### 7.3. Dependencia Frontend-Backend

```
pos-frontend/                         pos-backend/
  core/services/auth.service.ts  -->    controller/AuthController.java
    POST /api/v1/auth/login             service/AuthService.java
                                        repository/mrest/UserRepository.java
  
  core/services/shift.service.ts -->    controller/ShiftController.java
    POST /api/v1/shifts                 service/ShiftService.java
    GET  /api/v1/shifts?fecha=          repository/mrest/ShiftRepository.java
```

Mientras el backend no exista, los servicios Angular usan datos mock de las carpetas `data/`.

---

## 8. Guia de Desarrollo Local

### 8.1. Como Agregar un Nuevo Feature

1. Crear carpeta en `features/{nombre-feature}/`
2. Crear `{nombre-feature}.routes.ts` con las sub-rutas
3. Crear subcarpetas: `pages/`, `components/`, `models/`, `services/`, `data/`
4. Registrar lazy-load en `app.routes.ts`
5. Agregar guards necesarios en las rutas (tipicamente `authGuard` + `shiftGuard`)
6. Comenzar con mock data en `data/mock-{feature}.data.ts`

### 8.2. Como Agregar un Componente Shared

1. Crear carpeta en `shared/components/{nombre}/`
2. Crear `{nombre}.component.ts` como standalone con `OnPush`
3. Exportar en `shared/index.ts`
4. Documentar inputs/outputs en comentarios del componente
5. El componente NO debe depender de ningun feature especifico

### 8.3. Como Agregar un Servicio Core

1. Crear en `core/services/{nombre}.service.ts`
2. Usar `providedIn: 'root'` para singleton
3. Definir interfaces en `core/models/`
4. Exportar en `core/index.ts`
5. El servicio NO debe importar de `features/` ni de `shared/components/`

### 8.4. Orden de Implementacion Recomendado

```
Fase 1 (actual):
  [x] Estructura del proyecto
  [ ] core/models/ - interfaces y enums
  [ ] features/login/data/ - mock data
  [ ] shared/components/ - numeric-keypad, avatar-card, pin-input
  [ ] features/login/pages/user-selector
  [ ] features/login/pages/pin-entry
  [ ] shared/components/ - calendar-picker, shift-selector
  [ ] features/login/pages/shift-selector
  [ ] features/login/pages/shift-confirmation
  [ ] core/services/ - auth, shift, user (con mock data)
  [ ] core/guards/ - auth, shift

Fase 2 (salon):
  [ ] features/salon/ - plano del restaurante y mesas

Fase 3 (mesa):
  [ ] features/mesa/ - toma de pedidos

Fase 4 (backend):
  [ ] pos-backend/ - API REST con Spring Boot
  [ ] Migracion de mock data a llamadas HTTP reales

Fase 5 (extras):
  [ ] features/estadisticas/
  [ ] features/config/
```

---

> Documento generado como parte de la planificacion del modulo POS de Maxirest Online.
> Sigue el patron de proyecto estandar definido en el template Maxirest.
