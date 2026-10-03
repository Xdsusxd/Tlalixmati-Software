"""
Endpoint de verificación de salud de la API (/api/v1/salud).
"""

from fastapi import APIRouter
from apps.api.app.services.componente_service import get_componente_service
from apps.api.app.services.sistema_service import SistemaService
from packages.schemas.sistema import SaludResponse

router = APIRouter(prefix="/salud", tags=["Salud"])


@router.get(
    "",
    response_model=SaludResponse,
    summary="Verificar salud del sistema",
    description="Devuelve el estado operativo de los servicios centrales y subsistemas de Tlalixmati."
)
async def verificar_salud():
    """Comprueba el estado de la API, la carga de configuración y la cantidad de componentes conectados."""
    srv = get_componente_service()
    activos = srv.contar_componentes_activos()
    return SistemaService.verificar_salud(componentes_activos=activos)
