"""
Endpoints para la consulta y registro de componentes físicos reales (/api/v1/componentes).

PRINCIPIO:
- La identidad proviene del hardware real (dirección MAC o número de serie).
- Se prohíben identificadores inventados o nombres como 'tlahuicole-01'.
"""

from typing import List
from fastapi import APIRouter, status
from apps.api.app.core.exceptions import ComponenteNoEncontradoException
from apps.api.app.services.componente_service import get_componente_service
from packages.schemas.componente import (
    ComponenteEstado,
    ComponenteRegistro,
    TipoComponente,
)

router = APIRouter(prefix="/componentes", tags=["Componentes Físicos"])


@router.get(
    "",
    response_model=List[ComponenteEstado],
    summary="Listar componentes físicos",
    description="Devuelve el estado de conexión actual de los componentes que integran el sistema de campo."
)
async def listar_componentes():
    """Retorna la lista de componentes base (ESP32, Raspberry Pi, Cámara) con su estado real."""
    srv = get_componente_service()
    return srv.listar_todos_los_componentes()


@router.get(
    "/{tipo}",
    response_model=ComponenteEstado,
    summary="Consultar estado de un componente específico",
    description="Devuelve el estado operativo de un componente físico según su tipo (esp32, raspberry, camara)."
)
async def obtener_componente(tipo: str):
    """
    Consulta un componente por su tipo. Si el tipo no existe o no es soportado,
    devuelve un error 404 con mensaje explicativo en español.
    """
    try:
        tipo_enum = TipoComponente(tipo.lower())
    except ValueError:
        raise ComponenteNoEncontradoException(tipo_o_id=tipo)

    srv = get_componente_service()
    return srv.obtener_estado_componente(tipo_enum)


@router.post(
    "/registrar",
    response_model=ComponenteEstado,
    status_code=status.HTTP_200_OK,
    summary="Registrar presencia física de un componente",
    description="Permite que un componente real (ESP32 o Raspberry Pi) reporte su presencia física mediante su identificador único de hardware."
)
async def registrar_componente(registro: ComponenteRegistro):
    """
    Procesa un latido de hardware real. Valida que el identificador no sea ficticio
    y actualiza la última marca temporal de comunicación.
    """
    srv = get_componente_service()
    return srv.registrar_latido(registro)
