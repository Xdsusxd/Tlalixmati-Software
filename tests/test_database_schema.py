"""
Pruebas para verificar la integridad de las migraciones y el esquema SQL de Supabase/PostgreSQL.
"""

from pathlib import Path
import re


def test_migraciones_sql_existen_y_no_estan_vacias():
    """Verifica la existencia y contenido de los archivos de migración y esquema."""
    base_dir = Path(__file__).resolve().parent.parent
    migracion_001 = base_dir / "database" / "migrations" / "001_initial_schema.sql"
    migracion_002 = base_dir / "database" / "migrations" / "002_storage_setup.sql"
    esquema_consolidado = base_dir / "database" / "schema" / "schema.sql"

    assert migracion_001.exists() and migracion_001.stat().st_size > 0
    assert migracion_002.exists() and migracion_002.stat().st_size > 0
    assert esquema_consolidado.exists() and esquema_consolidado.stat().st_size > 0


def test_regla_tlahuicole_no_es_tabla_en_sql():
    """
    Regla fundamental: Tlahuicole NO es una entidad de dispositivo independiente
    ni debe existir como tabla en PostgreSQL.
    """
    base_dir = Path(__file__).resolve().parent.parent
    esquema_path = base_dir / "database" / "schema" / "schema.sql"
    sql = esquema_path.read_text(encoding="utf-8").lower()

    # Buscar cualquier intento de CREATE TABLE tlahuicole
    assert "create table if not exists tlahuicole " not in sql
    assert "create table tlahuicole" not in sql


def test_todas_las_entidades_principales_estan_definidas():
    """Verifica que las 10 entidades requeridas en la arquitectura existan en el DDL."""
    base_dir = Path(__file__).resolve().parent.parent
    esquema_path = base_dir / "database" / "schema" / "schema.sql"
    sql = esquema_path.read_text(encoding="utf-8").lower()

    tablas_requeridas = [
        "components",
        "component_connections",
        "cultivations",
        "plants",
        "measurements",
        "images",
        "model_runs",
        "analyses",
        "reports",
        "events",
    ]

    for tabla in tablas_requeridas:
        patron = rf"create table if not exists {tabla}\b"
        assert re.search(patron, sql), f"Falta definir la tabla '{tabla}' en el esquema SQL"


def test_storage_buckets_definidos_correctamente():
    """Verifica que los buckets privados para fotos de cámara y PDFs existan en la migración 002."""
    base_dir = Path(__file__).resolve().parent.parent
    storage_path = base_dir / "database" / "migrations" / "002_storage_setup.sql"
    sql = storage_path.read_text(encoding="utf-8").lower()

    assert "'imagenes-cultivo'" in sql
    assert "'informes-pdf'" in sql
    assert "public = false" in sql
