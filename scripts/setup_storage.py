import psycopg2
from apps.api.app.core.config import get_configuracion

cfg = get_configuracion()
conn = psycopg2.connect(cfg.database_url)
conn.autocommit = True
cur = conn.cursor()

# 1. Insertar buckets en storage.buckets
cur.execute("""
INSERT INTO storage.buckets (id, name, public)
VALUES ('informes-pdf', 'informes-pdf', false)
ON CONFLICT (id) DO NOTHING;
""")

cur.execute("""
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes-cultivo', 'imagenes-cultivo', false)
ON CONFLICT (id) DO NOTHING;
""")

# 2. Habilitar RLS y políticas para storage.objects
cur.execute("""
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Anon full access informes'
    ) THEN
        CREATE POLICY "Anon full access informes" ON storage.objects
        FOR ALL TO anon USING (bucket_id = 'informes-pdf') WITH CHECK (bucket_id = 'informes-pdf');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Anon full access imagenes'
    ) THEN
        CREATE POLICY "Anon full access imagenes" ON storage.objects
        FOR ALL TO anon USING (bucket_id = 'imagenes-cultivo') WITH CHECK (bucket_id = 'imagenes-cultivo');
    END IF;
END $$;
""")

print("Buckets de Supabase Storage configurados exitosamente en PostgreSQL!")
cur.close()
conn.close()
