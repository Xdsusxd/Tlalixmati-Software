-- =============================================================================
-- Migración 001: Esquema inicial de Tlalixmati
-- =============================================================================
-- Reglas de diseño:
-- 1. NO existe tabla 'tlahuicole'. Tlahuicole es la agrupación lógica de ESP32,
--    Raspberry Pi y periféricos. Su estado se calcula desde sus partes reales.
-- 2. La identidad física proviene de la placa: dirección MAC o serial de CPU.
-- 3. Las imágenes solo provienen de la cámara física. No hay carga manual.
-- 4. Las mediciones corresponden a sensores reales. Prohibido insertar datos ficticios.
-- =============================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función reutilizable para actualizar el campo 'actualizado_en' automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. Componentes físicos reales
-- Registra cada placa o periférico por su identificador de hardware.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(32) NOT NULL CHECK (tipo IN ('esp32', 'raspberry', 'camara', 'vision', 'periferico')),
    identificador_hardware VARCHAR(128) NOT NULL UNIQUE, -- MAC address, CPU serial o UUID de placa
    modelo VARCHAR(128),                                  -- Modelo real (ej. 'ESP32-WROOM-32D', 'Raspberry Pi 4')
    version_firmware VARCHAR(64),                         -- Versión del software que corre en el dispositivo
    habilitado BOOLEAN NOT NULL DEFAULT false,            -- Según esté activado en config/system.yaml
    estado VARCHAR(64) NOT NULL DEFAULT 'Componente no conectado',
    ip_local VARCHAR(45),                                 -- IPv4 o IPv6 asignada en la red local
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,          -- Diagnósticos técnicos del dispositivo
    ultima_comunicacion TIMESTAMPTZ,                      -- Fecha/hora UTC del último latido recibido
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_components_tipo ON components(tipo);
CREATE INDEX IF NOT EXISTS idx_components_identificador ON components(identificador_hardware);
CREATE INDEX IF NOT EXISTS idx_components_ultima_comunicacion ON components(ultima_comunicacion DESC);

CREATE TRIGGER trg_components_actualizado_en
    BEFORE UPDATE ON components
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_modificacion();

-- -----------------------------------------------------------------------------
-- 2. Conexiones entre componentes
-- Define cómo interactúan físicamente los componentes en campo (ej. ESP32 con Raspberry por UART).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS component_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_origen_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    componente_destino_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    tipo_conexion VARCHAR(32) NOT NULL CHECK (tipo_conexion IN ('uart', 'usb', 'csi', 'i2c', 'spi', 'wifi', 'ethernet')),
    puerto_o_interfaz VARCHAR(64),                        -- Ej. '/dev/ttyS0', 'ttyUSB0', 'CAM0'
    activo BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_component_connection UNIQUE (componente_origen_id, componente_destino_id, tipo_conexion)
);

CREATE INDEX IF NOT EXISTS idx_connections_origen ON component_connections(componente_origen_id);
CREATE INDEX IF NOT EXISTS idx_connections_destino ON component_connections(componente_destino_id);

-- -----------------------------------------------------------------------------
-- 3. Cultivos
-- Lotes, invernaderos o parcelas bajo monitoreo del sistema.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cultivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(128) NOT NULL,
    variedad VARCHAR(128),
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    ubicacion VARCHAR(256),
    notas TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cultivations_activo ON cultivations(activo);

CREATE TRIGGER trg_cultivations_actualizado_en
    BEFORE UPDATE ON cultivations
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_modificacion();

-- -----------------------------------------------------------------------------
-- 4. Plantas individuales
-- Seguimiento puntual dentro de un cultivo cuando se requiera monitorear especímenes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL REFERENCES cultivations(id) ON DELETE CASCADE,
    codigo_etiqueta VARCHAR(64),                          -- Identificador físico en campo (QR, código de surco)
    posicion_x NUMERIC(8, 2),                             -- Coordenada relativa en metros o cuadrícula
    posicion_y NUMERIC(8, 2),
    estado_salud VARCHAR(64) NOT NULL DEFAULT 'Sin análisis',
    notas TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_plants_cultivo ON plants(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_plants_codigo ON plants(codigo_etiqueta);

-- -----------------------------------------------------------------------------
-- 5. Mediciones de sensores
-- Registra telemetría real proveniente de sensores conectados a ESP32 o Raspberry.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    cultivo_id UUID REFERENCES cultivations(id) ON DELETE SET NULL,
    planta_id UUID REFERENCES plants(id) ON DELETE SET NULL,
    tipo_sensor VARCHAR(64) NOT NULL,                     -- Ej. 'temperatura_suelo', 'humedad_ambiente', 'luz'
    valor NUMERIC(12, 4) NOT NULL,                        -- Valor numérico leído
    unidad VARCHAR(32) NOT NULL,                          -- Ej. 'celsius', 'porcentaje', 'lux', 'ppm'
    medido_en TIMESTAMPTZ NOT NULL,                       -- Marca temporal en la que el hardware tomó la lectura
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_measurements_componente ON measurements(componente_id);
CREATE INDEX IF NOT EXISTS idx_measurements_cultivo ON measurements(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_measurements_tipo ON measurements(tipo_sensor);
CREATE INDEX IF NOT EXISTS idx_measurements_medido_en ON measurements(medido_en DESC);

-- -----------------------------------------------------------------------------
-- 6. Imágenes de campo
-- Solo fotos capturadas por la cámara física real a través de la Raspberry Pi.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    cultivo_id UUID REFERENCES cultivations(id) ON DELETE SET NULL,
    planta_id UUID REFERENCES plants(id) ON DELETE SET NULL,
    storage_path VARCHAR(512) NOT NULL UNIQUE,            -- Ruta dentro del bucket 'imagenes-cultivo'
    ancho_px INTEGER,
    alto_px INTEGER,
    formato VARCHAR(16) NOT NULL,                         -- 'jpg', 'png', etc.
    hash_sha256 VARCHAR(64),                              -- Verificación de integridad de archivo
    metadatos_captura JSONB NOT NULL DEFAULT '{}'::jsonb, -- Exposición, ganancia, temperatura de cámara
    capturado_en TIMESTAMPTZ NOT NULL,                    -- Momento exacto del disparo de cámara
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_images_componente ON images(componente_id);
CREATE INDEX IF NOT EXISTS idx_images_cultivo ON images(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_images_capturado_en ON images(capturado_en DESC);

-- -----------------------------------------------------------------------------
-- 7. Ejecuciones de modelos de IA (Model Runs)
-- Auditoría de cada ejecución de YOLO o PyTorch para trazabilidad de inferencias.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_modelo VARCHAR(128) NOT NULL,                  -- Ej. 'yolov8n-seg', 'anomalia-pytorch-v1'
    version_modelo VARCHAR(64) NOT NULL,
    tipo_tarea VARCHAR(64) NOT NULL CHECK (tipo_tarea IN ('deteccion', 'segmentacion', 'clasificacion', 'anomalias')),
    dispositivo_ejecucion VARCHAR(64) NOT NULL,           -- 'cuda:0' (RTX 4050), 'cpu', o 'edge_rpi'
    iniciado_en TIMESTAMPTZ NOT NULL,
    finalizado_en TIMESTAMPTZ,
    duracion_ms INTEGER,                                  -- Tiempo de ejecución de la inferencia
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,          -- Hiperparámetros, pesos usados, etc.
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_model_runs_nombre ON model_runs(nombre_modelo);
CREATE INDEX IF NOT EXISTS idx_model_runs_iniciado ON model_runs(iniciado_en DESC);

-- -----------------------------------------------------------------------------
-- 8. Análisis e inferencias
-- Resultados de procesamiento de visión computacional sobre imágenes reales.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES model_runs(id) ON DELETE CASCADE,
    imagen_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    clase_detectada VARCHAR(128) NOT NULL,
    confianza NUMERIC(5, 4) NOT NULL CHECK (confianza >= 0 AND confianza <= 1),
    bounding_box JSONB,                                   -- Coordenadas [x1, y1, x2, y2]
    mascara_segmentacion JSONB,                           -- Polígonos de segmentación si aplica
    anomalia_detectada BOOLEAN NOT NULL DEFAULT false,
    descripcion_anomalia TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analyses_imagen ON analyses(imagen_id);
CREATE INDEX IF NOT EXISTS idx_analyses_run ON analyses(run_id);
CREATE INDEX IF NOT EXISTS idx_analyses_anomalia ON analyses(anomalia_detectada);

-- -----------------------------------------------------------------------------
-- 9. Informes generados
-- Resúmenes periódicos y archivos PDF guardados en Supabase Storage.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID REFERENCES cultivations(id) ON DELETE SET NULL,
    titulo VARCHAR(256) NOT NULL,
    periodo_inicio TIMESTAMPTZ NOT NULL,
    periodo_fin TIMESTAMPTZ NOT NULL,
    storage_path VARCHAR(512),                            -- Ruta en el bucket 'informes-pdf'
    resumen_datos JSONB NOT NULL,                         -- Separación clara: datos medidos, calculados y resultados IA
    generado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_cultivo ON reports(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_reports_generado_en ON reports(generado_en DESC);

-- -----------------------------------------------------------------------------
-- 10. Bitácora de eventos del sistema (Auditoría de campo)
-- Sucesos relevantes: conexiones, reconexiones UART, reinicios, caídas de señal.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_id UUID REFERENCES components(id) ON DELETE SET NULL,
    nivel VARCHAR(16) NOT NULL CHECK (nivel IN ('info', 'aviso', 'error', 'critico')),
    origen VARCHAR(64) NOT NULL,                          -- 'esp32_uart', 'rpi_agent', 'api', 'vision'
    mensaje TEXT NOT NULL,
    detalles JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_componente ON events(componente_id);
CREATE INDEX IF NOT EXISTS idx_events_nivel ON events(nivel);
CREATE INDEX IF NOT EXISTS idx_events_creado_en ON events(creado_en DESC);
