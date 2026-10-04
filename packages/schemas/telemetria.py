"""
Esquemas Pydantic para telemetría sensorial de campo (suelo, ambiente, batería).
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class TelemetriaLecturaIn(BaseModel):
    """Payload de telemetría enviado desde la Raspberry Pi (capturado por el ESP32)."""
    mac: str = Field(..., min_length=4, max_length=64, description="Dirección MAC o identificador de hardware del microcontrolador emisor")
    humedad_suelo: Optional[float] = Field(None, ge=0.0, le=100.0, description="Humedad relativa del suelo en porcentaje (%)")
    temperatura: Optional[float] = Field(None, ge=-40.0, le=85.0, description="Temperatura ambiente o de suelo en grados Celsius (°C)")
    radiacion: Optional[float] = Field(None, ge=0.0, description="Nivel de radiación lumínica solar en lux")
    bateria: Optional[float] = Field(None, ge=0.0, le=30.0, description="Voltaje de alimentación de la batería de campo en voltios (V)")
    timestamp: Optional[datetime] = Field(None, description="Marca de tiempo de la lectura")


class TelemetriaActualOut(BaseModel):
    """Estado sensorial actual del cultivo."""
    conectado: bool = Field(False, description="Indica si se han recibido lecturas de sensores activas recientemente")
    mac: Optional[str] = Field(None, description="Identificador del microcontrolador emisor")
    humedad_suelo: Optional[float] = Field(None, description="Porcentaje de humedad de suelo actual")
    temperatura: Optional[float] = Field(None, description="Temperatura actual en °C")
    radiacion: Optional[float] = Field(None, description="Radiación solar actual en lux")
    bateria: Optional[float] = Field(None, description="Voltaje actual de batería en V")
    ultima_lectura: Optional[datetime] = Field(None, description="Marca de tiempo de la última lectura recibida")
    resumen_sensores: str = Field("Sin datos", description="Resumen legible de las condiciones actuales")


class PuntoHistorialOut(BaseModel):
    """Punto temporal en el historial de mediciones de campo."""
    fecha_hora: str = Field(..., description="Marca temporal formateada (HH:MM o DD/MM HH:MM)")
    humedad_suelo: Optional[float] = Field(None, description="Humedad en %")
    temperatura: Optional[float] = Field(None, description="Temperatura en °C")
    radiacion: Optional[float] = Field(None, description="Radiación en lux")
    bateria: Optional[float] = Field(None, description="Voltaje en V")


class HistorialTelemetriaResponse(BaseModel):
    """Colección histórica de lecturas de campo."""
    total_puntos: int
    puntos: List[PuntoHistorialOut]
