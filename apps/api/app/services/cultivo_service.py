"""
Servicio para la gestión y seguimiento del cultivo activo en Tlalixmati.
"""

from datetime import date, datetime, timezone
import logging
from typing import Any, Dict, List, Optional
import uuid
import psycopg2

from apps.api.app.core.config import get_configuracion
from packages.schemas.cultivo import CultivoIn, CultivoOut

logger = logging.getLogger("tlalixmati.api.cultivos")


class CultivoService:
    def __init__(self):
        self._cultivo_activo_memoria: Optional[Dict[str, Any]] = None
        self._cargar_cultivo_activo_desde_bd()

    def _cargar_cultivo_activo_desde_bd(self):
        """Intenta recuperar el cultivo actualmente activo desde Supabase PostgreSQL."""
        try:
            cfg = get_configuracion()
            conn = psycopg2.connect(cfg.database_url, connect_timeout=3)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, nombre, variedad, fecha_inicio, fecha_fin, ubicacion, notas, activo, creado_en
                    FROM cultivations
                    WHERE activo = true
                    ORDER BY actualizado_en DESC
                    LIMIT 1;
                    """
                )
                fila = cur.fetchone()
                if fila:
                    c_id, nom, var, f_ini, f_fin, ubi, notas, act, cr_en = fila
                    self._cultivo_activo_memoria = {
                        "id": str(c_id),
                        "nombre": nom,
                        "variedad": var,
                        "fecha_inicio": f_ini,
                        "fecha_fin": f_fin,
                        "ubicacion": ubi,
                        "notas": notas,
                        "activo": act,
                        "creado_en": cr_en,
                    }
            conn.close()
        except Exception as e:
            logger.debug(f"Aviso: no se pudo cargar cultivo activo de PostgreSQL: {e}")

    def obtener_cultivo_activo(self) -> Optional[CultivoOut]:
        """Retorna el cultivo actualmente en seguimiento, o None si no hay ninguno registrado."""
        if not self._cultivo_activo_memoria:
            return None
        return CultivoOut(**self._cultivo_activo_memoria)

    def registrar_o_actualizar_cultivo(self, datos: CultivoIn) -> CultivoOut:
        """Registra una nueva parcela/cultivo y lo establece como activo."""
        cultivo_id = str(uuid.uuid4())
        ahora = datetime.now(timezone.utc)
        fecha_ini = datos.fecha_inicio or date.today()

        nuevo_cultivo = {
            "id": cultivo_id,
            "nombre": datos.nombre,
            "variedad": datos.variedad,
            "fecha_inicio": fecha_ini,
            "fecha_fin": None,
            "ubicacion": datos.ubicacion,
            "notas": datos.notas,
            "activo": datos.activo,
            "creado_en": ahora,
        }

        if datos.activo:
            self._cultivo_activo_memoria = nuevo_cultivo

        try:
            cfg = get_configuracion()
            conn = psycopg2.connect(cfg.database_url, connect_timeout=3)
            with conn.cursor() as cur:
                if datos.activo:
                    # Desactivar cultivos previos
                    cur.execute("UPDATE cultivations SET activo = false WHERE activo = true;")
                
                cur.execute(
                    """
                    INSERT INTO cultivations (id, nombre, variedad, fecha_inicio, ubicacion, notas, activo, creado_en)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                    """,
                    (
                        cultivo_id,
                        datos.nombre,
                        datos.variedad,
                        fecha_ini,
                        datos.ubicacion,
                        datos.notas,
                        datos.activo,
                        ahora
                    )
                )
                conn.commit()
            conn.close()
        except Exception as e:
            logger.debug(f"Aviso: no se persistió cultivo en BD: {e}")

        return CultivoOut(**nuevo_cultivo)


_cultivo_service_instancia: Optional[CultivoService] = None


def get_cultivo_service() -> CultivoService:
    global _cultivo_service_instancia
    if _cultivo_service_instancia is None:
        _cultivo_service_instancia = CultivoService()
    return _cultivo_service_instancia
