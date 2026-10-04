"""
Endpoints para la bitácora de eventos y auditoría agronómica (/api/v1/eventos).
"""

from typing import List, Optional
from fastapi import APIRouter, Query, status
from apps.api.app.services.evento_service import get_evento_service
from packages.schemas.evento import EventoIn, EventoOut

router = APIRouter(prefix="/eventos", tags=["Bitácora de Eventos y Alertas"])


@router.get(
    "",
    response_model=List[EventoOut],
    summary="Listar sucesos recientes de la bitácora de campo",
    description="Retorna el historial de eventos del sistema, alertas fitosanitarias de IA y conexiones de hardware."
)
async def listar_eventos(
    limite: int = Query(30, ge=1, le=100, description="Cantidad máxima de eventos a recuperar"),
    nivel: Optional[str] = Query(None, description="Filtrar por severidad ('info', 'aviso', 'error', 'critico')")
):
    """Consulta la bitácora de sucesos recientes."""
    srv = get_evento_service()
    return srv.listar_eventos(limite=limite, nivel=nivel)


@router.post(
    "",
    response_model=EventoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo evento en la bitácora",
    description="Permite a los componentes registrar eventos operativos o de auditoría."
)
async def crear_evento(datos: EventoIn):
    """Registra manualmente o mediante servicio un nuevo suceso."""
    srv = get_evento_service()
    return srv.registrar_evento(
        nivel=datos.nivel.value if hasattr(datos.nivel, "value") else str(datos.nivel),
        origen=datos.origen,
        mensaje=datos.mensaje,
        detalles=datos.detalles,
        componente_id=datos.componente_id,
    )
