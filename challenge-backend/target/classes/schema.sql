-- Modelo de datos para el challenge fullstack
-- Tablas: transactions (transacciones Tenpistas), idempotency_record (claves de idempotencia)
-- Base de datos: PostgreSQL

-- Eliminar tablas si existen (útil para reiniciar entorno; comentar en producción)
-- DROP TABLE IF EXISTS idempotency_record;
-- DROP TABLE IF EXISTS transactions;

CREATE TABLE IF NOT EXISTS transactions (
    id                  BIGSERIAL PRIMARY KEY,
    monto               INTEGER NOT NULL,
    giro_comercio       VARCHAR(255),
    nombre_tenpista     VARCHAR(255),
    fecha_transaccion   TIMESTAMP NOT NULL,
    version             BIGINT DEFAULT 0,

    CONSTRAINT chk_monto_no_negativo
        CHECK (monto >= 0),
    CONSTRAINT chk_fecha_no_futura
        CHECK (fecha_transaccion <= CURRENT_TIMESTAMP)
);

-- Bloqueo optimista: Hibernate usa version en UPDATE (WHERE version = ?)
COMMENT ON COLUMN transactions.version IS 'Versión para bloqueo optimista (JPA @Version)';

-- Índice para listados ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_transactions_fecha ON transactions (fecha_transaccion DESC);

-- Comentarios sobre las columnas
COMMENT ON TABLE transactions IS 'Transacciones asociadas a cuentas de Tenpistas';
COMMENT ON COLUMN transactions.id IS 'Identificador único de la transacción';
COMMENT ON COLUMN transactions.monto IS 'Monto en pesos (no negativo)';
COMMENT ON COLUMN transactions.giro_comercio IS 'Giro o comercio donde se realizó la transacción';
COMMENT ON COLUMN transactions.nombre_tenpista IS 'Nombre del Tenpista';
COMMENT ON COLUMN transactions.fecha_transaccion IS 'Fecha y hora de la transacción (no puede ser futura)';

-- Tabla de idempotencia: evita duplicados por X-Idempotency-Key (UUID desde el cliente)
CREATE TABLE IF NOT EXISTS idempotency_record (
    id                  BIGSERIAL PRIMARY KEY,
    idempotency_key     VARCHAR(36) NOT NULL,
    transaction_id      BIGINT NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_idempotency_key UNIQUE (idempotency_key)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_idempotency_key ON idempotency_record (idempotency_key);

COMMENT ON TABLE idempotency_record IS 'Asociación clave de idempotencia (X-Idempotency-Key) → transacción creada';
COMMENT ON COLUMN idempotency_record.idempotency_key IS 'UUID enviado por el cliente en el header X-Idempotency-Key';
COMMENT ON COLUMN idempotency_record.transaction_id IS 'ID de la transacción creada en la primera petición con esta clave';
COMMENT ON COLUMN idempotency_record.created_at IS 'Momento en que se registró la clave';
