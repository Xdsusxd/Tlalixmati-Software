"""
Servicio para la consulta de información general del sistema, configuración y salud.
"""

from datetime import datetime, timezone
from apps.api.app.core.config import detectar_gpu_local, get_configuracion
from packages.schemas.sistema import GPUInfo, SaludResponse, SistemaConfiguracionResumen


class SistemaService:
    """Provee métodos para inspeccionar el estado y la configuración global de Tlalixmati."""

    @staticmethod
    def obtener_resumen_configuracion() -> SistemaConfiguracionResumen:
        """Devuelve un resumen de la configuración del sistema leída desde config/system.yaml."""
        cfg = get_configuracion()
        return SistemaConfiguracionResumen(
            proyecto_nombre=cfg.proyecto.nombre,
            proyecto_version=cfg.proyecto.version,
            esp32_habilitado=cfg.esp32.habilitado,
            raspberry_habilitada=cfg.raspberry.habilitado,
            camara_habilitada=cfg.camara.habilitado,
            vision_habilitada=cfg.vision.habilitado,
            protocolo_comunicacion=cfg.comunicacion_protocolo,
        )

    @staticmethod
    def obtener_diagnostico_gpu() -> GPUInfo:
        """Devuelve el estado de la GPU de desarrollo (RTX 4050) y disponibilidad de CUDA."""
        return detectar_gpu_local()

    @staticmethod
    def verificar_salud(componentes_activos: int = 0) -> SaludResponse:
        """
        Calcula el estado de salud de la API y sus subsistemas.
        No inventa estado de base de datos si no está configurada.
        """
        cfg = get_configuracion()
        db_estado = "configurada" if cfg.database_url or cfg.supabase_url else "no_configurada (esperando Fase 03)"

        return SaludResponse(
            estado="ok",
            timestamp=datetime.now(timezone.utc),
            version=cfg.proyecto.version,
            servicios={
                "api": "operativo",
                "configuracion": "cargada",
                "base_de_datos": db_estado,
                "aceleracion_gpu": "disponible" if detectar_gpu_local().cuda_disponible else "no_disponible",
            },
            componentes_activos=componentes_activos,
        )
