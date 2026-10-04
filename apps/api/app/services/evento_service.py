"""
Servicio para la bitácora de eventos y auditoría de campo de Tlalixmati.

Registra sucesos críticos, advertencias operativas y eventos informativos
tanto en memoria como en la tabla PostgreSQL 'events' en Supabase.
"""

from datetime import datetime, timezone
import json
import logging
from typing import Any, Dict, List, Optional
import uuid
import psycopg2

from apps.api.app.core.config import get_configuracion
from packages.schemas.evento import EventoIn, EventoOut, NivelEvento

logger = logging.getLogger("tlalixmati.api.eventos")


class EventoService:
    def __init__(self):
        self._eventos_memoria: List[Dict[str, Any]] = []
        self._cargar_eventos_desde_bd()

    def _cargar_eventos_desde_bd(self):
        """Carga los sucesos recientes de la base de datos PostgreSQL."""
        try:
            cfg = get_configuracion()
            conn = psycopg2.connect(cfg.database_url, connect_timeout=3)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, nivel, origen, mensaje, detalles, creado_en
                    FROM events
                    ORDER BY creado_en DESC
                    LIMIT 50;
                    """
                )
                filas = cur.fetchall()
                for fila in filas:
                    ev_id, nivel, origen, mensaje, detalles, creado_en = fila
                    self._eventos_memoria.append({
                        "id": str(ev_id),
                        "nivel": nivel,
                        "origen": origen,
                        "mensaje": mensaje,
                        "detalles": detalles if isinstance(detalles, dict) else {},
                        "creado_en": creado_en if creado_en else datetime.now(timezone.utc),
                    })
            conn.close()
        except Exception as e:
            logger.debug(f"Aviso: no se pudo precargar eventos desde PostgreSQL: {e}")

    def registrar_evento(
        self,
        nivel: str,
        origen: str,
        mensaje: str,
        detalles: Optional[Dict[str, Any]] = None,
        componente_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Registra un suceso agronómico o del sistema en memoria y persiste en Supabase.
        """
        evento_id = str(uuid.uuid4())
        ahora = datetime.now(timezone.utc)
        meta = detalles or {}

        evento = {
            "id": evento_id,
            "nivel": nivel,
            "origen": origen,
            "mensaje": mensaje,
            "detalles": meta,
            "creado_en": ahora,
        }

        # Guardar en buffer circular en memoria (máximo 100 eventos)
        self._eventos_memoria.insert(0, evento)
        if len(self._eventos_memoria) > 100:
            self._eventos_memoria.pop()

        # Persistir en PostgreSQL
        try:
            cfg = get_configuracion()
            conn = psycopg2.connect(cfg.database_url, connect_timeout=3)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO events (id, componente_id, nivel, origen, mensaje, detalles, creado_en)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                    """,
                    (
                        evento_id,
                        componente_id,
                        nivel,
                        origen,
                        mensaje,
                        json.dumps(meta),
                        ahora,
                    )
                )
                conn.commit()
            conn.close()
        except Exception as e:
            logger.debug(f"Aviso: no se persistió evento en BD (modo local/offline): {e}")

        return evento

    def listar_eventos(
        self,
        limite: int = 30,
        nivel: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retorna la lista de eventos filtrada opcionalmente por nivel."""
        res = self._eventos_memoria
        if nivel:
            res = [e for e in res if e["nivel"].lower() == nivel.lower()]
        return res[:limite]


_evento_service_instancia: Optional[EventoService] = None


def get_evento_service() -> EventoService:
    global _evento_service_instancia
    if _evento_service_instancia is None:
        _evento_service_instancia = EventoService()
    return _evento_service_instancia
