"""
Endpoints para la adquisición y consulta de inferencias del pipeline de visión e IA (/api/v1/vision).
"""

from fastapi import APIRouter, status
from apps.api.app.services.vision_service import get_vision_service
from packages.schemas.vision import VisionDiagnosticoIn, VisionEstadoOut

router = APIRouter(prefix="/vision", tags=["Visión Artificial e IA"])


@router.post(
    "/diagnostico",
    response_model=VisionEstadoOut,
    status_code=status.HTTP_200_OK,
    summary="Registrar inferencia de visión computacional desde GPU",
    description="Permite al daemon u orquestador de IA remitir el diagnóstico foliar, grado de estrés y conteo vegetal."
)
async def registrar_diagnostico_vision(datos: VisionDiagnosticoIn):
    """Procesa e ingesta una inferencia de modelos YOLOv8 y PyTorch."""
    srv = get_vision_service()
    return srv.registrar_diagnostico(datos)


@router.get(
    "/estado",
    response_model=VisionEstadoOut,
    summary="Consultar el estado de inferencia y diagnóstico vegetal actual",
    description="Retorna el último diagnóstico foliar, certeza del modelo, presencia de anomalías y dispositivo de cómputo."
)
async def obtener_estado_vision():
    """Retorna el diagnóstico óptico activo."""
    srv = get_vision_service()
    return srv.obtener_estado()
