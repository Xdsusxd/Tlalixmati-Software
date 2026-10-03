"""
Servicios de negocio de Tlalixmati.
"""

from apps.api.app.services.componente_service import ComponenteService, get_componente_service
from apps.api.app.services.sistema_service import SistemaService
from apps.api.app.services.tlahuicole_service import TlahuicoleService

__all__ = [
    "SistemaService",
    "ComponenteService",
    "get_componente_service",
    "TlahuicoleService",
]
