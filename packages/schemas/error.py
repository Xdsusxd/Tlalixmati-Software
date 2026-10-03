"""
Esquemas Pydantic para el manejo uniforme de errores de la API.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class DetalleError(BaseModel):
    """Estructura interna del detalle de un error."""
    codigo: str = Field(..., description="Código nemotécnico del error (e.g. COMPONENTE_NO_CONECTADO)")
    mensaje: str = Field(..., description="Descripción legible del problema en español")
    detalles: Optional[Any] = Field(default=None, description="Información técnica complementaria o errores de validación")


class ErrorResponse(BaseModel):
    """Envoltura uniforme para todas las respuestas con código HTTP >= 400."""
    error: DetalleError
