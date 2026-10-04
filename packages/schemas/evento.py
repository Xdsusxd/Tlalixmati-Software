"""
Esquemas Pydantic para la bitácora de eventos y auditoría de campo.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class NivelEvento(str, Enum):
    INFO = "info"
    AVISO = "aviso"
    ERROR = "error"
    CRITICO = "critico"


class EventoIn(BaseModel):
    """Registro de nuevo suceso en la bitácora."""
    nivel: NivelEvento = Field(default=NivelEvento.INFO, description="Severidad del suceso")
    origen: str = Field(..., min_length=2, max_length=64, description="Módulo u origen del suceso (ej. VISION_IA, ESP32_UART, API)")
    mensaje: str = Field(..., min_length=3, max_length=1000, description="Descripción del suceso")
    detalles: Dict[str, Any] = Field(default_factory=dict, description="Metadatos contextuales en formato JSON")
    componente_id: Optional[str] = Field(None, description="UUID o ID de hardware del componente asociado")


class EventoOut(BaseModel):
    """Representación pública de un suceso en la bitácora."""
    id: str
    nivel: str
    origen: str
    mensaje: str
    detalles: Dict[str, Any]
    creado_en: datetime
