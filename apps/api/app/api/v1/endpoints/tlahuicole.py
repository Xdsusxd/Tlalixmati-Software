"""
Endpoint para la consulta del estado unificado de Tlahuicole (/api/v1/tlahuicole).

PRINCIPIO FUNDAMENTAL:
- Tlahuicole NO es una entidad de dispositivo independiente ni tiene tabla propia.
- No duplica la identidad del ESP32 o Raspberry Pi.
- Su estado se deriva dinámicamente de sus componentes en tiempo de ejecución.
"""

from fastapi import APIRouter
from apps.api.app.services.tlahuicole_service import TlahuicoleService
from packages.schemas.tlahuicole import TlahuicoleEstado

router = APIRouter(prefix="/tlahuicole", tags=["Tlahuicole (Unidad Física)"])


@router.get(
    "/estado",
    response_model=TlahuicoleEstado,
    summary="Consultar estado unificado de Tlahuicole",
    description="Devuelve el estado de la unidad física de campo derivado de sus componentes reales (ESP32 + Raspberry Pi). "
                "Tlahuicole no es una entidad separada ni posee un identificador inventado."
)
async def obtener_estado_tlahuicole():
    """
    Retorna la vista agregada del sistema de campo.
    Si ningún componente físico está conectado, muestra 'Componente no conectado', 'Sin datos' y 'Sin resultados'.
    """
    return TlahuicoleService.obtener_estado_agregado()
