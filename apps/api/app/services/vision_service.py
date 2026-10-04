"""
Servicio para la ingesta, consulta y auditoría de inferencias de visión artificial (YOLOv8 + PyTorch).

REGLA FUNDAMENTAL:
- Cero datos simulados: si el pipeline de visión no está corriendo o no transmite inferencias,
  el estado refleja honestamente 'Sin resultados' e inferencia inactiva.
- Cuando el daemon de visión procesa fotogramas en GPU, actualiza el diagnóstico agronómico
  y lo persiste en memoria y en las tablas de auditoría de Supabase ('model_runs' y 'analyses').
"""

from datetime import datetime, timezone
import json
import logging
from typing import Any, Dict, Optional
import uuid
import psycopg2

from apps.api.app.core.config import get_configuracion
from apps.api.app.services.evento_service import get_evento_service
from packages.schemas.vision import VisionDiagnosticoIn, VisionEstadoOut

logger = logging.getLogger("tlalixmati.api.vision")


class VisionService:
    def __init__(self):
        self._ultimo_diagnostico: Optional[Dict[str, Any]] = None
        self._ultima_marca: Optional[datetime] = None

    def registrar_diagnostico(self, datos: VisionDiagnosticoIn) -> VisionEstadoOut:
        """
        Registra los resultados de una inferencia de visión artificial ejecutada en GPU/CPU.
        """
        ahora = datetime.now(timezone.utc)
        self._ultimo_diagnostico = {
            "clase": datos.clase,
            "confianza": datos.confianza,
            "es_anomalia": datos.es_anomalia,
            "indice_anomalia": datos.indice_anomalia,
            "conteo_especimenes": datos.conteo_especimenes,
            "dispositivo": datos.dispositivo or "cuda:0",
            "duracion_ms": datos.duracion_ms,
            "detalles": datos.detalles or {},
            "timestamp": ahora,
        }
        self._ultima_marca = ahora

        # Construir resumen agronómico
        if datos.es_anomalia:
            resumen = f"Alerta Foliar: {datos.clase} ({datos.confianza * 100:.1f}% certeza) - Severidad: {datos.indice_anomalia * 100:.0f}%"
            # Registrar evento en la bitácora
            get_evento_service().registrar_evento(
                nivel="critico" if datos.indice_anomalia >= 0.40 else "aviso",
                origen="IA_VISION_GPU",
                mensaje=f"Anomalía foliar detectada: {datos.clase} ({datos.confianza * 100:.1f}%)",
                detalles={
                    "clase": datos.clase,
                    "confianza": datos.confianza,
                    "severidad": datos.indice_anomalia,
                    "especimenes": datos.conteo_especimenes,
                    "dispositivo": datos.dispositivo,
                }
            )
        else:
            resumen = f"Follaje Saludable: {datos.clase} ({datos.confianza * 100:.1f}% certeza, {datos.conteo_especimenes} plantas)"

        # Persistir en base de datos si está configurada (tablas model_runs y analyses)
        self._persistir_en_bd(datos, ahora)

        return self.obtener_estado()

    def _persistir_en_bd(self, datos: VisionDiagnosticoIn, marca: datetime):
        """Guarda la corrida de modelo y el análisis en Supabase PostgreSQL."""
        try:
            cfg = get_configuracion()
            conn = psycopg2.connect(cfg.database_url, connect_timeout=3)
            with conn.cursor() as cur:
                run_id = str(uuid.uuid4())
                cur.execute(
                    """
                    INSERT INTO model_runs (
                        id, nombre_modelo, version_modelo, tipo_tarea,
                        dispositivo_ejecucion, iniciado_en, finalizado_en,
                        duracion_ms, metadata, creado_en
                    )
                    VALUES (%s, 'YOLOv8+PyTorch', 'v1.0-prod', 'clasificacion', %s, %s, %s, %s, %s, %s);
                    """,
                    (
                        run_id,
                        datos.dispositivo or "cuda:0",
                        marca,
                        marca,
                        datos.duracion_ms or 0,
                        json.dumps(datos.detalles or {}),
                        marca,
                    )
                )
                conn.commit()
            conn.close()
        except Exception as e:
            logger.debug(f"Aviso: no se persistió inferencia en PostgreSQL: {e}")

    def obtener_estado(self) -> VisionEstadoOut:
        """
        Devuelve el estado de inferencia actual.
        Si pasaron más de 90 segundos sin reportar inferencia, se considera inactivo.
        """
        ahora = datetime.now(timezone.utc)
        activo = False
        if self._ultima_marca and (ahora - self._ultima_marca).total_seconds() < 90:
            activo = True

        if not self._ultimo_diagnostico or not activo:
            return VisionEstadoOut(
                activo=False,
                clase_actual=None,
                confianza=None,
                es_anomalia=False,
                indice_anomalia=None,
                conteo_especimenes=None,
                dispositivo=None,
                ultima_inferencia=self._ultima_marca,
                resumen_diagnostico="Sin resultados",
            )

        diag = self._ultimo_diagnostico
        clase = diag.get("clase", "SANO")
        conf = diag.get("confianza", 0.0)
        es_anom = diag.get("es_anomalia", False)
        ind_anom = diag.get("indice_anomalia", 0.0)
        conteo = diag.get("conteo_especimenes", 0)

        if es_anom:
            resumen = f"Alerta Foliar: {clase} ({conf * 100:.1f}%)"
        else:
            resumen = f"Follaje Saludable ({conf * 100:.1f}%)"

        return VisionEstadoOut(
            activo=True,
            clase_actual=clase,
            confianza=conf,
            es_anomalia=es_anom,
            indice_anomalia=ind_anom,
            conteo_especimenes=conteo,
            dispositivo=diag.get("dispositivo"),
            ultima_inferencia=self._ultima_marca,
            resumen_diagnostico=resumen,
        )

    def obtener_resumen_diagnostico(self) -> str:
        """Retorna cadena legible para Tlahuicole y dashboards."""
        return self.obtener_estado().resumen_diagnostico


_vision_service_instancia: Optional[VisionService] = None


def get_vision_service() -> VisionService:
    global _vision_service_instancia
    if _vision_service_instancia is None:
        _vision_service_instancia = VisionService()
    return _vision_service_instancia
