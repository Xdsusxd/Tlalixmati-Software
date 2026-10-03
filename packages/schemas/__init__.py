"""
Exportación de esquemas comunes de Tlalixmati.
"""

from packages.schemas.componente import (
    ComponenteEstado,
    ComponenteIdentidad,
    ComponenteRegistro,
    EstadoConexion,
    TipoComponente,
)
from packages.schemas.error import DetalleError, ErrorResponse
from packages.schemas.sistema import GPUInfo, SaludResponse, SistemaConfiguracionResumen
from packages.schemas.tlahuicole import TlahuicoleEstado

__all__ = [
    "TipoComponente",
    "EstadoConexion",
    "ComponenteIdentidad",
    "ComponenteRegistro",
    "ComponenteEstado",
    "TlahuicoleEstado",
    "GPUInfo",
    "SaludResponse",
    "SistemaConfiguracionResumen",
    "DetalleError",
    "ErrorResponse",
]
