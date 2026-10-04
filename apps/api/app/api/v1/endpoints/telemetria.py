"""
Endpoints para la adquisición y consulta de telemetría sensorial de campo (/api/v1/telemetria).

PRINCIPIOS:
- Recibe mediciones capturadas por el ESP32 y transmitidas por la Raspberry Pi.
- Cero datos inventados: si los sensores están desconectados, se refleja 'Sin datos' y valores en null.
"""

from typing import Optional
from fastapi import APIRouter, Query, status
from apps.api.app.services.telemetria_service import get_telemetria_service
from packages.schemas.telemetria import (
    HistorialTelemetriaResponse,
    TelemetriaActualOut,
    TelemetriaLecturaIn,
)

router = APIRouter(prefix="/telemetria", tags=["Telemetría de Sensores"])


@router.post(
    "/recibir",
    response_model=TelemetriaActualOut,
    status_code=status.HTTP_200_OK,
    summary="Recibir trama de telemetría de sensores desde Edge/ESP32",
    description="Permite que el enlace Edge de la Raspberry Pi envíe las lecturas leídas del ESP32 a la plataforma."
)
async def recibir_telemetria(datos: TelemetriaLecturaIn):
    """Procesa e ingesta una lectura de telemetría proveniente del hardware físico de campo."""
    srv = get_telemetria_service()
    return srv.registrar_lectura(datos)


@router.get(
    "/actual",
    response_model=TelemetriaActualOut,
    summary="Obtener las condiciones sensoriales actuales",
    description="Retorna las lecturas más recientes de humedad de suelo, temperatura, radiación y batería. "
                "Retorna null y 'Sin datos' si no hay hardware transmitiendo activamente."
)
async def obtener_telemetria_actual():
    """Consulta el estado sensorial más reciente del cultivo."""
    srv = get_telemetria_service()
    return srv.obtener_actual()


@router.get(
    "/historial",
    response_model=HistorialTelemetriaResponse,
    summary="Obtener historial de mediciones de sensores",
    description="Retorna las mediciones históricas reales registradas en base de datos en las últimas N horas. "
                "Retorna lista vacía si aún no existen lecturas de sensores físicos."
)
async def obtener_historial_telemetria(
    horas: int = Query(24, ge=1, le=168, description="Número de horas retrospectivas a consultar (1 a 168)")
):
    """Consulta el histórico de mediciones reales para graficación agronómica."""
    srv = get_telemetria_service()
    return srv.obtener_historial(horas=horas)
