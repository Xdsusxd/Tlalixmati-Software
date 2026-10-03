"""
Núcleo del backend de Tlalixmati: configuración, excepciones y manejadores.
"""

from apps.api.app.core.config import ConfiguracionSistema, detectar_gpu_local, get_configuracion
from apps.api.app.core.exceptions import (
    ComponenteNoEncontradoException,
    ConfiguracionInvalidaException,
    HardwareNoConectadoException,
    IdentificadorInvalidoException,
    TlalixmatiException,
)

__all__ = [
    "get_configuracion",
    "ConfiguracionSistema",
    "detectar_gpu_local",
    "TlalixmatiException",
    "ComponenteNoEncontradoException",
    "IdentificadorInvalidoException",
    "ConfiguracionInvalidaException",
    "HardwareNoConectadoException",
]
