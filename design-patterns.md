# Patrones de Diseno - Modulo Punto de Venta (POS)

> Maxirest Restaurant Management System
> Modulo: Punto de Venta (POS)
> Stack: Angular 19+ (frontend) / Java 21 + Spring Boot 3.4.x (backend)
> Ultima actualizacion: Abril 2026

---

## Tabla de Contenidos

1. [Vision General](#1-vision-general)
2. [Mapa de Patrones por Funcionalidad](#2-mapa-de-patrones-por-funcionalidad)
3. [Patrones Comportamentales](#3-patrones-comportamentales)
   - 3.1 State (Flujo de Login)
   - 3.2 Strategy (Calculo de Pagos)
   - 3.3 Observer (Actualizaciones en Tiempo Real)
   - 3.4 Command (Operaciones de Pedido)
   - 3.5 Memento (Rollback de Transacciones)
4. [Patrones Creacionales](#4-patrones-creacionales)
   - 4.1 Factory Method (Creacion de Comprobantes)
   - 4.2 Abstract Factory (Creacion de UI por Rol)
   - 4.3 Singleton (Gestion de Sesion y Turno)
5. [Patrones Estructurales](#5-patrones-estructurales)
   - 5.1 Decorator (Descuentos y Recargos)
   - 5.2 Adapter (Integraciones Externas)
   - 5.3 Composite (Estructura de Menu)
   - 5.4 Proxy (Cache y Control de Acceso)
   - 5.5 Facade (Simplificacion de Subsistemas)
6. [Patrones de Arquitectura](#6-patrones-de-arquitectura)
   - 6.1 CQRS Simplificado
   - 6.2 Repository + Service Layer
   - 6.3 Event-Driven (Spring Events)
7. [Patrones Frontend Angular](#7-patrones-frontend-angular)
   - 7.1 State Machine con Signals
   - 7.2 Container/Presentational
   - 7.3 Optimistic Updates con Memento
8. [Matriz de Decision](#8-matriz-de-decision)
9. [Anti-Patrones a Evitar](#9-anti-patrones-a-evitar)

---

## 1. Vision General

El modulo POS es el punto critico de interaccion en tiempo real del sistema Maxirest.
A diferencia de los modulos de gestion (Inventario, Produccion, Ventas), el POS requiere:

- **Baja latencia**: Las operaciones del mozo no pueden esperar
- **Alta disponibilidad**: Si el POS cae, el restaurante no factura
- **Offline-first** (futuro): Debe funcionar con conectividad intermitente
- **Multiples roles**: Mozo, cajero y cocinero ven interfaces distintas
- **Estado complejo**: Login -> Turno -> Salon -> Mesa -> Pedido -> Pago

Los patrones de diseno seleccionados estan orientados a manejar esta complejidad
sin sacrificar rendimiento ni mantenibilidad.

### Diagrama de Flujo Principal

```
  +----------+     +-----------+     +----------+     +----------+
  |  LOGIN   | --> |   TURNO   | --> |  SALON   | --> |   MESA   |
  | (State)  |     | (Singlet) |     | (Observ) |     | (Command)|
  +----------+     +-----------+     +----------+     +----------+
       |                |                 |                 |
       v                v                 v                 v
  [Seleccion]     [Apertura/      [Vista mesas     [Tomar pedido
   usuario +       cierre de       con estado       modificar,
   PIN +           turno unico     en tiempo        dividir cuenta,
   validacion]     por sucursal]   real]            cobrar]
                                                         |
                                                         v
                                                   +----------+
                                                   |   PAGO   |
                                                   | (Strateg)|
                                                   +----------+
                                                         |
                                                         v
                                                   +----------+
                                                   | COMPROB. |
                                                   | (Factory)|
                                                   +----------+
```

---

## 2. Mapa de Patrones por Funcionalidad

| Funcionalidad              | Patron Principal  | Patron Secundario | Capa       |
|---------------------------|-------------------|-------------------|------------|
| Flujo de Login            | State             | -                 | Frontend   |
| Validacion de PIN         | Strategy          | -                 | Backend    |
| Gestion de Turno          | Singleton         | Observer          | Ambas      |
| Permisos por Rol          | Strategy          | Proxy             | Ambas      |
| Vista de Salon            | Observer          | Composite         | Frontend   |
| Tomar Pedido              | Command           | Memento           | Ambas      |
| Modificar Pedido          | Command           | Memento           | Ambas      |
| Dividir Cuenta            | Strategy          | -                 | Backend    |
| Calculo de Precio         | Decorator         | Strategy          | Backend    |
| Procesamiento de Pago     | Strategy          | Factory           | Backend    |
| Emision de Comprobante    | Factory Method    | -                 | Backend    |
| Integracion Fiscal        | Adapter           | -                 | Backend    |
| Display Cocina            | Observer          | -                 | Frontend   |
| Menu/Carta                | Composite         | -                 | Ambas      |
| Cache de Productos        | Proxy             | -                 | Backend    |
| Operaciones Complejas     | Facade            | -                 | Backend    |

---

## 3. Patrones Comportamentales

### 3.1 State Pattern - Flujo de Login

#### Por que State y no condicionales

El flujo de login del POS tiene 4 estados claramente definidos con transiciones
estrictas. Sin el patron State, el componente tendria multiples `if/switch`
anidados para controlar que se muestra y que acciones son validas en cada momento.

**Problema que resuelve:**
- Elimina condicionales complejos tipo `if (estado === 'pin' && intentos < 3 && ...)`
- Cada estado encapsula su propia logica de validacion y transicion
- Agregar un nuevo estado (ej: seleccion de sucursal) no modifica estados existentes

**Por que NO otros patrones:**
- Strategy: Los estados no son intercambiables, tienen transiciones definidas
- Chain of Responsibility: No hay "cadena", hay un flujo lineal con posibles retrocesos

#### Diagrama de Estados

```
                          [Inicio]
                             |
                             v
                    +------------------+
                    | USER_SELECTION   |
                    | - Lista usuarios |
                    | - Filtro rapido  |
                    +------------------+
                             |
                      selectUser()
                             |
                             v
                    +------------------+
                    | PIN_ENTRY        |
                    | - Input 6 dig.  |
                    | - Max 3 intentos|
                    | - Btn volver    |
                    +------------------+
                        |          |
                   validPin()  failPin()
                        |          |
                        |     intentos < 3?
                        |      /       \
                        |    SI        NO
                        |    |          |
                        |  retry    +------------------+
                        |           | BLOCKED          |
                        |           | - Msg bloqueado  |
                        |           | - Btn volver     |
                        |           +------------------+
                        v
                    +------------------+
                    | SHIFT_SELECTION  |
                    | - Calendario    |
                    | - Lista turnos  |
                    | - Turno abierto?|
                    +------------------+
                             |
                     confirmShift()
                             |
                             v
                    +------------------+
                    | AUTHENTICATED    |
                    | - Redirect salon|
                    +------------------+
```

#### Implementacion Frontend (TypeScript + Angular Signals)

```typescript
// ============================================================
// login-state.model.ts - Definicion de estados e interfaz
// ============================================================

export type LoginPhase =
  | 'USER_SELECTION'
  | 'PIN_ENTRY'
  | 'SHIFT_SELECTION'
  | 'BLOCKED'
  | 'AUTHENTICATED';

export interface LoginStateData {
  phase: LoginPhase;
  selectedUser: PosUser | null;
  pinAttempts: number;
  selectedShift: Shift | null;
  errorMessage: string | null;
}

export const INITIAL_LOGIN_STATE: LoginStateData = {
  phase: 'USER_SELECTION',
  selectedUser: null,
  pinAttempts: 0,
  selectedShift: null,
  errorMessage: null,
};

// Interfaz que cada estado debe implementar
export interface LoginState {
  readonly phase: LoginPhase;
  canSelectUser(): boolean;
  canEnterPin(): boolean;
  canSelectShift(): boolean;
  canGoBack(): boolean;
}
```

```typescript
// ============================================================
// login-states.ts - Implementaciones concretas de cada estado
// ============================================================

export class UserSelectionState implements LoginState {
  readonly phase: LoginPhase = 'USER_SELECTION';

  canSelectUser(): boolean { return true; }
  canEnterPin(): boolean { return false; }
  canSelectShift(): boolean { return false; }
  canGoBack(): boolean { return false; } // Es el estado inicial
}

export class PinEntryState implements LoginState {
  readonly phase: LoginPhase = 'PIN_ENTRY';

  canSelectUser(): boolean { return false; }
  canEnterPin(): boolean { return true; }
  canSelectShift(): boolean { return false; }
  canGoBack(): boolean { return true; }
}

export class ShiftSelectionState implements LoginState {
  readonly phase: LoginPhase = 'SHIFT_SELECTION';

  canSelectUser(): boolean { return false; }
  canEnterPin(): boolean { return false; }
  canSelectShift(): boolean { return true; }
  canGoBack(): boolean { return true; }
}

export class BlockedState implements LoginState {
  readonly phase: LoginPhase = 'BLOCKED';

  canSelectUser(): boolean { return false; }
  canEnterPin(): boolean { return false; }
  canSelectShift(): boolean { return false; }
  canGoBack(): boolean { return true; } // Puede volver a seleccion
}

export class AuthenticatedState implements LoginState {
  readonly phase: LoginPhase = 'AUTHENTICATED';

  canSelectUser(): boolean { return false; }
  canEnterPin(): boolean { return false; }
  canSelectShift(): boolean { return false; }
  canGoBack(): boolean { return false; }
}
```

```typescript
// ============================================================
// login-state.service.ts - Maquina de estados con Signals
// ============================================================

import { Injectable, signal, computed } from '@angular/core';

const MAX_PIN_ATTEMPTS = 3;

@Injectable({ providedIn: 'root' })
export class LoginStateService {
  // Estado interno reactivo
  private readonly _state = signal<LoginStateData>(INITIAL_LOGIN_STATE);
  private readonly _currentState = signal<LoginState>(new UserSelectionState());

  // Selectores publicos (readonly)
  readonly phase = computed(() => this._state().phase);
  readonly selectedUser = computed(() => this._state().selectedUser);
  readonly pinAttempts = computed(() => this._state().pinAttempts);
  readonly selectedShift = computed(() => this._state().selectedShift);
  readonly errorMessage = computed(() => this._state().errorMessage);
  readonly canGoBack = computed(() => this._currentState().canGoBack());

  // --- Transiciones ---

  selectUser(user: PosUser): void {
    if (!this._currentState().canSelectUser()) return;

    this._state.update(s => ({
      ...s,
      phase: 'PIN_ENTRY',
      selectedUser: user,
      pinAttempts: 0,
      errorMessage: null,
    }));
    this._currentState.set(new PinEntryState());
  }

  submitPin(pin: string): void {
    if (!this._currentState().canEnterPin()) return;

    const user = this._state().selectedUser;
    if (!user) return;

    if (pin === user.pin) {
      // PIN correcto -> Seleccion de turno
      this._state.update(s => ({
        ...s,
        phase: 'SHIFT_SELECTION',
        errorMessage: null,
      }));
      this._currentState.set(new ShiftSelectionState());
    } else {
      const newAttempts = this._state().pinAttempts + 1;
      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        // Bloqueado
        this._state.update(s => ({
          ...s,
          phase: 'BLOCKED',
          pinAttempts: newAttempts,
          errorMessage: `Usuario bloqueado tras ${MAX_PIN_ATTEMPTS} intentos fallidos`,
        }));
        this._currentState.set(new BlockedState());
      } else {
        // Reintentar
        this._state.update(s => ({
          ...s,
          pinAttempts: newAttempts,
          errorMessage: `PIN incorrecto. Intento ${newAttempts}/${MAX_PIN_ATTEMPTS}`,
        }));
      }
    }
  }

  confirmShift(shift: Shift): void {
    if (!this._currentState().canSelectShift()) return;

    this._state.update(s => ({
      ...s,
      phase: 'AUTHENTICATED',
      selectedShift: shift,
      errorMessage: null,
    }));
    this._currentState.set(new AuthenticatedState());
  }

  goBack(): void {
    if (!this._currentState().canGoBack()) return;

    const current = this._state().phase;
    switch (current) {
      case 'PIN_ENTRY':
      case 'BLOCKED':
        this._state.set({ ...INITIAL_LOGIN_STATE });
        this._currentState.set(new UserSelectionState());
        break;
      case 'SHIFT_SELECTION':
        this._state.update(s => ({
          ...s,
          phase: 'PIN_ENTRY',
          pinAttempts: 0,
          errorMessage: null,
        }));
        this._currentState.set(new PinEntryState());
        break;
    }
  }

  reset(): void {
    this._state.set({ ...INITIAL_LOGIN_STATE });
    this._currentState.set(new UserSelectionState());
  }
}
```

#### Implementacion Backend (Java + Spring Boot)

```java
// ============================================================
// LoginState.java - Interfaz del estado
// ============================================================
package com.maxisistemas.maxirestonline.pos.model.state;

public interface LoginState {
    LoginPhase getPhase();
    LoginState onPinSubmitted(String pin, String expectedPin, int currentAttempts);
    LoginState onShiftSelected();
    boolean canRetry();
}
```

```java
// ============================================================
// LoginPhase.java - Enum de fases
// ============================================================
package com.maxisistemas.maxirestonline.pos.model.state;

public enum LoginPhase {
    USER_SELECTION,
    PIN_ENTRY,
    SHIFT_SELECTION,
    BLOCKED,
    AUTHENTICATED
}
```

```java
// ============================================================
// PinEntryState.java - Estado concreto
// ============================================================
package com.maxisistemas.maxirestonline.pos.model.state;

public class PinEntryState implements LoginState {

    private static final int MAX_ATTEMPTS = 3;

    @Override
    public LoginPhase getPhase() {
        return LoginPhase.PIN_ENTRY;
    }

    @Override
    public LoginState onPinSubmitted(String pin, String expectedPin, int currentAttempts) {
        if (pin.equals(expectedPin)) {
            return new ShiftSelectionState();
        }
        int newAttempts = currentAttempts + 1;
        if (newAttempts >= MAX_ATTEMPTS) {
            return new BlockedState();
        }
        return this; // Permanece en PIN_ENTRY para reintento
    }

    @Override
    public LoginState onShiftSelected() {
        throw new IllegalStateException("No se puede seleccionar turno durante ingreso de PIN");
    }

    @Override
    public boolean canRetry() {
        return true;
    }
}
```

---

### 3.2 Strategy Pattern - Procesamiento de Pagos

#### Por que Strategy

El POS debe soportar multiples formas de pago (efectivo, tarjeta, QR, cuenta corriente)
y cada una tiene reglas distintas de validacion, calculo de vuelto y generacion de
movimiento. Strategy permite agregar nuevas formas de pago sin modificar el servicio
de cobro.

**Problema que resuelve:**
- Elimina `switch(formaPago)` en el servicio de cobro
- Cada forma de pago encapsula su propia logica
- Se pueden agregar nuevas formas de pago como beans Spring sin tocar codigo existente

**Por que NO otros patrones:**
- State: Las formas de pago no son estados secuenciales, son algoritmos intercambiables
- Factory: Factory crea objetos; Strategy define comportamiento. Aqui el comportamiento varia

#### Diagrama de Clases

```
                   +------------------------+
                   |    PaymentContext       |
                   | (CobrarService)        |
                   |------------------------|
                   | - strategy: Payment    |
                   |   Strategy             |
                   |------------------------|
                   | + cobrar(pedido, monto)|
                   | + setStrategy(s)       |
                   +------------------------+
                              |
                              | usa
                              v
                   +------------------------+
                   |  <<interface>>         |
                   |  PaymentStrategy       |
                   |------------------------|
                   | + validar(monto): bool |
                   | + procesar(pedido,     |
                   |     monto): Resultado  |
                   | + calcularVuelto(      |
                   |     pagado, total): $  |
                   | + getTipo(): String    |
                   +------------------------+
                       ^    ^    ^    ^
          +------------+    |    |    +-------------+
          |                 |    |                   |
  +---------------+ +---------------+ +-------------------+
  | EfectivoStrat | | TarjetaStrat  | | CuentaCorrienteS  |
  |               | |               | |                   |
  | - vuelto: si  | | - vuelto: no  | | - vuelto: no      |
  | - valida: >=0 | | - valida: pos | | - valida: limite  |
  +---------------+ +---------------+ +-------------------+
```

#### Implementacion Backend

```java
// ============================================================
// PaymentStrategy.java - Interfaz de estrategia
// ============================================================
package com.maxisistemas.maxirestonline.pos.service.strategy;

import com.maxisistemas.maxirestonline.pos.model.dto.PaymentResultDto;
import java.math.BigDecimal;

public interface PaymentStrategy {

    /**
     * Identificador de la forma de pago.
     * Corresponde al codigo en la tabla formas_cobro.
     */
    String getTipo();

    /**
     * Valida si el monto y condiciones son correctos para esta forma de pago.
     */
    boolean validar(BigDecimal monto, BigDecimal totalPedido);

    /**
     * Procesa el pago y retorna el resultado con movimiento generado.
     */
    PaymentResultDto procesar(Long pedidoId, BigDecimal monto);

    /**
     * Calcula el vuelto. Retorna ZERO si la forma de pago no da vuelto.
     */
    BigDecimal calcularVuelto(BigDecimal montoPagado, BigDecimal totalPedido);
}
```

```java
// ============================================================
// EfectivoPaymentStrategy.java - Pago en efectivo
// ============================================================
package com.maxisistemas.maxirestonline.pos.service.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class EfectivoPaymentStrategy implements PaymentStrategy {

    private final MovimientoService movimientoService;

    @Override
    public String getTipo() {
        return "EFECTIVO";
    }

    @Override
    public boolean validar(BigDecimal monto, BigDecimal totalPedido) {
        // Efectivo acepta montos mayores al total (se da vuelto)
        return monto.compareTo(BigDecimal.ZERO) > 0;
    }

    @Override
    public PaymentResultDto procesar(Long pedidoId, BigDecimal monto) {
        var movimiento = movimientoService.registrarIngreso(pedidoId, monto, getTipo());
        return PaymentResultDto.builder()
                .exitoso(true)
                .movimientoId(movimiento.getId())
                .tipo(getTipo())
                .monto(monto)
                .build();
    }

    @Override
    public BigDecimal calcularVuelto(BigDecimal montoPagado, BigDecimal totalPedido) {
        BigDecimal diferencia = montoPagado.subtract(totalPedido);
        return diferencia.compareTo(BigDecimal.ZERO) > 0 ? diferencia : BigDecimal.ZERO;
    }
}
```

```java
// ============================================================
// TarjetaPaymentStrategy.java - Pago con tarjeta
// ============================================================
package com.maxisistemas.maxirestonline.pos.service.strategy;

@Component
@RequiredArgsConstructor
public class TarjetaPaymentStrategy implements PaymentStrategy {

    private final MovimientoService movimientoService;

    @Override
    public String getTipo() { return "TARJETA"; }

    @Override
    public boolean validar(BigDecimal monto, BigDecimal totalPedido) {
        // Tarjeta debe ser el monto exacto (no da vuelto)
        return monto.compareTo(BigDecimal.ZERO) > 0
            && monto.compareTo(totalPedido) <= 0;
    }

    @Override
    public PaymentResultDto procesar(Long pedidoId, BigDecimal monto) {
        var movimiento = movimientoService.registrarIngreso(pedidoId, monto, getTipo());
        return PaymentResultDto.builder()
                .exitoso(true)
                .movimientoId(movimiento.getId())
                .tipo(getTipo())
                .monto(monto)
                .build();
    }

    @Override
    public BigDecimal calcularVuelto(BigDecimal montoPagado, BigDecimal totalPedido) {
        return BigDecimal.ZERO; // Tarjeta no da vuelto
    }
}
```

```java
// ============================================================
// PaymentStrategyResolver.java - Resuelve la estrategia por tipo
// ============================================================
package com.maxisistemas.maxirestonline.pos.service.strategy;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentStrategyResolver {

    private final List<PaymentStrategy> strategies;
    private Map<String, PaymentStrategy> strategyMap;

    @PostConstruct
    void init() {
        strategyMap = strategies.stream()
                .collect(Collectors.toMap(
                        PaymentStrategy::getTipo,
                        Function.identity()
                ));
    }

    public PaymentStrategy resolve(String tipoPago) {
        PaymentStrategy strategy = strategyMap.get(tipoPago.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException(
                "Forma de pago no soportada: " + tipoPago
            );
        }
        return strategy;
    }

    public List<String> getFormasPagoDisponibles() {
        return List.copyOf(strategyMap.keySet());
    }
}
```

#### Implementacion Frontend (TypeScript)

```typescript
// ============================================================
// payment-strategy.model.ts
// ============================================================

export interface PaymentStrategy {
  readonly tipo: string;
  readonly label: string;
  readonly icon: string;
  readonly allowsChange: boolean; // Si permite vuelto

  validate(monto: number, total: number): PaymentValidation;
  calculateChange(paid: number, total: number): number;
}

export interface PaymentValidation {
  valid: boolean;
  errorMessage?: string;
}

export class EfectivoStrategy implements PaymentStrategy {
  readonly tipo = 'EFECTIVO';
  readonly label = 'Efectivo';
  readonly icon = 'cash';
  readonly allowsChange = true;

  validate(monto: number, total: number): PaymentValidation {
    if (monto <= 0) return { valid: false, errorMessage: 'El monto debe ser mayor a 0' };
    return { valid: true };
  }

  calculateChange(paid: number, total: number): number {
    return Math.max(0, paid - total);
  }
}

export class TarjetaStrategy implements PaymentStrategy {
  readonly tipo = 'TARJETA';
  readonly label = 'Tarjeta';
  readonly icon = 'credit-card';
  readonly allowsChange = false;

  validate(monto: number, total: number): PaymentValidation {
    if (monto <= 0) return { valid: false, errorMessage: 'El monto debe ser mayor a 0' };
    if (monto > total) return { valid: false, errorMessage: 'El monto no puede superar el total' };
    return { valid: true };
  }

  calculateChange(): number {
    return 0;
  }
}
```

---

### 3.3 Observer Pattern - Actualizaciones en Tiempo Real

#### Por que Observer

El salon del POS necesita reflejar cambios en tiempo real: cuando un mozo toma
un pedido, la vista del salon de otros dispositivos debe actualizarse. Cuando la
cocina marca un plato como listo, el mozo debe saberlo.

**Problema que resuelve:**
- Desacopla productores de eventos (servicio de pedidos) de consumidores (vista salon, cocina)
- Permite agregar nuevos "listeners" sin modificar el productor
- Evita polling constante al servidor

**Por que NO otros patrones:**
- Mediator: Seria sobredimensionado; no necesitamos un objeto central que coordine toda la comunicacion
- Pub/Sub puro: Para comunicacion intra-aplicacion, Observer es suficiente

#### Diagrama

```
  +-------------------+          +--------------------+
  |   PedidoService   |          |  <<interface>>     |
  | (Subject/Emitter) |          |  PedidoListener    |
  |-------------------|          |--------------------|
  | + crearPedido()   | -------> | + onPedidoCreado() |
  | + modificar()     |  notifica| + onPedidoModif()  |
  | + cerrarPedido()  |          | + onPedidoCerrado()|
  +-------------------+          +--------------------+
                                    ^       ^       ^
                                    |       |       |
                           +--------+   +---+---+  +--------+
                           |            |       |           |
                    +-----------+ +----------+ +-----------+
                    | SalonView | | CocinaD. | | Estadist. |
                    | Listener  | | Listener | | Listener  |
                    +-----------+ +----------+ +-----------+
```

#### Implementacion Backend (Spring Events)

```java
// ============================================================
// PedidoEvent.java - Evento de dominio
// ============================================================
package com.maxisistemas.maxirestonline.pos.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PedidoEvent extends ApplicationEvent {

    public enum Tipo { CREADO, MODIFICADO, CERRADO, ITEM_AGREGADO, ITEM_REMOVIDO }

    private final Long pedidoId;
    private final Long mesaId;
    private final Tipo tipo;
    private final Object payload; // Datos adicionales segun el tipo

    public PedidoEvent(Object source, Long pedidoId, Long mesaId, Tipo tipo, Object payload) {
        super(source);
        this.pedidoId = pedidoId;
        this.mesaId = mesaId;
        this.tipo = tipo;
        this.payload = payload;
    }
}
```

```java
// ============================================================
// PedidoCommandService.java - Publica eventos al modificar pedidos
// ============================================================
package com.maxisistemas.maxirestonline.pos.service;

@Service
@RequiredArgsConstructor
public class PedidoCommandService {

    private final PedidoRepository pedidoRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PedidoDto crearPedido(Long mesaId, Long userId) {
        var pedido = Pedido.builder()
                .mesa(mesaRepository.getReferenceById(mesaId))
                .mozo(userRepository.getReferenceById(userId))
                .estado(EstadoPedido.ABIERTO)
                .build();
        pedido = pedidoRepository.save(pedido);

        eventPublisher.publishEvent(
            new PedidoEvent(this, pedido.getId(), mesaId, PedidoEvent.Tipo.CREADO, null)
        );

        return pedidoMapper.toDto(pedido);
    }
}
```

```java
// ============================================================
// SalonEventListener.java - Escucha eventos para actualizar vista de salon
// ============================================================
package com.maxisistemas.maxirestonline.pos.event.listener;

@Component
@RequiredArgsConstructor
@Slf4j
public class SalonEventListener {

    private final SseEmitterService sseEmitterService;

    @EventListener
    public void onPedidoEvent(PedidoEvent event) {
        log.info("Salon: Pedido {} en mesa {} -> {}",
                event.getPedidoId(), event.getMesaId(), event.getTipo());

        // Envia update via SSE a todos los clientes conectados
        sseEmitterService.broadcast("salon-update", Map.of(
                "mesaId", event.getMesaId(),
                "tipo", event.getTipo().name(),
                "pedidoId", event.getPedidoId()
        ));
    }
}
```

```java
// ============================================================
// CocinaEventListener.java - Escucha eventos para display de cocina
// ============================================================
@Component
@RequiredArgsConstructor
public class CocinaEventListener {

    private final SseEmitterService sseEmitterService;

    @EventListener
    @Async // Asincrono para no bloquear el flujo principal
    public void onItemAgregado(PedidoEvent event) {
        if (event.getTipo() != PedidoEvent.Tipo.ITEM_AGREGADO) return;

        sseEmitterService.broadcast("cocina-update", Map.of(
                "mesaId", event.getMesaId(),
                "items", event.getPayload()
        ));
    }
}
```

#### Implementacion Frontend (Angular Signals + SSE)

```typescript
// ============================================================
// salon-realtime.service.ts - Servicio de actualizaciones en tiempo real
// ============================================================

@Injectable({ providedIn: 'root' })
export class SalonRealtimeService implements OnDestroy {

  private eventSource: EventSource | null = null;

  // Signal que emite el ultimo evento recibido
  private readonly _lastEvent = signal<SalonUpdateEvent | null>(null);
  readonly lastEvent = this._lastEvent.asReadonly();

  // Signal con el estado de todas las mesas (se actualiza reactivamente)
  private readonly _mesasState = signal<Map<number, MesaState>>(new Map());
  readonly mesasState = this._mesasState.asReadonly();

  connect(salonId: number): void {
    this.disconnect();

    this.eventSource = new EventSource(`/api/v1/pos/salon/${salonId}/stream`);

    this.eventSource.addEventListener('salon-update', (event: MessageEvent) => {
      const data: SalonUpdateEvent = JSON.parse(event.data);
      this._lastEvent.set(data);

      // Actualizar estado de la mesa afectada
      this._mesasState.update(mesas => {
        const updated = new Map(mesas);
        updated.set(data.mesaId, {
          ...updated.get(data.mesaId)!,
          estado: data.nuevoEstado ?? updated.get(data.mesaId)?.estado,
          ultimaActualizacion: new Date(),
        });
        return updated;
      });
    });
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
```

---

### 3.4 Command Pattern - Operaciones de Pedido

#### Por que Command

Las operaciones sobre un pedido (agregar item, quitar item, cambiar cantidad,
aplicar descuento) necesitan ser: reversibles (undo), registrables (log de
auditoria) y agrupables (aplicar varios cambios como una transaccion).

**Problema que resuelve:**
- Cada operacion es un objeto que encapsula toda la informacion necesaria
- Se pueden deshacer operaciones (undo) almacenando el comando inverso
- Se pueden agrupar comandos en una macro-operacion
- Se genera un log de auditoria automatico

**Por que NO otros patrones:**
- Strategy: Strategy selecciona un algoritmo; Command encapsula una accion completa con sus datos
- Memento: Memento guarda snapshots del estado completo; Command guarda operaciones individuales
  (se complementan: Command para undo granular, Memento para rollback total)

#### Diagrama

```
  +------------------+        +---------------------+
  |   MesaComponent  |        |   <<interface>>     |
  |  (Invoker)       | -----> |   PedidoCommand     |
  |------------------|        |---------------------|
  | - historial:     |        | + execute(): void   |
  |   PedidoCommand[]|        | + undo(): void      |
  | + ejecutar(cmd)  |        | + describe(): String|
  | + deshacer()     |        +---------------------+
  +------------------+              ^         ^
                                    |         |
                        +-----------+   +-----+---------+
                        |               |               |
               +----------------+ +----------------+ +------------------+
               | AgregarItemCmd | | QuitarItemCmd  | | CambiarCantCmd   |
               |----------------|+----------------|+|------------------|
               | - pedidoId     || - pedidoId     || - pedidoId        |
               | - productoId   || - itemId       || - itemId          |
               | - cantidad     || - itemBackup   || - cantidadAnterior|
               | - precio       ||                || - cantidadNueva   |
               +----------------+ +----------------+ +------------------+
```

#### Implementacion Backend

```java
// ============================================================
// PedidoCommand.java - Interfaz de comando
// ============================================================
package com.maxisistemas.maxirestonline.pos.command;

public interface PedidoCommand {

    /** Ejecuta el comando sobre el pedido */
    PedidoCommandResult execute();

    /** Deshace el comando (operacion inversa) */
    void undo();

    /** Descripcion legible para auditoria */
    String describe();
}
```

```java
// ============================================================
// AgregarItemCommand.java - Comando para agregar item al pedido
// ============================================================
package com.maxisistemas.maxirestonline.pos.command;

@RequiredArgsConstructor
public class AgregarItemCommand implements PedidoCommand {

    private final PedidoRepository pedidoRepository;
    private final Long pedidoId;
    private final Long productoId;
    private final int cantidad;
    private final BigDecimal precioUnitario;

    // Referencia al item creado, necesaria para undo
    private Long itemCreadoId;

    @Override
    public PedidoCommandResult execute() {
        var pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado"));

        var item = PedidoItem.builder()
                .pedido(pedido)
                .productoId(productoId)
                .cantidad(cantidad)
                .precioUnitario(precioUnitario)
                .build();

        pedido.getItems().add(item);
        pedidoRepository.save(pedido);

        this.itemCreadoId = item.getId();

        return PedidoCommandResult.success("Item agregado al pedido");
    }

    @Override
    public void undo() {
        if (itemCreadoId == null) return;

        var pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        pedido.getItems().removeIf(i -> i.getId().equals(itemCreadoId));
        pedidoRepository.save(pedido);
    }

    @Override
    public String describe() {
        return String.format("Agregar %dx producto %d al pedido %d",
                cantidad, productoId, pedidoId);
    }
}
```

```java
// ============================================================
// PedidoCommandInvoker.java - Ejecutor con historial
// ============================================================
package com.maxisistemas.maxirestonline.pos.command;

import org.springframework.stereotype.Component;
import java.util.ArrayDeque;
import java.util.Deque;

@Component
public class PedidoCommandInvoker {

    // Historial por pedido para soportar undo
    private final Map<Long, Deque<PedidoCommand>> historiales = new ConcurrentHashMap<>();

    public PedidoCommandResult ejecutar(Long pedidoId, PedidoCommand command) {
        PedidoCommandResult result = command.execute();

        if (result.isExitoso()) {
            historiales.computeIfAbsent(pedidoId, k -> new ArrayDeque<>())
                    .push(command);
        }

        return result;
    }

    public void deshacer(Long pedidoId) {
        Deque<PedidoCommand> historial = historiales.get(pedidoId);
        if (historial == null || historial.isEmpty()) {
            throw new IllegalStateException("No hay operaciones para deshacer");
        }
        PedidoCommand lastCommand = historial.pop();
        lastCommand.undo();
    }

    public void limpiarHistorial(Long pedidoId) {
        historiales.remove(pedidoId);
    }
}
```

---

### 3.5 Memento Pattern - Rollback de Transacciones

#### Por que Memento

Cuando un cobro falla a mitad de proceso (ej: pago parcial con tarjeta rechazada),
necesitamos restaurar el estado completo del pedido al punto anterior. Memento
guarda snapshots del estado sin exponer la estructura interna del pedido.

Tambien se usa en frontend para Optimistic Updates: si la API falla, se restaura
el estado visual previo.

**Complementa a Command:**
- Command: undo granular operacion por operacion
- Memento: rollback completo a un checkpoint

#### Diagrama

```
  +---------------------+     +-------------------+     +------------------+
  |   PedidoService     |     |   PedidoMemento   |     |  MementoStore    |
  |   (Originator)      |     |   (Memento)       |     |  (Caretaker)     |
  |---------------------|     |-------------------|     |------------------|
  | + crearSnapshot():  | --> | - estado: String  |     | - snapshots:     |
  |     PedidoMemento   |     | - timestamp: Date |     |   Map<id,Stack>  |
  | + restaurar(m):void |     | - items: List     | <-- | + guardar(id, m) |
  +---------------------+     | - totales: Map    |     | + obtener(id): m |
                              +-------------------+     +------------------+
```

#### Implementacion Backend

```java
// ============================================================
// PedidoMemento.java - Snapshot inmutable del estado del pedido
// ============================================================
package com.maxisistemas.maxirestonline.pos.memento;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PedidoMemento {

    private final Long pedidoId;
    private final LocalDateTime timestamp;
    private final String estado;
    private final List<ItemSnapshot> items;
    private final BigDecimal subtotal;
    private final BigDecimal descuento;
    private final BigDecimal total;

    @Getter
    @Builder
    public static class ItemSnapshot {
        private final Long itemId;
        private final Long productoId;
        private final int cantidad;
        private final BigDecimal precioUnitario;
    }
}
```

```java
// ============================================================
// PedidoMementoService.java - Crea y restaura snapshots
// ============================================================
package com.maxisistemas.maxirestonline.pos.memento;

@Service
@RequiredArgsConstructor
public class PedidoMementoService {

    private final PedidoRepository pedidoRepository;

    /** Crea un snapshot del estado actual del pedido */
    public PedidoMemento crearSnapshot(Long pedidoId) {
        var pedido = pedidoRepository.findWithItemsById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado"));

        return PedidoMemento.builder()
                .pedidoId(pedidoId)
                .timestamp(LocalDateTime.now())
                .estado(pedido.getEstado().name())
                .items(pedido.getItems().stream()
                        .map(i -> PedidoMemento.ItemSnapshot.builder()
                                .itemId(i.getId())
                                .productoId(i.getProductoId())
                                .cantidad(i.getCantidad())
                                .precioUnitario(i.getPrecioUnitario())
                                .build())
                        .toList())
                .subtotal(pedido.getSubtotal())
                .descuento(pedido.getDescuento())
                .total(pedido.getTotal())
                .build();
    }

    /** Restaura el pedido al estado del snapshot */
    @Transactional
    public void restaurar(PedidoMemento memento) {
        var pedido = pedidoRepository.findWithItemsById(memento.getPedidoId())
                .orElseThrow();

        pedido.setEstado(EstadoPedido.valueOf(memento.getEstado()));
        pedido.getItems().clear();

        for (var itemSnap : memento.getItems()) {
            pedido.getItems().add(PedidoItem.builder()
                    .pedido(pedido)
                    .productoId(itemSnap.getProductoId())
                    .cantidad(itemSnap.getCantidad())
                    .precioUnitario(itemSnap.getPrecioUnitario())
                    .build());
        }

        pedidoRepository.save(pedido);
    }
}
```

#### Implementacion Frontend (Optimistic Updates)

```typescript
// ============================================================
// mesa-state-memento.service.ts - Memento para Optimistic Updates
// ============================================================

@Injectable({ providedIn: 'root' })
export class MesaStateMementoService {

  /**
   * Crea un snapshot profundo del estado actual.
   * Se usa ANTES de aplicar un cambio optimista.
   */
  createSnapshot<T>(state: T): T {
    return structuredClone(state);
  }

  /**
   * Wrapper para operaciones optimistas con rollback automatico.
   *
   * Uso:
   *   await this.mementoService.withOptimisticUpdate(
   *     this.items,                        // signal a modificar
   *     items => items.filter(i => ...),   // cambio optimista
   *     () => this.api.deleteItem(id),     // llamada real
   *   );
   */
  async withOptimisticUpdate<T>(
    stateSignal: WritableSignal<T>,
    optimisticChange: (current: T) => T,
    apiCall: () => Observable<unknown>,
  ): Promise<void> {
    // 1. Guardar snapshot (Memento)
    const snapshot = this.createSnapshot(stateSignal());

    // 2. Aplicar cambio optimista
    stateSignal.update(optimisticChange);

    // 3. Ejecutar llamada real
    try {
      await firstValueFrom(apiCall());
    } catch (error) {
      // 4. Rollback en caso de error
      stateSignal.set(snapshot);
      throw error; // Re-throw para que el componente muestre el error
    }
  }
}
```

---

## 4. Patrones Creacionales

### 4.1 Factory Method - Creacion de Comprobantes

#### Por que Factory Method

El POS emite distintos tipos de comprobantes (ticket, factura A, factura B, nota de
credito) segun el tipo de cliente y la operacion. Cada comprobante tiene estructura,
numeracion y reglas fiscales distintas.

**Problema que resuelve:**
- Centraliza la logica de creacion de comprobantes
- Cada tipo de comprobante se construye en su propia factory concreta
- Agregar un nuevo tipo de comprobante no modifica el codigo existente

#### Diagrama

```
  +---------------------------+
  |    ComprobanteFactory     |
  |     <<abstract>>          |
  |---------------------------|
  | + crear(pedido): Comp.    |
  | # construirHeader(): Head |  <-- Template Method interno
  | # construirBody(): Body   |
  | # construirFooter(): Foot |
  | # asignarNumero(): String |
  +---------------------------+
          ^           ^
          |           |
  +---------------+ +------------------+
  | TicketFactory | | FacturaAFactory  |
  |               | |                  |
  | - numeracion  | | - numeracion     |
  |   secuencial  | |   AFIP CAE      |
  | - sin IVA det | | - IVA detallado |
  +---------------+ +------------------+

  +-----------------------------------+
  |   ComprobanteFactoryResolver      |
  |-----------------------------------|
  | + resolve(tipo): ComprobanteFactory|
  +-----------------------------------+
```

#### Implementacion Backend

```java
// ============================================================
// ComprobanteFactory.java - Factory abstracta con Template Method
// ============================================================
package com.maxisistemas.maxirestonline.pos.factory;

public abstract class ComprobanteFactory {

    /** Factory Method principal */
    public Comprobante crear(Pedido pedido, DatosCliente cliente) {
        validarDatos(pedido, cliente);

        Comprobante comp = Comprobante.builder()
                .tipo(getTipoComprobante())
                .numero(asignarNumero())
                .fecha(LocalDateTime.now())
                .header(construirHeader(cliente))
                .items(construirItems(pedido))
                .footer(construirFooter(pedido))
                .build();

        return comp;
    }

    protected abstract TipoComprobante getTipoComprobante();
    protected abstract String asignarNumero();
    protected abstract ComprobanteHeader construirHeader(DatosCliente cliente);
    protected abstract List<ComprobanteItem> construirItems(Pedido pedido);
    protected abstract ComprobanteFooter construirFooter(Pedido pedido);
    protected abstract void validarDatos(Pedido pedido, DatosCliente cliente);
}
```

```java
// ============================================================
// TicketFactory.java - Crea tickets simples
// ============================================================
@Component
@RequiredArgsConstructor
public class TicketFactory extends ComprobanteFactory {

    private final NumeracionService numeracionService;

    @Override
    protected TipoComprobante getTipoComprobante() {
        return TipoComprobante.TICKET;
    }

    @Override
    protected String asignarNumero() {
        return numeracionService.nextTicketNumber();
    }

    @Override
    protected ComprobanteHeader construirHeader(DatosCliente cliente) {
        // Ticket: header simple sin datos fiscales del cliente
        return ComprobanteHeader.builder()
                .titulo("TICKET")
                .razonSocial(null) // No requerido en ticket
                .build();
    }

    @Override
    protected List<ComprobanteItem> construirItems(Pedido pedido) {
        return pedido.getItems().stream()
                .map(item -> ComprobanteItem.builder()
                        .descripcion(item.getProducto().getNombre())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getPrecioUnitario())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();
    }

    @Override
    protected ComprobanteFooter construirFooter(Pedido pedido) {
        return ComprobanteFooter.builder()
                .total(pedido.getTotal())
                .leyenda("Gracias por su visita")
                .build();
    }

    @Override
    protected void validarDatos(Pedido pedido, DatosCliente cliente) {
        // Ticket no requiere datos del cliente
    }
}
```

```java
// ============================================================
// FacturaAFactory.java - Crea facturas A (responsable inscripto)
// ============================================================
@Component
@RequiredArgsConstructor
public class FacturaAFactory extends ComprobanteFactory {

    private final NumeracionService numeracionService;
    private final AfipService afipService;

    @Override
    protected TipoComprobante getTipoComprobante() {
        return TipoComprobante.FACTURA_A;
    }

    @Override
    protected String asignarNumero() {
        return afipService.solicitarCAE(); // Numeracion controlada por AFIP
    }

    @Override
    protected ComprobanteHeader construirHeader(DatosCliente cliente) {
        return ComprobanteHeader.builder()
                .titulo("FACTURA A")
                .razonSocial(cliente.getRazonSocial())
                .cuit(cliente.getCuit())
                .condicionIva(cliente.getCondicionIva())
                .build();
    }

    @Override
    protected List<ComprobanteItem> construirItems(Pedido pedido) {
        // Factura A: items con IVA desglosado
        return pedido.getItems().stream()
                .map(item -> ComprobanteItem.builder()
                        .descripcion(item.getProducto().getNombre())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getPrecioNeto()) // Sin IVA
                        .iva(item.getIva())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();
    }

    @Override
    protected ComprobanteFooter construirFooter(Pedido pedido) {
        return ComprobanteFooter.builder()
                .subtotalNeto(pedido.getSubtotalNeto())
                .iva21(pedido.getIva21())
                .iva10(pedido.getIva10())
                .total(pedido.getTotal())
                .cae(pedido.getCae())
                .vencimientoCae(pedido.getVencimientoCae())
                .build();
    }

    @Override
    protected void validarDatos(Pedido pedido, DatosCliente cliente) {
        if (cliente.getCuit() == null || cliente.getCuit().isBlank()) {
            throw new ValidationException("CUIT requerido para Factura A");
        }
        if (cliente.getCondicionIva() == null) {
            throw new ValidationException("Condicion IVA requerida para Factura A");
        }
    }
}
```

---

### 4.2 Abstract Factory - Creacion de UI por Rol

#### Por que Abstract Factory

Cada tipo de usuario (mozo, cajero, cocinero) ve una interfaz diferente con distintos
componentes, acciones disponibles y datos visibles. Abstract Factory permite crear
"familias" de componentes de UI coherentes para cada rol.

Este patron se implementa en frontend como un servicio que retorna la configuracion
de UI segun el rol del usuario autenticado.

#### Implementacion Frontend

```typescript
// ============================================================
// pos-ui-factory.model.ts - Familias de UI por rol
// ============================================================

export interface PosUiConfig {
  readonly sidebarItems: SidebarItem[];
  readonly mesaActions: MesaAction[];
  readonly gridColumns: string[];
  readonly canOpenShift: boolean;
  readonly canCloseShift: boolean;
  readonly canVoidOrder: boolean;
  readonly canApplyDiscount: boolean;
}

export interface PosUiFactory {
  createUiConfig(): PosUiConfig;
}

// --- Implementaciones concretas ---

export class MozoUiFactory implements PosUiFactory {
  createUiConfig(): PosUiConfig {
    return {
      sidebarItems: [
        { label: 'Salon', icon: 'layout', route: '/pos/salon' },
        { label: 'Mis mesas', icon: 'user', route: '/pos/mis-mesas' },
      ],
      mesaActions: ['tomar-pedido', 'agregar-item', 'pedir-cuenta'],
      gridColumns: ['mesa', 'comensales', 'estado', 'tiempo'],
      canOpenShift: false,
      canCloseShift: false,
      canVoidOrder: false,
      canApplyDiscount: false,
    };
  }
}

export class CajeroUiFactory implements PosUiFactory {
  createUiConfig(): PosUiConfig {
    return {
      sidebarItems: [
        { label: 'Salon', icon: 'layout', route: '/pos/salon' },
        { label: 'Cobrar', icon: 'dollar-sign', route: '/pos/cobrar' },
        { label: 'Caja', icon: 'archive', route: '/pos/caja' },
        { label: 'Turnos', icon: 'clock', route: '/pos/turnos' },
      ],
      mesaActions: ['cobrar', 'anular-pedido', 'aplicar-descuento', 'reimprimir'],
      gridColumns: ['mesa', 'mozo', 'comensales', 'total', 'estado', 'tiempo'],
      canOpenShift: true,
      canCloseShift: true,
      canVoidOrder: true,
      canApplyDiscount: true,
    };
  }
}

export class CocineroUiFactory implements PosUiFactory {
  createUiConfig(): PosUiConfig {
    return {
      sidebarItems: [
        { label: 'Comandas', icon: 'clipboard', route: '/pos/cocina' },
      ],
      mesaActions: ['marcar-listo', 'ver-detalle'],
      gridColumns: ['mesa', 'items', 'prioridad', 'tiempo'],
      canOpenShift: false,
      canCloseShift: false,
      canVoidOrder: false,
      canApplyDiscount: false,
    };
  }
}
```

```typescript
// ============================================================
// pos-ui-factory.service.ts - Resolver de factory por rol
// ============================================================

@Injectable({ providedIn: 'root' })
export class PosUiFactoryService {

  private readonly factories: Record<UserRole, PosUiFactory> = {
    MOZO: new MozoUiFactory(),
    CAJERO: new CajeroUiFactory(),
    COCINERO: new CocineroUiFactory(),
  };

  private readonly sessionService = inject(SessionService);

  /** Signal reactivo con la configuracion de UI segun el rol actual */
  readonly uiConfig = computed(() => {
    const role = this.sessionService.currentRole();
    if (!role) return null;
    return this.factories[role].createUiConfig();
  });

  /** Accesos directos para uso en templates */
  readonly sidebarItems = computed(() => this.uiConfig()?.sidebarItems ?? []);
  readonly mesaActions = computed(() => this.uiConfig()?.mesaActions ?? []);
  readonly canVoidOrder = computed(() => this.uiConfig()?.canVoidOrder ?? false);
}
```

---

### 4.3 Singleton - Gestion de Sesion y Turno

#### Por que Singleton (gestionado por Spring/Angular DI)

La sesion del POS y el turno activo deben ser unicos en toda la aplicacion.
No pueden existir dos instancias de "turno abierto" ni dos sesiones activas
en el mismo dispositivo.

**Nota importante:** En Spring Boot y Angular, el Singleton se gestiona via
inyeccion de dependencias, no con el patron clasico de `getInstance()`.
Spring beans son singleton por defecto. Angular services con `providedIn: 'root'`
son singleton automaticamente.

**Por que usar DI en vez del patron clasico:**
- Testeable: se puede mockear en tests
- No hay estado global mutable accesible desde cualquier lugar
- El framework controla el ciclo de vida

#### Implementacion Backend

```java
// ============================================================
// TurnoService.java - Servicio singleton gestionado por Spring
// ============================================================
package com.maxisistemas.maxirestonline.pos.service;

@Service // Singleton por defecto en Spring
@RequiredArgsConstructor
@Slf4j
public class TurnoService {

    private final TurnoRepository turnoRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Abre un nuevo turno. Solo puede haber un turno abierto por sucursal.
     * El turno es compartido por todos los usuarios de esa sucursal.
     */
    @Transactional
    public TurnoDto abrirTurno(Long sucursalId, Long userId) {
        // Verificar que no haya turno abierto
        turnoRepository.findTurnoAbierto(sucursalId).ifPresent(t -> {
            throw new BusinessException("Ya existe un turno abierto en esta sucursal");
        });

        var turno = Turno.builder()
                .sucursalId(sucursalId)
                .abiertoPor(userId)
                .fechaApertura(LocalDateTime.now())
                .estado(EstadoTurno.ABIERTO)
                .build();

        turno = turnoRepository.save(turno);

        eventPublisher.publishEvent(new TurnoEvent(this, turno.getId(), TurnoEvent.Tipo.ABIERTO));

        log.info("Turno {} abierto en sucursal {} por usuario {}", turno.getId(), sucursalId, userId);
        return turnoMapper.toDto(turno);
    }

    /**
     * Cierra el turno activo. Genera resumen de caja.
     */
    @Transactional
    public TurnoCierreDto cerrarTurno(Long turnoId, Long userId) {
        var turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new EntityNotFoundException("Turno no encontrado"));

        if (turno.getEstado() != EstadoTurno.ABIERTO) {
            throw new BusinessException("El turno no esta abierto");
        }

        turno.setEstado(EstadoTurno.CERRADO);
        turno.setCerradoPor(userId);
        turno.setFechaCierre(LocalDateTime.now());
        turnoRepository.save(turno);

        eventPublisher.publishEvent(new TurnoEvent(this, turno.getId(), TurnoEvent.Tipo.CERRADO));

        return generarResumenCierre(turno);
    }
}
```

#### Implementacion Frontend

```typescript
// ============================================================
// session.service.ts - Sesion unica del POS (singleton via DI)
// ============================================================

@Injectable({ providedIn: 'root' }) // Singleton automatico
export class SessionService {

  // Estado de sesion inmutable desde afuera
  private readonly _currentUser = signal<PosUser | null>(null);
  private readonly _currentShift = signal<Shift | null>(null);
  private readonly _currentRole = signal<UserRole | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly currentShift = this._currentShift.asReadonly();
  readonly currentRole = this._currentRole.asReadonly();

  readonly isAuthenticated = computed(() =>
    this._currentUser() !== null && this._currentShift() !== null
  );

  readonly isShiftOpen = computed(() =>
    this._currentShift()?.estado === 'ABIERTO'
  );

  setUser(user: PosUser): void {
    this._currentUser.set(user);
    this._currentRole.set(user.rol);
  }

  setShift(shift: Shift): void {
    this._currentShift.set(shift);
  }

  logout(): void {
    this._currentUser.set(null);
    this._currentShift.set(null);
    this._currentRole.set(null);
  }
}
```

---

## 5. Patrones Estructurales

### 5.1 Decorator Pattern - Descuentos y Recargos

#### Por que Decorator

El precio final de un pedido puede tener multiples modificaciones apiladas:
descuento por promocion, recargo por servicio de mesa, descuento por empleado,
impuestos. Cada modificacion envuelve a la anterior formando una cadena.

**Problema que resuelve:**
- Evita una explosion de subclases para cada combinacion de descuentos
- Los descuentos se aplican en orden y cada uno "decora" el precio anterior
- Se pueden agregar/quitar modificadores dinamicamente

**Por que NO Strategy:**
- Strategy selecciona UN algoritmo. Decorator permite APILAR multiples modificadores.

#### Diagrama

```
  +----------------------------+
  |  <<interface>>             |
  |  PrecioCalculator          |
  |----------------------------|
  | + calcular(pedido): Money  |
  +----------------------------+
        ^              ^
        |              |
  +-------------+  +------------------------+
  | PrecioBase  |  | PrecioDecorator        |
  |             |  | <<abstract>>           |
  | suma items  |  |------------------------|
  |             |  | - wrapped: PrecioCalc  |
  +-------------+  | + calcular(): Money    |
                   +------------------------+
                        ^        ^        ^
                        |        |        |
               +--------+  +----+----+  +----------+
               |            |         |             |
  +-------------------+ +------------------+ +-------------------+
  | DescuentoPorcent  | | RecargoServicio  | | ImpuestoDecorator |
  |                   | |                  | |                   |
  | - porcentaje: 10% | | - porcentaje: 5% | | - tasa: 21%      |
  +-------------------+ +------------------+ +-------------------+

  Ejemplo de cadena:
  Impuesto(RecargoServicio(DescuentoPromo(PrecioBase)))

  PrecioBase: $1000
  -> DescuentoPromo 10%: $900
  -> RecargoServicio 5%: $945
  -> Impuesto 21%: $1143.45
```

#### Implementacion Backend

```java
// ============================================================
// PrecioCalculator.java - Interfaz componente
// ============================================================
package com.maxisistemas.maxirestonline.pos.decorator;

import java.math.BigDecimal;

public interface PrecioCalculator {
    BigDecimal calcular(Pedido pedido);
    String descripcion();
}
```

```java
// ============================================================
// PrecioBase.java - Componente concreto (suma de items)
// ============================================================
@Component
public class PrecioBase implements PrecioCalculator {

    @Override
    public BigDecimal calcular(Pedido pedido) {
        return pedido.getItems().stream()
                .map(item -> item.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public String descripcion() {
        return "Subtotal";
    }
}
```

```java
// ============================================================
// PrecioDecorator.java - Decorator abstracto
// ============================================================
public abstract class PrecioDecorator implements PrecioCalculator {

    protected final PrecioCalculator wrapped;

    protected PrecioDecorator(PrecioCalculator wrapped) {
        this.wrapped = wrapped;
    }
}
```

```java
// ============================================================
// DescuentoPorcentajeDecorator.java
// ============================================================
public class DescuentoPorcentajeDecorator extends PrecioDecorator {

    private final BigDecimal porcentaje;
    private final String motivo;

    public DescuentoPorcentajeDecorator(PrecioCalculator wrapped,
                                         BigDecimal porcentaje,
                                         String motivo) {
        super(wrapped);
        this.porcentaje = porcentaje;
        this.motivo = motivo;
    }

    @Override
    public BigDecimal calcular(Pedido pedido) {
        BigDecimal subtotal = wrapped.calcular(pedido);
        BigDecimal descuento = subtotal.multiply(porcentaje)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return subtotal.subtract(descuento);
    }

    @Override
    public String descripcion() {
        return String.format("Descuento %s%% (%s)", porcentaje, motivo);
    }
}
```

```java
// ============================================================
// RecargoServicioDecorator.java
// ============================================================
public class RecargoServicioDecorator extends PrecioDecorator {

    private final BigDecimal porcentaje;

    public RecargoServicioDecorator(PrecioCalculator wrapped, BigDecimal porcentaje) {
        super(wrapped);
        this.porcentaje = porcentaje;
    }

    @Override
    public BigDecimal calcular(Pedido pedido) {
        BigDecimal subtotal = wrapped.calcular(pedido);
        BigDecimal recargo = subtotal.multiply(porcentaje)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return subtotal.add(recargo);
    }

    @Override
    public String descripcion() {
        return String.format("Servicio de mesa %s%%", porcentaje);
    }
}
```

```java
// ============================================================
// PrecioCalculatorBuilder.java - Builder para armar la cadena
// ============================================================
@Service
@RequiredArgsConstructor
public class PrecioCalculatorBuilder {

    private final PrecioBase precioBase;

    /**
     * Construye la cadena de decorators segun las configuraciones activas
     * para el pedido.
     */
    public PrecioCalculator buildForPedido(Pedido pedido, ConfiguracionSucursal config) {
        PrecioCalculator calculator = precioBase;

        // Aplicar descuento de promocion si existe
        if (pedido.getPromocion() != null) {
            calculator = new DescuentoPorcentajeDecorator(
                    calculator,
                    pedido.getPromocion().getPorcentaje(),
                    pedido.getPromocion().getNombre()
            );
        }

        // Aplicar recargo por servicio de mesa si esta configurado
        if (config.isRecargoServicioActivo()) {
            calculator = new RecargoServicioDecorator(
                    calculator,
                    config.getPorcentajeServicio()
            );
        }

        return calculator;
    }
}
```

---

### 5.2 Adapter Pattern - Integraciones Externas

#### Por que Adapter

El POS necesita integrarse con sistemas externos: impresoras fiscales, servicios de
facturacion electronica (AFIP en Argentina), pasarelas de pago. Cada proveedor
tiene su propia API/SDK con interfaces incompatibles.

Adapter permite que el POS trabaje con una interfaz unificada independiente del
proveedor externo.

#### Diagrama

```
  +-----------------+     +---------------------+     +--------------------+
  |  POS Service    | --> | <<interface>>       | <-- |  FiscalAdapter     |
  |                 |     | FiscalPrinter       |     |  (Adapter)         |
  +-----------------+     |---------------------|     |--------------------|
                          | + imprimir(ticket)  |     | - sdkEpson:        |
                          | + abrirCajon()      |     |   EpsonFiscalSDK   |
                          | + cortarPapel()     |     | + imprimir(ticket) |
                          +---------------------+     +--------------------+
                                    ^                           |
                                    |                     adapta interfaz
                                    |                           |
                          +---------------------+     +--------------------+
                          | HasarFiscalAdapter  |     |  EpsonFiscalSDK    |
                          |---------------------|     |  (Libreria externa)|
                          | - driver:           |     |--------------------|
                          |   HasarDriver       |     | + printDocument()  |
                          | + imprimir(ticket)  |     | + openDrawer()     |
                          +---------------------+     | + cutPaper()       |
                                    |                 +--------------------+
                              adapta interfaz
                                    |
                          +---------------------+
                          |  HasarDriver        |
                          |  (Libreria externa) |
                          |---------------------|
                          | + enviarComando()   |
                          | + recibirRespuesta()|
                          +---------------------+
```

#### Implementacion Backend

```java
// ============================================================
// FiscalPrinter.java - Interfaz unificada del POS
// ============================================================
package com.maxisistemas.maxirestonline.pos.adapter;

public interface FiscalPrinter {
    void imprimir(ComprobanteDto comprobante);
    void abrirCajon();
    void cortarPapel();
    PrinterStatus getStatus();
}
```

```java
// ============================================================
// EpsonFiscalAdapter.java - Adapta SDK de Epson
// ============================================================
@Component
@ConditionalOnProperty(name = "pos.fiscal.provider", havingValue = "epson")
@RequiredArgsConstructor
@Slf4j
public class EpsonFiscalAdapter implements FiscalPrinter {

    private final EpsonFiscalSDK sdk; // SDK externo con su propia interfaz

    @Override
    public void imprimir(ComprobanteDto comprobante) {
        // Traducir del modelo POS al formato Epson
        EpsonDocument doc = new EpsonDocument();
        doc.setDocumentType(mapTipoComprobante(comprobante.getTipo()));

        for (var item : comprobante.getItems()) {
            doc.addLine(new EpsonLine(
                    item.getDescripcion(),
                    item.getCantidad(),
                    item.getPrecioUnitario().doubleValue()
            ));
        }

        doc.setPaymentMethod(mapFormaPago(comprobante.getFormaPago()));

        try {
            sdk.printDocument(doc); // Llamada al SDK externo
        } catch (EpsonException e) {
            log.error("Error imprimiendo en Epson: {}", e.getMessage());
            throw new FiscalPrinterException("Error de impresion fiscal", e);
        }
    }

    @Override
    public void abrirCajon() {
        sdk.openDrawer();
    }

    @Override
    public void cortarPapel() {
        sdk.cutPaper();
    }

    @Override
    public PrinterStatus getStatus() {
        EpsonStatus status = sdk.getDeviceStatus();
        return new PrinterStatus(
                status.isOnline(),
                status.hasPaper(),
                status.getErrorCode()
        );
    }

    private int mapTipoComprobante(TipoComprobante tipo) {
        return switch (tipo) {
            case TICKET -> EpsonDocumentType.TICKET;
            case FACTURA_A -> EpsonDocumentType.INVOICE_A;
            case FACTURA_B -> EpsonDocumentType.INVOICE_B;
            case NOTA_CREDITO -> EpsonDocumentType.CREDIT_NOTE;
        };
    }
}
```

---

### 5.3 Composite Pattern - Estructura de Menu

#### Por que Composite

El menu de un restaurante tiene estructura jerarquica: categorias que contienen
subcategorias y/o productos. El POS necesita recorrer esta estructura para mostrar
el menu, calcular totales por categoria, y filtrar items disponibles.

**Problema que resuelve:**
- Trata categorias y productos de forma uniforme
- Permite anidar categorias (Bebidas > Gaseosas > Con azucar)
- Calcular total de una categoria suma automaticamente sus hijos

#### Diagrama

```
  +---------------------------+
  |  <<interface>>            |
  |  MenuComponent            |
  |---------------------------|
  | + getNombre(): String     |
  | + getPrecio(): Money      |
  | + isDisponible(): boolean |
  | + getChildren(): List     |
  | + isLeaf(): boolean       |
  +---------------------------+
          ^             ^
          |             |
  +---------------+  +---------------------+
  | MenuItem      |  | MenuCategory        |
  | (Leaf)        |  | (Composite)         |
  |---------------|  |---------------------|
  | - nombre      |  | - nombre            |
  | - precio      |  | - children: List<   |
  | - disponible  |  |   MenuComponent>    |
  +---------------+  | + add(component)    |
                     | + remove(component) |
                     +---------------------+

  Ejemplo:
  Menu
  +-- Entradas (categoria)
  |   +-- Empanadas ($500)
  |   +-- Provoleta ($800)
  +-- Platos Principales (categoria)
  |   +-- Carnes (subcategoria)
  |   |   +-- Bife de chorizo ($2500)
  |   |   +-- Ojo de bife ($3000)
  |   +-- Pastas (subcategoria)
  |       +-- Ravioles ($1800)
  +-- Bebidas (categoria)
      +-- Gaseosas (subcategoria)
      |   +-- Coca-Cola ($600)
      +-- Vinos (subcategoria)
          +-- Malbec ($2000)
```

#### Implementacion Frontend

```typescript
// ============================================================
// menu-component.model.ts
// ============================================================

export interface MenuComponent {
  readonly id: number;
  readonly nombre: string;
  readonly tipo: 'categoria' | 'item';
  isDisponible(): boolean;
  getPrecio(): number; // Para items: precio unitario. Para categorias: suma hijos
  getChildren(): MenuComponent[];
  isLeaf(): boolean;
}

export class MenuItem implements MenuComponent {
  readonly tipo = 'item' as const;

  constructor(
    readonly id: number,
    readonly nombre: string,
    private readonly precio: number,
    private readonly disponible: boolean,
    readonly descripcion?: string,
    readonly imagen?: string,
  ) {}

  isDisponible(): boolean { return this.disponible; }
  getPrecio(): number { return this.precio; }
  getChildren(): MenuComponent[] { return []; }
  isLeaf(): boolean { return true; }
}

export class MenuCategory implements MenuComponent {
  readonly tipo = 'categoria' as const;
  private children: MenuComponent[] = [];

  constructor(
    readonly id: number,
    readonly nombre: string,
    readonly icono?: string,
  ) {}

  add(component: MenuComponent): void {
    this.children.push(component);
  }

  remove(componentId: number): void {
    this.children = this.children.filter(c => c.id !== componentId);
  }

  isDisponible(): boolean {
    // Una categoria esta disponible si al menos un hijo esta disponible
    return this.children.some(c => c.isDisponible());
  }

  getPrecio(): number {
    // Precio promedio de items (util para estadisticas)
    const items = this.getLeafItems();
    if (items.length === 0) return 0;
    return items.reduce((sum, i) => sum + i.getPrecio(), 0) / items.length;
  }

  getChildren(): MenuComponent[] {
    return [...this.children];
  }

  isLeaf(): boolean { return false; }

  /** Retorna todos los items (hojas) recursivamente */
  getLeafItems(): MenuItem[] {
    return this.children.flatMap(child =>
      child.isLeaf()
        ? [child as MenuItem]
        : (child as MenuCategory).getLeafItems()
    );
  }

  /** Retorna solo items disponibles recursivamente */
  getItemsDisponibles(): MenuItem[] {
    return this.getLeafItems().filter(i => i.isDisponible());
  }
}
```

---

### 5.4 Proxy Pattern - Cache y Control de Acceso

#### Por que Proxy

Algunas operaciones del POS son costosas: cargar la carta completa con precios,
consultar el estado de impresora fiscal, verificar permisos. Proxy permite
agregar cache, logging y control de acceso sin modificar los servicios originales.

#### Implementacion Backend (Cache Proxy)

```java
// ============================================================
// CachedMenuService.java - Proxy con cache para la carta
// ============================================================
package com.maxisistemas.maxirestonline.pos.proxy;

@Service
@RequiredArgsConstructor
@Slf4j
public class CachedMenuService implements MenuService {

    private final MenuServiceImpl delegate; // Servicio real
    private final CacheManager cacheManager;

    @Override
    @Cacheable(value = "menu", key = "#sucursalId")
    public MenuDto getMenuCompleto(Long sucursalId) {
        log.info("Cache MISS: cargando menu completo para sucursal {}", sucursalId);
        return delegate.getMenuCompleto(sucursalId);
    }

    @Override
    @Cacheable(value = "menu-disponible", key = "#sucursalId")
    public MenuDto getMenuDisponible(Long sucursalId) {
        return delegate.getMenuDisponible(sucursalId);
    }

    @Override
    @CacheEvict(value = {"menu", "menu-disponible"}, key = "#sucursalId")
    public void invalidarCache(Long sucursalId) {
        log.info("Cache invalidado para sucursal {}", sucursalId);
    }
}
```

#### Implementacion Backend (Access Control Proxy con AOP)

```java
// ============================================================
// RequiereRol.java - Anotacion para control de acceso por rol
// ============================================================
package com.maxisistemas.maxirestonline.pos.proxy;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiereRol {
    UserRole[] value();
}
```

```java
// ============================================================
// RolAccessProxy.java - Aspecto AOP que actua como Proxy
// ============================================================
@Aspect
@Component
@RequiredArgsConstructor
public class RolAccessProxy {

    private final SessionService sessionService;

    @Around("@annotation(requiereRol)")
    public Object verificarRol(ProceedingJoinPoint joinPoint, RequiereRol requiereRol)
            throws Throwable {

        UserRole rolActual = sessionService.getCurrentUserRole();
        UserRole[] rolesPermitidos = requiereRol.value();

        boolean autorizado = Arrays.stream(rolesPermitidos)
                .anyMatch(r -> r == rolActual);

        if (!autorizado) {
            throw new AccessDeniedException(
                String.format("Rol %s no tiene permiso. Requerido: %s",
                        rolActual, Arrays.toString(rolesPermitidos))
            );
        }

        return joinPoint.proceed();
    }
}
```

```java
// Uso en un servicio:
@Service
public class CajaService {

    @RequiereRol({UserRole.CAJERO})
    public CierreDto cerrarCaja(Long turnoId) {
        // Solo accesible para cajeros
    }

    @RequiereRol({UserRole.CAJERO, UserRole.MOZO})
    public void abrirCajon() {
        // Accesible para cajeros y mozos
    }
}
```

---

### 5.5 Facade Pattern - Simplificacion de Subsistemas

#### Por que Facade

Cobrar un pedido involucra multiples subsistemas: validar el pedido, calcular
el total con descuentos, procesar el pago, emitir comprobante, actualizar stock,
imprimir, abrir cajon. El controller no deberia conocer todos estos subsistemas.

**Problema que resuelve:**
- Proporciona una interfaz simple para una operacion compleja
- El controller llama a UN metodo en vez de orquestar 7 servicios
- Facilita testing: se mockea la facade completa

#### Diagrama

```
  +------------------+
  |  CobrarController|
  +------------------+
          |
          | cobrar(pedidoId, formaPago, monto)
          v
  +------------------------------+
  |       CobrarFacade           |
  |------------------------------|
  | + cobrar(req): CobrarResp   |
  | + cobrarParcial(req): Resp  |
  | + anularCobro(id): void     |
  +------------------------------+
      |      |      |      |
      v      v      v      v
  +------+ +------+ +------+ +------+
  |Pedido| |Precio| |Pago  | |Compr.|
  |Serv. | |Calc. | |Strat.| |Fact. |
  +------+ +------+ +------+ +------+
      |                         |
      v                         v
  +------+                 +------+
  |Stock | (futuro)        |Fiscal|
  |Serv. |                 |Print.|
  +------+                 +------+
```

#### Implementacion Backend

```java
// ============================================================
// CobrarFacade.java - Fachada para el proceso de cobro
// ============================================================
package com.maxisistemas.maxirestonline.pos.facade;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CobrarFacade {

    private final PedidoQueryService pedidoQueryService;
    private final PrecioCalculatorBuilder precioCalculatorBuilder;
    private final PaymentStrategyResolver paymentResolver;
    private final ComprobanteFactoryResolver comprobanteResolver;
    private final FiscalPrinter fiscalPrinter;
    private final PedidoMementoService mementoService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Proceso completo de cobro de un pedido.
     *
     * Orquesta: validacion -> calculo -> pago -> comprobante -> impresion
     * Si falla en cualquier paso, restaura el estado via Memento.
     */
    public CobrarResponseDto cobrar(CobrarRequestDto request) {
        Long pedidoId = request.getPedidoId();

        // 1. Crear snapshot para rollback
        PedidoMemento snapshot = mementoService.crearSnapshot(pedidoId);

        try {
            // 2. Obtener y validar pedido
            var pedido = pedidoQueryService.findById(pedidoId);
            validarPedidoCobrable(pedido);

            // 3. Calcular total con descuentos/recargos
            var config = pedidoQueryService.getConfigSucursal(pedido.getSucursalId());
            var calculator = precioCalculatorBuilder.buildForPedido(pedido, config);
            BigDecimal totalFinal = calculator.calcular(pedido);

            // 4. Procesar pago segun forma de pago (Strategy)
            var paymentStrategy = paymentResolver.resolve(request.getFormaPago());
            if (!paymentStrategy.validar(request.getMonto(), totalFinal)) {
                throw new ValidationException("Monto invalido para forma de pago " +
                        request.getFormaPago());
            }
            var paymentResult = paymentStrategy.procesar(pedidoId, request.getMonto());

            // 5. Generar comprobante (Factory)
            var comprobanteFactory = comprobanteResolver.resolve(request.getTipoComprobante());
            var comprobante = comprobanteFactory.crear(pedido, request.getDatosCliente());

            // 6. Imprimir (Adapter)
            fiscalPrinter.imprimir(comprobanteMapper.toDto(comprobante));
            fiscalPrinter.abrirCajon();

            // 7. Publicar evento
            eventPublisher.publishEvent(
                new PedidoEvent(this, pedidoId, pedido.getMesaId(),
                        PedidoEvent.Tipo.CERRADO, null)
            );

            // 8. Retornar resultado
            BigDecimal vuelto = paymentStrategy.calcularVuelto(request.getMonto(), totalFinal);
            return CobrarResponseDto.builder()
                    .exitoso(true)
                    .pedidoId(pedidoId)
                    .totalCobrado(totalFinal)
                    .vuelto(vuelto)
                    .comprobanteNumero(comprobante.getNumero())
                    .build();

        } catch (Exception e) {
            // Rollback via Memento
            log.error("Error en cobro del pedido {}: {}. Restaurando estado.", pedidoId, e.getMessage());
            mementoService.restaurar(snapshot);
            throw e;
        }
    }

    private void validarPedidoCobrable(Pedido pedido) {
        if (pedido.getEstado() != EstadoPedido.ABIERTO) {
            throw new BusinessException("El pedido no esta en estado cobrable");
        }
        if (pedido.getItems().isEmpty()) {
            throw new BusinessException("El pedido no tiene items");
        }
    }
}
```

---

## 6. Patrones de Arquitectura

### 6.1 CQRS Simplificado

Consistente con el patron ya utilizado en otros modulos Maxirest. Separa las
operaciones de lectura (Query) de las de escritura (Command) en servicios distintos.

**Por que en POS:**
- Las lecturas (vista de salon, carta, estado de mesas) son mucho mas frecuentes
- Las escrituras (tomar pedido, cobrar) tienen logica compleja
- Permite optimizar lecturas con cache sin afectar escrituras

```
  +------------------+     +---------------------+     +------------------+
  | Controller       | --> | QueryService        | --> | Repository       |
  |                  |     | (lecturas)          |     | (findBy*, count) |
  |                  |     | - con cache         |     |                  |
  |                  |     | - sin transaccion   |     |                  |
  +------------------+     +---------------------+     +------------------+
          |
          | (POST, PUT, DELETE)
          v
  +---------------------+     +------------------+
  | CommandService      | --> | Repository       |
  | (escrituras)        |     | (save, delete)   |
  | - con transaccion   |     |                  |
  | - publica eventos   |     |                  |
  | - validacion        |     |                  |
  +---------------------+     +------------------+
```

```java
// ============================================================
// PedidoQueryService.java - Lecturas (sin @Transactional write)
// ============================================================
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoQueryService {

    private final PedidoRepository pedidoRepository;
    private final PedidoMapper mapper;

    public PedidoDto findById(Long id) {
        return pedidoRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado: " + id));
    }

    public List<PedidoResumenDto> findByMesa(Long mesaId) {
        return pedidoRepository.findByMesaIdAndEstado(mesaId, EstadoPedido.ABIERTO).stream()
                .map(mapper::toResumenDto)
                .toList();
    }

    public List<MesaConPedidoDto> getSalonCompleto(Long salonId) {
        return pedidoRepository.findMesasConPedidosBySalon(salonId);
    }
}
```

```java
// ============================================================
// PedidoCommandService.java - Escrituras (con @Transactional)
// ============================================================
@Service
@RequiredArgsConstructor
@Transactional
public class PedidoCommandService {

    private final PedidoRepository pedidoRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PedidoMapper mapper;

    public PedidoDto crearPedido(CrearPedidoDto dto) {
        // Validar, crear, guardar, publicar evento
        var pedido = mapper.toEntity(dto);
        pedido.setEstado(EstadoPedido.ABIERTO);
        pedido = pedidoRepository.save(pedido);

        eventPublisher.publishEvent(
            new PedidoEvent(this, pedido.getId(), dto.getMesaId(),
                    PedidoEvent.Tipo.CREADO, null)
        );

        return mapper.toDto(pedido);
    }
}
```

---

### 6.2 Repository + Service Layer

Patron estandar de Maxirest. El Controller nunca accede directamente al Repository.

```
  Controller (REST) -- solo mapea HTTP a DTOs
       |
       v
  Service (Logica) -- validacion, reglas de negocio, eventos
       |
       v
  Repository (Datos) -- Spring Data JPA, queries custom
       |
       v
  Entity (JPA) -- mapeo a tablas MySQL
```

```java
// ============================================================
// MesaController.java
// ============================================================
@RestController
@RequestMapping("/api/v1/pos/mesas")
@RequiredArgsConstructor
public class MesaController {

    private final MesaQueryService queryService;
    private final MesaCommandService commandService;

    @GetMapping("/salon/{salonId}")
    public ResponseEntity<List<MesaDto>> getMesasBySalon(@PathVariable Long salonId) {
        return ResponseEntity.ok(queryService.findBySalon(salonId));
    }

    @PostMapping("/{mesaId}/abrir")
    public ResponseEntity<PedidoDto> abrirMesa(
            @PathVariable Long mesaId,
            @RequestBody AbrirMesaDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commandService.abrirMesa(mesaId, dto));
    }
}
```

---

### 6.3 Event-Driven con Spring Events

Los eventos de dominio permiten desacoplar los efectos secundarios de las operaciones
principales. Cuando se crea un pedido, no es responsabilidad del `PedidoCommandService`
notificar a la cocina ni actualizar estadisticas.

```
  PedidoCommandService
       |
       | publishEvent(PedidoEvent.CREADO)
       v
  Spring ApplicationEventPublisher
       |
       +-- SalonEventListener     -> Actualiza vista salon (SSE)
       +-- CocinaEventListener    -> Envia a display cocina (SSE)
       +-- EstadisticasListener   -> Actualiza metricas
       +-- AuditoriaListener      -> Log de auditoria

  TurnoService
       |
       | publishEvent(TurnoEvent.CERRADO)
       v
  Spring ApplicationEventPublisher
       |
       +-- CajaListener           -> Genera resumen de caja
       +-- ReporteListener        -> Genera reporte de cierre
```

---

## 7. Patrones Frontend Angular

### 7.1 State Machine con Signals (Login)

Ya cubierto en detalle en la seccion 3.1. Resumen de la implementacion Angular:

```typescript
// Componente login que consume la maquina de estados
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserSelectorComponent, PinEntryComponent, ShiftSelectorComponent],
  template: `
    @switch (loginState.phase()) {
      @case ('USER_SELECTION') {
        <app-user-selector
          [users]="users()"
          (userSelected)="loginState.selectUser($event)" />
      }
      @case ('PIN_ENTRY') {
        <app-pin-entry
          [user]="loginState.selectedUser()"
          [attempts]="loginState.pinAttempts()"
          [error]="loginState.errorMessage()"
          (pinSubmitted)="loginState.submitPin($event)"
          (back)="loginState.goBack()" />
      }
      @case ('SHIFT_SELECTION') {
        <app-shift-selector
          [shifts]="shifts()"
          (shiftConfirmed)="loginState.confirmShift($event)"
          (back)="loginState.goBack()" />
      }
      @case ('BLOCKED') {
        <app-blocked-message
          [message]="loginState.errorMessage()"
          (back)="loginState.goBack()" />
      }
      @case ('AUTHENTICATED') {
        <!-- Redirect handled by effect -->
      }
    }
  `,
})
export class LoginComponent {
  readonly loginState = inject(LoginStateService);
  readonly users = signal<PosUser[]>([]);
  readonly shifts = signal<Shift[]>([]);
}
```

### 7.2 Container / Presentational

Patron ya estandar en Maxirest. El componente "page" (container) gestiona estado
y logica. Los sub-componentes (presentational) solo reciben inputs y emiten outputs.

```
  SalonComponent (Container)
  |-- Estado: mesas signal, filtro signal
  |-- Logica: cargar datos, manejar acciones
  |
  +-- SalonToolbarComponent (Presentational)
  |   Inputs: filtroActivo, contadores
  |   Outputs: filtroChanged, searchChanged
  |
  +-- SalonGridComponent (Presentational)
  |   Inputs: mesas, columnas
  |   Outputs: mesaClicked, actionTriggered
  |
  +-- MesaDialogComponent (Presentational)
      Inputs: mesa, visible
      Outputs: guardar, cancelar
```

```typescript
// ============================================================
// salon.component.ts - Container
// ============================================================
@Component({
  selector: 'app-salon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SalonToolbarComponent, SalonGridComponent, MesaDialogComponent],
  template: `
    <div class="page-container">
      <app-salon-toolbar
        [filtroActivo]="filtroActivo()"
        [contadores]="contadores()"
        (filtroChanged)="filtroActivo.set($event)"
        (searchChanged)="searchTerm.set($event)" />

      <app-salon-grid
        [mesas]="mesasFiltradas()"
        [columns]="uiFactory.gridColumns()"
        (mesaClicked)="onMesaClicked($event)"
        (actionTriggered)="onAction($event)" />

      @if (showDialog()) {
        <app-mesa-dialog
          [mesa]="selectedMesa()"
          (guardar)="onGuardar($event)"
          (cancelar)="showDialog.set(false)" />
      }
    </div>
  `,
})
export class SalonComponent implements OnInit {
  private readonly mesaService = inject(MesaService);
  private readonly realtimeService = inject(SalonRealtimeService);
  private readonly uiFactory = inject(PosUiFactoryService);
  private readonly notificationService = inject(NotificationService);

  // State
  readonly mesas = signal<Mesa[]>([]);
  readonly filtroActivo = signal<MesaFiltro>('todas');
  readonly searchTerm = signal('');
  readonly showDialog = signal(false);
  readonly selectedMesa = signal<Mesa | null>(null);

  // Computed
  readonly mesasFiltradas = computed(() => {
    let result = this.mesas();
    const filtro = this.filtroActivo();
    const search = this.searchTerm().toLowerCase();

    if (filtro !== 'todas') {
      result = result.filter(m => m.estado === filtro);
    }
    if (search) {
      result = result.filter(m =>
        m.nombre.toLowerCase().includes(search) ||
        m.mozo?.toLowerCase().includes(search)
      );
    }
    return result;
  });

  readonly contadores = computed(() => {
    const all = this.mesas();
    return {
      todas: all.length,
      libres: all.filter(m => m.estado === 'libre').length,
      ocupadas: all.filter(m => m.estado === 'ocupada').length,
      cobrando: all.filter(m => m.estado === 'cobrando').length,
    };
  });

  ngOnInit(): void {
    this.cargarMesas();
  }

  private cargarMesas(): void {
    this.mesaService.getMesasBySalon(1).subscribe({
      next: mesas => this.mesas.set(mesas),
      error: () => this.notificationService.error('Error cargando mesas'),
    });
  }
}
```

### 7.3 Optimistic Updates con Memento

Patron ya utilizado en otros modulos Maxirest. En POS es critico porque las
operaciones del mozo deben sentirse instantaneas.

```typescript
// Ejemplo: Mozo marca item como entregado
async marcarEntregado(itemId: number): Promise<void> {
  const mementoService = inject(MesaStateMementoService);

  await mementoService.withOptimisticUpdate(
    this.pedidoItems,
    // Cambio optimista: marcar como entregado inmediatamente
    items => items.map(i =>
      i.id === itemId ? { ...i, estado: 'entregado' } : i
    ),
    // Llamada real al backend
    () => this.pedidoService.marcarEntregado(itemId),
  );

  this.notificationService.success('Item marcado como entregado');
}
```

---

## 8. Matriz de Decision

Guia rapida para decidir que patron usar ante un problema comun del POS.

### Cuando usar cada patron

| Sintoma / Problema | Patron | Justificacion |
|---------------------|--------|---------------|
| Multiples `if/switch` segun tipo de pago | **Strategy** | Algoritmos intercambiables |
| Multiples `if/switch` segun estado del pedido | **State** | Comportamiento varia por estado |
| Crear distintos tipos de comprobante | **Factory Method** | Creacion delegada a subclases |
| Apilar descuentos + recargos + impuestos | **Decorator** | Modificadores apilables |
| Interfaz distinta para mozo/cajero/cocinero | **Abstract Factory** | Familias de UI coherentes |
| Notificar salon/cocina/stats de cambios | **Observer** | Desacoplar emisor de receptores |
| Undo de operaciones en pedido | **Command** | Operaciones reversibles con historial |
| Rollback completo de transaccion fallida | **Memento** | Snapshot del estado completo |
| Integrar impresora/AFIP con interfaz propia | **Adapter** | Traducir interfaz externa a interna |
| Menu con categorias y subcategorias | **Composite** | Jerarquia uniforme |
| Cache de carta / control de acceso | **Proxy** | Intermediario transparente |
| Cobro que involucra 7 subsistemas | **Facade** | Interfaz simple para proceso complejo |
| Sesion y turno unicos en la app | **Singleton (DI)** | Una sola instancia via inyeccion |
| Separar lecturas de escrituras | **CQRS simplificado** | QueryService + CommandService |

### Cuando NO usar un patron

| Situacion | Patron tentador | Por que NO |
|-----------|-----------------|------------|
| Solo 2 formas de pago y no van a crecer | Strategy | Un `if/else` simple es suficiente |
| Objeto con 2 estados simples (activo/inactivo) | State | Boolean + if es mas claro |
| Solo se crea un tipo de comprobante | Factory | Instanciacion directa basta |
| Un solo descuento fijo | Decorator | Calculo inline es mas simple |
| 2 listeners que nunca cambiaran | Observer | Llamadas directas son mas claras |

---

## 9. Anti-Patrones a Evitar

### 9.1 God Controller

```java
// MAL: Controller con logica de negocio
@PostMapping("/cobrar")
public ResponseEntity<?> cobrar(@RequestBody CobrarDto dto) {
    var pedido = pedidoRepo.findById(dto.getPedidoId()).orElseThrow();
    BigDecimal total = BigDecimal.ZERO;
    for (var item : pedido.getItems()) {
        total = total.add(item.getPrecio().multiply(...)); // Logica en controller
    }
    if (dto.getFormaPago().equals("EFECTIVO")) { // Switch en controller
        // ...
    }
    // 200 lineas mas...
}

// BIEN: Controller delega a Facade
@PostMapping("/cobrar")
public ResponseEntity<CobrarResponseDto> cobrar(@RequestBody CobrarRequestDto dto) {
    return ResponseEntity.ok(cobrarFacade.cobrar(dto));
}
```

### 9.2 Strategy con estado mutable compartido

```java
// MAL: Strategy que guarda estado entre llamadas
@Component
public class EfectivoStrategy implements PaymentStrategy {
    private BigDecimal ultimoVuelto; // Estado compartido entre requests

    @Override
    public PaymentResultDto procesar(...) {
        this.ultimoVuelto = ...; // Peligroso en entorno concurrente
    }
}

// BIEN: Strategy sin estado (stateless)
@Component
public class EfectivoStrategy implements PaymentStrategy {
    @Override
    public PaymentResultDto procesar(Long pedidoId, BigDecimal monto) {
        BigDecimal vuelto = ...; // Variable local
        return PaymentResultDto.builder().vuelto(vuelto).build();
    }
}
```

### 9.3 Observer sin cleanup

```typescript
// MAL: EventSource sin cierre
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  connect() {
    new EventSource('/stream'); // Memory leak: nunca se cierra
  }
}

// BIEN: Con cleanup en ngOnDestroy
@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private eventSource: EventSource | null = null;

  connect() {
    this.disconnect(); // Cerrar anterior si existe
    this.eventSource = new EventSource('/stream');
  }

  disconnect() {
    this.eventSource?.close();
    this.eventSource = null;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
```

### 9.4 Sobre-ingenieria

```typescript
// MAL: Factory para algo que nunca va a tener variantes
export class PinInputFactory {
  create(type: string): PinInput {
    switch (type) {
      case 'numeric': return new NumericPinInput();
      // Solo hay un tipo y nunca habra otro
    }
  }
}

// BIEN: Instanciacion directa
const pinInput = new NumericPinInput();
```

---

## Resumen de Patrones y Archivos

| Patron | Archivos Backend (Java) | Archivos Frontend (TypeScript) |
|--------|------------------------|-------------------------------|
| State | `model/state/LoginState.java`, `LoginPhase.java`, `PinEntryState.java`, ... | `models/login-state.model.ts`, `services/login-state.service.ts` |
| Strategy | `service/strategy/PaymentStrategy.java`, `EfectivoPaymentStrategy.java`, `PaymentStrategyResolver.java` | `models/payment-strategy.model.ts` |
| Observer | `event/PedidoEvent.java`, `event/listener/SalonEventListener.java`, `event/listener/CocinaEventListener.java` | `services/salon-realtime.service.ts` |
| Command | `command/PedidoCommand.java`, `command/AgregarItemCommand.java`, `command/PedidoCommandInvoker.java` | - |
| Memento | `memento/PedidoMemento.java`, `memento/PedidoMementoService.java` | `services/mesa-state-memento.service.ts` |
| Factory | `factory/ComprobanteFactory.java`, `factory/TicketFactory.java`, `factory/FacturaAFactory.java` | - |
| Abstract Factory | - | `models/pos-ui-factory.model.ts`, `services/pos-ui-factory.service.ts` |
| Singleton | `service/TurnoService.java` (via Spring DI) | `services/session.service.ts` (via Angular DI) |
| Decorator | `decorator/PrecioCalculator.java`, `decorator/PrecioBase.java`, `decorator/DescuentoPorcentajeDecorator.java`, `decorator/RecargoServicioDecorator.java` | - |
| Adapter | `adapter/FiscalPrinter.java`, `adapter/EpsonFiscalAdapter.java` | - |
| Composite | - | `models/menu-component.model.ts` |
| Proxy | `proxy/CachedMenuService.java`, `proxy/RolAccessProxy.java` | - |
| Facade | `facade/CobrarFacade.java` | - |
| CQRS | `service/PedidoQueryService.java`, `service/PedidoCommandService.java` | - |
