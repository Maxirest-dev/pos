# POS - Punto de Venta | Maxirest Online

Sistema de Punto de Venta para el ecosistema Maxirest de gestión gastronómica.

## Descripción

Módulo POS donde el personal del restaurante toma pedidos, cobra y factura. Diseñado para operar en tablets, desktops y dispositivos móviles con una interfaz tipo kiosko optimizada para uso rápido.

## Secciones

| Sección | Estado | Descripción |
|---------|--------|-------------|
| Login | En desarrollo | Selector de usuario, PIN, apertura de turno |
| Salón | Pendiente | Vista de mesas/plano del local |
| Mesa | Pendiente | Toma de pedidos por mesa |
| Estadísticas | Pendiente | Reportes y métricas del turno |
| Configuración | Pendiente | Ajustes del POS |

## Stack

- **Frontend**: Angular 19+, Standalone Components, Signals, CSS Custom Properties
- **Backend** (futuro): Spring Boot 3.4.x, Java 21, MySQL 8.0
- **Infra**: Docker Compose, Nginx

## Inicio rápido

```bash
cd pos-frontend
npm install
ng serve --port 4800
```

Abrir `http://localhost:4800`

## Tipos de usuario

| Tipo | Icono | Permisos |
|------|-------|----------|
| Mozo | 🧑‍🍳 | Tomar pedidos, ver mesas |
| Cajero | 💰 | Cobrar, facturar, abrir/cerrar turno |
| Cocinero | 👨‍🍳 | Ver pedidos en cocina |

## Turnos

- **Mañana**: 08:00 - 14:00
- **Tarde**: 14:00 - 22:00
- **Noche**: 22:00 - 08:00

Un solo turno abierto a la vez. Un usuario abre y otro (o el mismo) cierra para todos.

## Documentación

- [Arquitectura](architecture.md)
- [Estructura del proyecto](project-structure.md)
- [Patrones de diseño](design-patterns.md)
- [API Specification](api-specification.yaml)
- [Database Schema](database-schema.sql)

## Repositorio

Organización: [Maxirest-dev](https://github.com/Maxirest-dev)

---

## 📝 Últimos cambios

### 2026-04-27

**Commits incluidos:**
- (sin commits pendientes)

**Archivos modificados:**
  - `.md`: README.md
