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
from packages.schemas.telemetria import (
    TelemetriaLecturaIn,
    TelemetriaActualOut,
    PuntoHistorialOut,
    HistorialTelemetriaResponse,
)
from packages.schemas.evento import NivelEvento, EventoIn, EventoOut
from packages.schemas.cultivo import CultivoIn, CultivoOut

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
    "TelemetriaLecturaIn",
    "TelemetriaActualOut",
    "PuntoHistorialOut",
    "HistorialTelemetriaResponse",
    "NivelEvento",
    "EventoIn",
    "EventoOut",
    "CultivoIn",
    "CultivoOut",
]

