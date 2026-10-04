"""
Esquemas Pydantic para la gestión y seguimiento del cultivo o parcela activa.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class CultivoIn(BaseModel):
    """Datos para registrar o actualizar un cultivo."""
    nombre: str = Field(..., min_length=2, max_length=128, description="Nombre del cultivo o parcela (ej. 'Parcela Norte - Maíz Criollo')")
    variedad: Optional[str] = Field(None, max_length=128, description="Variedad o cepa agronómica")
    fecha_inicio: Optional[date] = Field(None, description="Fecha de siembra o inicio de monitoreo")
    ubicacion: Optional[str] = Field(None, max_length=256, description="Ubicación geográfica o cuadrante")
    notas: Optional[str] = Field(None, description="Observaciones agronómicas")
    activo: bool = Field(True, description="Indica si este cultivo es el que está en seguimiento actualmente")


class CultivoOut(BaseModel):
    """Representación de un cultivo en seguimiento."""
    id: str
    nombre: str
    variedad: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    ubicacion: Optional[str] = None
    notas: Optional[str] = None
    activo: bool
    creado_en: datetime
