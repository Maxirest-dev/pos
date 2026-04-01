-- ==========================================================================
-- Maxirest POS - Database Schema
-- MySQL 8.0 | Multi-tenant (schema por tenant)
-- ==========================================================================
-- Convenciones:
--   - IDs: VARCHAR(36) UUID
--   - Timestamps: created_at, updated_at con defaults
--   - Audit: created_by, updated_by como VARCHAR(36)
--   - Soft delete: activo BOOLEAN DEFAULT TRUE
--   - ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
-- ==========================================================================

-- Este script se ejecuta dentro del schema del tenant.
-- La tabla central `usuarios` vive en tenant_master y se referencia por ID.

-- ==========================================================================
-- TABLAS
-- ==========================================================================

-- --------------------------------------------------------------------------
-- pos_usuarios: Perfil POS de usuarios centrales
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_usuarios (
    id                  VARCHAR(36)     NOT NULL,
    usuario_central_id  VARCHAR(36)     NOT NULL COMMENT 'FK logica a tenant_master.usuarios.id',
    nombre              VARCHAR(100)    NOT NULL,
    pin_hash            VARCHAR(255)    NOT NULL COMMENT 'BCrypt hash del PIN de 6 digitos',
    tipo                ENUM('MOZO', 'CAJERO', 'COCINERO') NOT NULL,
    avatar_emoji        VARCHAR(10)     DEFAULT '👤',
    intentos_fallidos   INT             NOT NULL DEFAULT 0,
    bloqueado           BOOLEAN         NOT NULL DEFAULT FALSE,
    ultimo_login        DATETIME        NULL,
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(36)     NULL,
    updated_by          VARCHAR(36)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_pos_usuarios_central (usuario_central_id),
    UNIQUE KEY uk_pos_usuarios_pin (pin_hash),
    INDEX idx_pos_usuarios_tipo (tipo),
    INDEX idx_pos_usuarios_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- pos_turnos: Turnos de caja
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_turnos (
    id                  VARCHAR(36)     NOT NULL,
    fecha               DATE            NOT NULL,
    tipo_turno          ENUM('MANANA', 'TARDE', 'NOCHE') NOT NULL,
    estado              ENUM('ABIERTO', 'CERRADO') NOT NULL DEFAULT 'ABIERTO',
    usuario_apertura_id VARCHAR(36)     NOT NULL,
    usuario_cierre_id   VARCHAR(36)     NULL,
    hora_apertura       DATETIME        NOT NULL,
    hora_cierre         DATETIME        NULL,
    monto_apertura      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    monto_cierre        DECIMAL(12,2)   NULL,
    observaciones       VARCHAR(500)    NULL,
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(36)     NULL,
    updated_by          VARCHAR(36)     NULL,
    PRIMARY KEY (id),
    INDEX idx_pos_turnos_fecha (fecha),
    INDEX idx_pos_turnos_estado (estado),
    INDEX idx_pos_turnos_tipo (tipo_turno),
    CONSTRAINT fk_turno_usuario_apertura FOREIGN KEY (usuario_apertura_id)
        REFERENCES pos_usuarios (id),
    CONSTRAINT fk_turno_usuario_cierre FOREIGN KEY (usuario_cierre_id)
        REFERENCES pos_usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- pos_mesas: Mesas del restaurante
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_mesas (
    id                  VARCHAR(36)     NOT NULL,
    numero              INT             NOT NULL,
    capacidad           INT             NOT NULL DEFAULT 4,
    estado              ENUM('LIBRE', 'OCUPADA', 'RESERVADA', 'CUENTA_PEDIDA', 'FUERA_DE_SERVICIO')
                                        NOT NULL DEFAULT 'LIBRE',
    zona                VARCHAR(50)     NOT NULL DEFAULT 'Salon principal',
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(36)     NULL,
    updated_by          VARCHAR(36)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_pos_mesas_numero (numero),
    INDEX idx_pos_mesas_estado (estado),
    INDEX idx_pos_mesas_zona (zona)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- pos_pedidos: Pedidos (comandas)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_pedidos (
    id                  VARCHAR(36)     NOT NULL,
    mesa_id             VARCHAR(36)     NOT NULL,
    turno_id            VARCHAR(36)     NOT NULL,
    usuario_id          VARCHAR(36)     NOT NULL COMMENT 'Mozo que tomo el pedido',
    estado              ENUM('ABIERTO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'COBRADO', 'CANCELADO')
                                        NOT NULL DEFAULT 'ABIERTO',
    subtotal            DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    descuento           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    total               DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    observaciones       VARCHAR(500)    NULL,
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(36)     NULL,
    updated_by          VARCHAR(36)     NULL,
    PRIMARY KEY (id),
    INDEX idx_pos_pedidos_mesa (mesa_id),
    INDEX idx_pos_pedidos_turno (turno_id),
    INDEX idx_pos_pedidos_estado (estado),
    INDEX idx_pos_pedidos_created (created_at),
    CONSTRAINT fk_pedido_mesa FOREIGN KEY (mesa_id)
        REFERENCES pos_mesas (id),
    CONSTRAINT fk_pedido_turno FOREIGN KEY (turno_id)
        REFERENCES pos_turnos (id),
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id)
        REFERENCES pos_usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- pos_pedido_items: Items de cada pedido
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_pedido_items (
    id                  VARCHAR(36)     NOT NULL,
    pedido_id           VARCHAR(36)     NOT NULL,
    articulo_id         VARCHAR(36)     NOT NULL COMMENT 'FK logica a catalogo de articulos (ventas)',
    articulo_nombre     VARCHAR(150)    NOT NULL COMMENT 'Nombre snapshot al momento del pedido',
    cantidad            INT             NOT NULL DEFAULT 1,
    precio_unitario     DECIMAL(12,2)   NOT NULL,
    subtotal            DECIMAL(12,2)   NOT NULL COMMENT 'cantidad * precio_unitario',
    notas               VARCHAR(200)    NULL COMMENT 'Instrucciones especiales (sin sal, etc.)',
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(36)     NULL,
    updated_by          VARCHAR(36)     NULL,
    PRIMARY KEY (id),
    INDEX idx_pos_pedido_items_pedido (pedido_id),
    INDEX idx_pos_pedido_items_articulo (articulo_id),
    CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id)
        REFERENCES pos_pedidos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- pos_cobros: Pagos registrados
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_cobros (
    id                  VARCHAR(36)     NOT NULL,
    pedido_id           VARCHAR(36)     NOT NULL,
    forma_cobro         ENUM('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'QR', 'CUENTA_CORRIENTE')
                                        NOT NULL,
    monto               DECIMAL(12,2)   NOT NULL,
    referencia          VARCHAR(100)    NULL COMMENT 'Nro operacion, voucher, etc.',
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(36)     NULL COMMENT 'Usuario cajero que registro el cobro',
    updated_by          VARCHAR(36)     NULL,
    PRIMARY KEY (id),
    INDEX idx_pos_cobros_pedido (pedido_id),
    INDEX idx_pos_cobros_forma (forma_cobro),
    INDEX idx_pos_cobros_created (created_at),
    CONSTRAINT fk_cobro_pedido FOREIGN KEY (pedido_id)
        REFERENCES pos_pedidos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- pos_arqueo_caja: Arqueo de caja por turno
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_arqueo_caja (
    id                  VARCHAR(36)     NOT NULL,
    turno_id            VARCHAR(36)     NOT NULL,
    monto_apertura      DECIMAL(12,2)   NOT NULL,
    total_efectivo      DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'Suma cobros en efectivo del turno',
    total_tarjeta       DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'Suma cobros tarjeta del turno',
    total_qr            DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'Suma cobros QR del turno',
    total_cuenta_cte    DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'Suma cobros cuenta corriente',
    monto_esperado      DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'monto_apertura + total_efectivo',
    monto_cierre        DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'Monto real contado',
    diferencia          DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'monto_cierre - monto_esperado',
    observaciones       VARCHAR(500)    NULL,
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(36)     NULL,
    updated_by          VARCHAR(36)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_pos_arqueo_turno (turno_id),
    CONSTRAINT fk_arqueo_turno FOREIGN KEY (turno_id)
        REFERENCES pos_turnos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================================
-- TRIGGERS
-- ==========================================================================

-- Recalcular subtotal del item al insertar
DELIMITER //
CREATE TRIGGER trg_pos_pedido_items_before_insert
BEFORE INSERT ON pos_pedido_items
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.cantidad * NEW.precio_unitario;
END//

-- Recalcular subtotal del item al actualizar
CREATE TRIGGER trg_pos_pedido_items_before_update
BEFORE UPDATE ON pos_pedido_items
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.cantidad * NEW.precio_unitario;
END//

-- Recalcular totales del pedido al insertar item
CREATE TRIGGER trg_pos_pedido_items_after_insert
AFTER INSERT ON pos_pedido_items
FOR EACH ROW
BEGIN
    UPDATE pos_pedidos
    SET subtotal = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM pos_pedido_items
            WHERE pedido_id = NEW.pedido_id AND activo = TRUE
        ),
        total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM pos_pedido_items
            WHERE pedido_id = NEW.pedido_id AND activo = TRUE
        ) - descuento
    WHERE id = NEW.pedido_id;
END//

-- Recalcular totales del pedido al actualizar item
CREATE TRIGGER trg_pos_pedido_items_after_update
AFTER UPDATE ON pos_pedido_items
FOR EACH ROW
BEGIN
    UPDATE pos_pedidos
    SET subtotal = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM pos_pedido_items
            WHERE pedido_id = NEW.pedido_id AND activo = TRUE
        ),
        total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM pos_pedido_items
            WHERE pedido_id = NEW.pedido_id AND activo = TRUE
        ) - descuento
    WHERE id = NEW.pedido_id;
END//

-- Bloquear usuario despues de 3 intentos fallidos (logica manejada en app,
-- pero trigger de seguridad por si se actualiza directamente)
CREATE TRIGGER trg_pos_usuarios_bloqueo
BEFORE UPDATE ON pos_usuarios
FOR EACH ROW
BEGIN
    IF NEW.intentos_fallidos >= 3 AND OLD.intentos_fallidos < 3 THEN
        SET NEW.bloqueado = TRUE;
    END IF;
END//

DELIMITER ;


-- ==========================================================================
-- VISTAS
-- ==========================================================================

-- Vista completa de pedidos para AG-Grid
CREATE OR REPLACE VIEW v_pos_pedidos_completo AS
SELECT
    p.id                AS pedido_id,
    p.estado            AS pedido_estado,
    p.subtotal          AS pedido_subtotal,
    p.descuento         AS pedido_descuento,
    p.total             AS pedido_total,
    p.observaciones     AS pedido_observaciones,
    p.created_at        AS pedido_fecha,
    m.id                AS mesa_id,
    m.numero            AS mesa_numero,
    m.zona              AS mesa_zona,
    u.id                AS usuario_id,
    u.nombre            AS usuario_nombre,
    u.tipo              AS usuario_tipo,
    u.avatar_emoji      AS usuario_avatar,
    t.id                AS turno_id,
    t.fecha             AS turno_fecha,
    t.tipo_turno        AS turno_tipo,
    (SELECT COUNT(*) FROM pos_pedido_items pi WHERE pi.pedido_id = p.id AND pi.activo = TRUE)
                        AS cantidad_items,
    (SELECT COALESCE(SUM(c.monto), 0) FROM pos_cobros c WHERE c.pedido_id = p.id AND c.activo = TRUE)
                        AS total_cobrado,
    p.total - (SELECT COALESCE(SUM(c.monto), 0) FROM pos_cobros c WHERE c.pedido_id = p.id AND c.activo = TRUE)
                        AS saldo_pendiente
FROM pos_pedidos p
    INNER JOIN pos_mesas m ON m.id = p.mesa_id
    INNER JOIN pos_usuarios u ON u.id = p.usuario_id
    INNER JOIN pos_turnos t ON t.id = p.turno_id
WHERE p.activo = TRUE;

-- Vista resumen de turno para dashboard
CREATE OR REPLACE VIEW v_pos_turno_resumen AS
SELECT
    t.id                AS turno_id,
    t.fecha,
    t.tipo_turno,
    t.estado,
    t.hora_apertura,
    t.hora_cierre,
    t.monto_apertura,
    t.monto_cierre,
    ua.nombre           AS cajero_apertura,
    uc.nombre           AS cajero_cierre,
    (SELECT COUNT(*) FROM pos_pedidos p WHERE p.turno_id = t.id AND p.activo = TRUE)
                        AS total_pedidos,
    (SELECT COUNT(*) FROM pos_pedidos p WHERE p.turno_id = t.id AND p.estado = 'COBRADO' AND p.activo = TRUE)
                        AS pedidos_cobrados,
    (SELECT COUNT(*) FROM pos_pedidos p WHERE p.turno_id = t.id AND p.estado IN ('ABIERTO','EN_PREPARACION','LISTO','ENTREGADO') AND p.activo = TRUE)
                        AS pedidos_abiertos,
    (SELECT COALESCE(SUM(c.monto), 0) FROM pos_cobros c
        INNER JOIN pos_pedidos p ON p.id = c.pedido_id
        WHERE p.turno_id = t.id AND c.activo = TRUE)
                        AS total_facturado,
    (SELECT COALESCE(SUM(c.monto), 0) FROM pos_cobros c
        INNER JOIN pos_pedidos p ON p.id = c.pedido_id
        WHERE p.turno_id = t.id AND c.forma_cobro = 'EFECTIVO' AND c.activo = TRUE)
                        AS total_efectivo,
    (SELECT COALESCE(SUM(c.monto), 0) FROM pos_cobros c
        INNER JOIN pos_pedidos p ON p.id = c.pedido_id
        WHERE p.turno_id = t.id AND c.forma_cobro IN ('TARJETA_DEBITO','TARJETA_CREDITO') AND c.activo = TRUE)
                        AS total_tarjeta,
    (SELECT COALESCE(SUM(c.monto), 0) FROM pos_cobros c
        INNER JOIN pos_pedidos p ON p.id = c.pedido_id
        WHERE p.turno_id = t.id AND c.forma_cobro = 'QR' AND c.activo = TRUE)
                        AS total_qr
FROM pos_turnos t
    INNER JOIN pos_usuarios ua ON ua.id = t.usuario_apertura_id
    LEFT JOIN pos_usuarios uc ON uc.id = t.usuario_cierre_id
WHERE t.activo = TRUE;

-- Vista estado de mesas para mapa del salon
CREATE OR REPLACE VIEW v_pos_mesas_estado AS
SELECT
    m.id                AS mesa_id,
    m.numero,
    m.capacidad,
    m.estado,
    m.zona,
    p.id                AS pedido_id,
    p.estado            AS pedido_estado,
    p.total             AS pedido_total,
    p.created_at        AS pedido_desde,
    u.nombre            AS mozo_nombre,
    u.avatar_emoji      AS mozo_avatar,
    TIMESTAMPDIFF(MINUTE, p.created_at, NOW()) AS minutos_ocupada
FROM pos_mesas m
    LEFT JOIN pos_pedidos p ON p.mesa_id = m.id
        AND p.estado IN ('ABIERTO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO')
        AND p.activo = TRUE
    LEFT JOIN pos_usuarios u ON u.id = p.usuario_id
WHERE m.activo = TRUE;


-- ==========================================================================
-- SEED DATA (Testing / Desarrollo)
-- ==========================================================================

-- Usuarios POS
-- PINs en texto plano (para referencia):
--   Juan=142536, Maria=253647, Carlos=364758, Ana=475869, Pedro=586970
-- Los hashes son BCrypt con cost 10

INSERT INTO pos_usuarios (id, usuario_central_id, nombre, pin_hash, tipo, avatar_emoji, activo) VALUES
('u-pos-001', 'uc-001', 'Juan Martinez',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MOZO',     '👨‍🍳', TRUE),
('u-pos-002', 'uc-002', 'Maria Gonzalez',  '$2a$10$dKvEpF6x7E8mBqz3t6gMXe5Y2WQx2FZhK7pL5hRjX9mNbHvYw1oNi', 'CAJERO',   '💁‍♀️', TRUE),
('u-pos-003', 'uc-003', 'Carlos Lopez',    '$2a$10$rF3w8Ys5GqH2pN7xKjL9ZeA4mBvC6dE8fGhI0jKlMnO2pQrStUvW', 'COCINERO', '👨‍🍳', TRUE),
('u-pos-004', 'uc-004', 'Ana Rodriguez',   '$2a$10$xY1z2A3b4C5d6E7f8G9h0IjKlMnOpQrStUvWxYz1a2B3c4D5e6F7g', 'MOZO',     '🙋‍♀️', TRUE),
('u-pos-005', 'uc-005', 'Pedro Ramirez',   '$2a$10$hI0jKlMnO2pQrStUvWxY1z2A3b4C5d6E7f8G9hIjKlMnOpQrStUvW', 'CAJERO',   '🧑‍💼', TRUE);

-- Mesas - Salon principal (12 mesas) + Terraza (6 mesas) + VIP (2 mesas)
INSERT INTO pos_mesas (id, numero, capacidad, estado, zona) VALUES
('mesa-001', 1,  4, 'LIBRE',   'Salon principal'),
('mesa-002', 2,  4, 'LIBRE',   'Salon principal'),
('mesa-003', 3,  2, 'LIBRE',   'Salon principal'),
('mesa-004', 4,  2, 'LIBRE',   'Salon principal'),
('mesa-005', 5,  6, 'LIBRE',   'Salon principal'),
('mesa-006', 6,  6, 'LIBRE',   'Salon principal'),
('mesa-007', 7,  4, 'LIBRE',   'Salon principal'),
('mesa-008', 8,  4, 'LIBRE',   'Salon principal'),
('mesa-009', 9,  8, 'LIBRE',   'Salon principal'),
('mesa-010', 10, 8, 'LIBRE',   'Salon principal'),
('mesa-011', 11, 4, 'LIBRE',   'Salon principal'),
('mesa-012', 12, 4, 'LIBRE',   'Salon principal'),
('mesa-013', 13, 4, 'LIBRE',   'Terraza'),
('mesa-014', 14, 4, 'LIBRE',   'Terraza'),
('mesa-015', 15, 2, 'LIBRE',   'Terraza'),
('mesa-016', 16, 2, 'LIBRE',   'Terraza'),
('mesa-017', 17, 6, 'LIBRE',   'Terraza'),
('mesa-018', 18, 6, 'LIBRE',   'Terraza'),
('mesa-019', 19, 8, 'LIBRE',   'VIP'),
('mesa-020', 20, 10,'LIBRE',   'VIP');

-- Turno de ejemplo (cerrado, dia anterior)
INSERT INTO pos_turnos (id, fecha, tipo_turno, estado, usuario_apertura_id, usuario_cierre_id, hora_apertura, hora_cierre, monto_apertura, monto_cierre, observaciones) VALUES
('turno-001', '2026-03-31', 'TARDE', 'CERRADO', 'u-pos-002', 'u-pos-002',
 '2026-03-31 14:05:00', '2026-03-31 22:10:00', 10000.00, 58500.00, 'Turno sin novedades');

-- Turno activo de hoy
INSERT INTO pos_turnos (id, fecha, tipo_turno, estado, usuario_apertura_id, hora_apertura, monto_apertura) VALUES
('turno-002', '2026-04-01', 'MANANA', 'ABIERTO', 'u-pos-005',
 '2026-04-01 08:02:00', 15000.00);

-- Pedidos de ejemplo (turno activo)
INSERT INTO pos_pedidos (id, mesa_id, turno_id, usuario_id, estado, subtotal, descuento, total) VALUES
('pedido-001', 'mesa-003', 'turno-002', 'u-pos-001', 'ENTREGADO',  4200.00, 0.00, 4200.00),
('pedido-002', 'mesa-007', 'turno-002', 'u-pos-004', 'EN_PREPARACION', 7800.00, 0.00, 7800.00),
('pedido-003', 'mesa-013', 'turno-002', 'u-pos-001', 'ABIERTO',    2500.00, 0.00, 2500.00);

-- Actualizar estado de mesas con pedidos activos
UPDATE pos_mesas SET estado = 'OCUPADA' WHERE id IN ('mesa-003', 'mesa-007', 'mesa-013');

-- Items de pedidos
INSERT INTO pos_pedido_items (id, pedido_id, articulo_id, articulo_nombre, cantidad, precio_unitario, subtotal, notas) VALUES
-- Pedido 1 - Mesa 3
('item-001', 'pedido-001', 'art-101', 'Milanesa napolitana',      1, 2800.00, 2800.00, NULL),
('item-002', 'pedido-001', 'art-201', 'Coca-Cola 500ml',          2,  700.00, 1400.00, NULL),
-- Pedido 2 - Mesa 7
('item-003', 'pedido-002', 'art-102', 'Bife de chorizo con papas', 2, 3200.00, 6400.00, 'Punto medio'),
('item-004', 'pedido-002', 'art-202', 'Agua mineral 500ml',       2,  500.00, 1000.00, 'Sin gas'),
('item-005', 'pedido-002', 'art-301', 'Flan con dulce de leche',  1,  400.00,  400.00, NULL),
-- Pedido 3 - Mesa 13 (terraza)
('item-006', 'pedido-003', 'art-103', 'Empanadas x6',             1, 1800.00, 1800.00, '3 carne, 3 jamon y queso'),
('item-007', 'pedido-003', 'art-201', 'Coca-Cola 500ml',          1,  700.00,  700.00, NULL);

-- Cobro del pedido 1 (ya entregado, falta cobrar)
-- Sin cobros aun, para testear flujo de cobro

-- Cobros del turno anterior (para arqueo)
INSERT INTO pos_cobros (id, pedido_id, forma_cobro, monto, referencia, created_by) VALUES
('cobro-seed-001', 'pedido-001', 'EFECTIVO', 4200.00, NULL, 'u-pos-002');

-- Marcar pedido-001 como cobrado despues del cobro
UPDATE pos_pedidos SET estado = 'COBRADO' WHERE id = 'pedido-001';
UPDATE pos_mesas SET estado = 'LIBRE' WHERE id = 'mesa-003';

-- Arqueo del turno cerrado
INSERT INTO pos_arqueo_caja (id, turno_id, monto_apertura, total_efectivo, total_tarjeta, total_qr, total_cuenta_cte, monto_esperado, monto_cierre, diferencia) VALUES
('arqueo-001', 'turno-001', 10000.00, 32000.00, 14500.00, 2000.00, 0.00, 42000.00, 41800.00, -200.00);
