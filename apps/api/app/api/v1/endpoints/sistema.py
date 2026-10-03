"""
Endpoints para la consulta de configuración del sistema y diagnóstico de hardware de cómputo (/api/v1/sistema).
"""

from fastapi import APIRouter
from apps.api.app.services.sistema_service import SistemaService
from packages.schemas.sistema import GPUInfo, SistemaConfiguracionResumen

router = APIRouter(prefix="/sistema", tags=["Sistema"])


@router.get(
    "/configuracion",
    response_model=SistemaConfiguracionResumen,
    summary="Consultar configuración del sistema",
    description="Devuelve el resumen de parámetros y componentes habilitados en config/system.yaml."
)
async def obtener_configuracion():
    """Retorna la configuración global activa sin exponer secretos ni contraseñas."""
    return SistemaService.obtener_resumen_configuracion()


@router.get(
    "/gpu",
    response_model=GPUInfo,
    summary="Diagnóstico de GPU y aceleración por hardware",
    description="Verifica la presencia de la GPU NVIDIA RTX 4050 y la disponibilidad de soporte CUDA para PyTorch."
)
async def obtener_diagnostico_gpu():
    """Detecta de forma segura el hardware de aceleración gráfica disponible en el entorno."""
    return SistemaService.obtener_diagnostico_gpu()
