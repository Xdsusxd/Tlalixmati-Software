"""
Endpoints para la gestión y seguimiento del cultivo activo (/api/v1/cultivos).
"""

from typing import Optional
from fastapi import APIRouter, status
from apps.api.app.services.cultivo_service import get_cultivo_service
from packages.schemas.cultivo import CultivoIn, CultivoOut

router = APIRouter(prefix="/cultivos", tags=["Cultivos y Parcelas"])


@router.get(
    "/activo",
    response_model=Optional[CultivoOut],
    summary="Obtener el cultivo o parcela actualmente activa",
    description="Retorna la información del lote o cultivo que está siendo monitoreado por Tlalixmati."
)
async def obtener_cultivo_activo():
    """Consulta los datos del cultivo en seguimiento activo."""
    srv = get_cultivo_service()
    return srv.obtener_cultivo_activo()


@router.post(
    "",
    response_model=CultivoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar o establecer un cultivo activo",
    description="Registra un nuevo cultivo y lo define como el lote en monitoreo actual."
)
async def registrar_cultivo(datos: CultivoIn):
    """Registra y activa un nuevo cultivo para la unidad de campo."""
    srv = get_cultivo_service()
    return srv.registrar_o_actualizar_cultivo(datos)
