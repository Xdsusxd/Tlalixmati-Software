-- =============================================================================
-- TLALIXMATI - Esquema de Base de Datos Consolidado (PostgreSQL / Supabase)
-- =============================================================================
-- Principios:
-- 1. Tlahuicole no existe como tabla ni entidad independiente. Su estado es
--    calculado a partir de sus componentes físicos reales.
-- 2. Cada dispositivo se identifica mediante su hardware real (MAC address, CPU serial).
-- 3. Solo se almacenan datos reales. Prohibido insertar mediciones o fotos ficticias.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función de actualización de marcas temporales
CREATE OR REPLACE FUNCTION actualizar_timestamp_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Componentes físicos reales
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(32) NOT NULL CHECK (tipo IN ('esp32', 'raspberry', 'camara', 'vision', 'periferico')),
    identificador_hardware VARCHAR(128) NOT NULL UNIQUE,
    modelo VARCHAR(128),
    version_firmware VARCHAR(64),
    habilitado BOOLEAN NOT NULL DEFAULT false,
    estado VARCHAR(64) NOT NULL DEFAULT 'Componente no conectado',
    ip_local VARCHAR(45),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ultima_comunicacion TIMESTAMPTZ,
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

-- 2. Conexiones entre componentes
CREATE TABLE IF NOT EXISTS component_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_origen_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    componente_destino_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    tipo_conexion VARCHAR(32) NOT NULL CHECK (tipo_conexion IN ('uart', 'usb', 'csi', 'i2c', 'spi', 'wifi', 'ethernet')),
    puerto_o_interfaz VARCHAR(64),
    activo BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_component_connection UNIQUE (componente_origen_id, componente_destino_id, tipo_conexion)
);

CREATE INDEX IF NOT EXISTS idx_connections_origen ON component_connections(componente_origen_id);
CREATE INDEX IF NOT EXISTS idx_connections_destino ON component_connections(componente_destino_id);

-- 3. Cultivos
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

-- 4. Plantas
CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL REFERENCES cultivations(id) ON DELETE CASCADE,
    codigo_etiqueta VARCHAR(64),
    posicion_x NUMERIC(8, 2),
    posicion_y NUMERIC(8, 2),
    estado_salud VARCHAR(64) NOT NULL DEFAULT 'Sin análisis',
    notas TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_plants_cultivo ON plants(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_plants_codigo ON plants(codigo_etiqueta);

-- 5. Mediciones
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    cultivo_id UUID REFERENCES cultivations(id) ON DELETE SET NULL,
    planta_id UUID REFERENCES plants(id) ON DELETE SET NULL,
    tipo_sensor VARCHAR(64) NOT NULL,
    valor NUMERIC(12, 4) NOT NULL,
    unidad VARCHAR(32) NOT NULL,
    medido_en TIMESTAMPTZ NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_measurements_componente ON measurements(componente_id);
CREATE INDEX IF NOT EXISTS idx_measurements_cultivo ON measurements(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_measurements_tipo ON measurements(tipo_sensor);
CREATE INDEX IF NOT EXISTS idx_measurements_medido_en ON measurements(medido_en DESC);

-- 6. Imágenes
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    cultivo_id UUID REFERENCES cultivations(id) ON DELETE SET NULL,
    planta_id UUID REFERENCES plants(id) ON DELETE SET NULL,
    storage_path VARCHAR(512) NOT NULL UNIQUE,
    ancho_px INTEGER,
    alto_px INTEGER,
    formato VARCHAR(16) NOT NULL,
    hash_sha256 VARCHAR(64),
    metadatos_captura JSONB NOT NULL DEFAULT '{}'::jsonb,
    capturado_en TIMESTAMPTZ NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_images_componente ON images(componente_id);
CREATE INDEX IF NOT EXISTS idx_images_cultivo ON images(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_images_capturado_en ON images(capturado_en DESC);

-- 7. Ejecuciones de Modelos (Model Runs)
CREATE TABLE IF NOT EXISTS model_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_modelo VARCHAR(128) NOT NULL,
    version_modelo VARCHAR(64) NOT NULL,
    tipo_tarea VARCHAR(64) NOT NULL CHECK (tipo_tarea IN ('deteccion', 'segmentacion', 'clasificacion', 'anomalias')),
    dispositivo_ejecucion VARCHAR(64) NOT NULL,
    iniciado_en TIMESTAMPTZ NOT NULL,
    finalizado_en TIMESTAMPTZ,
    duracion_ms INTEGER,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_model_runs_nombre ON model_runs(nombre_modelo);
CREATE INDEX IF NOT EXISTS idx_model_runs_iniciado ON model_runs(iniciado_en DESC);

-- 8. Análisis
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES model_runs(id) ON DELETE CASCADE,
    imagen_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    clase_detectada VARCHAR(128) NOT NULL,
    confianza NUMERIC(5, 4) NOT NULL CHECK (confianza >= 0 AND confianza <= 1),
    bounding_box JSONB,
    mascara_segmentacion JSONB,
    anomalia_detectada BOOLEAN NOT NULL DEFAULT false,
    descripcion_anomalia TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analyses_imagen ON analyses(imagen_id);
CREATE INDEX IF NOT EXISTS idx_analyses_run ON analyses(run_id);
CREATE INDEX IF NOT EXISTS idx_analyses_anomalia ON analyses(anomalia_detectada);

-- 9. Informes
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID REFERENCES cultivations(id) ON DELETE SET NULL,
    titulo VARCHAR(256) NOT NULL,
    periodo_inicio TIMESTAMPTZ NOT NULL,
    periodo_fin TIMESTAMPTZ NOT NULL,
    storage_path VARCHAR(512),
    resumen_datos JSONB NOT NULL,
    generado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_cultivo ON reports(cultivo_id);
CREATE INDEX IF NOT EXISTS idx_reports_generado_en ON reports(generado_en DESC);

-- 10. Eventos y auditoría
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_id UUID REFERENCES components(id) ON DELETE SET NULL,
    nivel VARCHAR(16) NOT NULL CHECK (nivel IN ('info', 'aviso', 'error', 'critico')),
    origen VARCHAR(64) NOT NULL,
    mensaje TEXT NOT NULL,
    detalles JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_componente ON events(componente_id);
CREATE INDEX IF NOT EXISTS idx_events_nivel ON events(nivel);
CREATE INDEX IF NOT EXISTS idx_events_creado_en ON events(creado_en DESC);
