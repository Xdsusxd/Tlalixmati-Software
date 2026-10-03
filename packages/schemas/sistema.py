"""
Esquemas Pydantic para el estado general del sistema, configuración y diagnóstico de hardware de cómputo.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class GPUInfo(BaseModel):
    """Diagnóstico de la GPU física en el equipo de desarrollo."""
    detectada: bool = Field(..., description="Indica si se detectó una GPU compatible")
    nombre: Optional[str] = Field(default=None, description="Modelo de la GPU reportada por el sistema")
    cuda_disponible: bool = Field(..., description="Indica si CUDA está habilitado para PyTorch")
    dispositivo_seleccionado: str = Field(..., description="'cuda:0' si hay GPU disponible, 'cpu' en caso contrario")


class SaludResponse(BaseModel):
    """Respuesta del endpoint de verificación de salud (/salud)."""
    estado: str = Field(default="ok", description="Estado global del servicio API")
    timestamp: datetime = Field(..., description="Marca temporal UTC de la verificación")
    version: str = Field(..., description="Versión actual de Tlalixmati")
    servicios: Dict[str, str] = Field(..., description="Estado de cada subsistema")
    componentes_activos: int = Field(default=0, description="Cantidad de componentes físicos reales conectados")


class SistemaConfiguracionResumen(BaseModel):
    """Resumen de la configuración del sistema leída desde config/system.yaml."""
    proyecto_nombre: str
    proyecto_version: str
    esp32_habilitado: bool
    raspberry_habilitada: bool
    camara_habilitada: bool
    vision_habilitada: bool
    protocolo_comunicacion: Optional[str] = None
