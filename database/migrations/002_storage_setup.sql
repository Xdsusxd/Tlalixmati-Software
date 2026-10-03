-- =============================================================================
-- Migración 002: Configuración de buckets en Supabase Storage
-- =============================================================================
-- Buckets necesarios:
-- 1. 'imagenes-cultivo': Almacena fotos capturadas exclusivamente por la cámara real
--    conectada a la Raspberry Pi.
-- 2. 'informes-pdf': Almacena los reportes consolidados generados en PDF.
--
-- Ambos buckets son privados. El acceso se realiza a través de la API del backend
-- o mediante URLs firmadas temporales.
-- =============================================================================

-- Crear bucket para imágenes de campo si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'imagenes-cultivo',
    'imagenes-cultivo',
    false,
    15728640, -- 15 MB máximo por imagen
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 15728640,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Crear bucket para informes en PDF si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'informes-pdf',
    'informes-pdf',
    false,
    26214400, -- 25 MB máximo por informe
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 26214400,
    allowed_mime_types = ARRAY['application/pdf'];
