"""
Esquemas Pydantic para la identidad y estado de los componentes físicos en Tlalixmati.

Reglas del sistema:
- La identidad proviene del hardware real (dirección MAC de ESP32, número de serie de CPU de Raspberry Pi).
- No se inventan componentes, identificadores ni estados ficticios.
- Si un componente no está conectado, su estado refleja explícitamente: 'Componente no conectado'.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TipoComponente(str, Enum):
    """Tipos válidos de componentes dentro de la arquitectura física."""
    ESP32 = "esp32"
    RASPBERRY = "raspberry"
    CAMARA = "camara"
    VISION = "vision"
    PERIFERICO = "periferico"


class EstadoConexion(str, Enum):
    """
    Estados posibles de conexión física.
    Siguen estrictamente las etiquetas textuales requeridas por las directivas del sistema.
    """
    SIN_DATOS = "Sin datos"
    NO_CONFIGURADO = "Componente no configurado"
    NO_CONECTADO = "Componente no conectado"
    CONECTADO = "Conectado"
    ERROR = "Error"


class ComponenteIdentidad(BaseModel):
    """
    Representa la identidad física real de un dispositivo reportada por sí mismo.
    Nunca se inventan identificadores como 'tlahuicole-01'.
    """
    model_config = ConfigDict(frozen=True)

    tipo: TipoComponente = Field(
        ...,
        description="Tipo de componente físico (esp32, raspberry, etc.)"
    )
    identificador_hardware: str = Field(
        ...,
        min_length=4,
        max_length=128,
        description="Identificador único real provisto por el hardware (e.g., MAC address, CPU Serial, UUID de placa)"
    )
    modelo: Optional[str] = Field(
        default=None,
        description="Modelo físico específico reportado o validado (e.g., 'ESP32-WROOM-32D', 'Raspberry Pi 4 Model B')"
    )
    version_firmware: Optional[str] = Field(
        default=None,
        description="Versión del software o firmware en ejecución en el dispositivo real"
    )


class ComponenteRegistro(BaseModel):
    """
    Payload recibido cuando un componente real envía un latido (heartbeat)
    o solicitud de registro automático a la API.
    """
    identidad: ComponenteIdentidad
    ip_local: Optional[str] = Field(
        default=None,
        description="Dirección IP asignada en la red local de campo"
    )
    metadata_adicional: Optional[dict] = Field(
        default=None,
        description="Información de diagnóstico reportada por el dispositivo"
    )


class ComponenteEstado(BaseModel):
    """
    Representación del estado actual de un componente individual.
    """
    tipo: TipoComponente
    identificador_hardware: Optional[str] = Field(
        default=None,
        description="Identificador real si el componente está registrado, de lo contrario None"
    )
    habilitado: bool = Field(
        default=False,
        description="Indica si el componente está habilitado en config/system.yaml"
    )
    estado: EstadoConexion = Field(
        default=EstadoConexion.NO_CONECTADO,
        description="Estado de conexión actual del componente"
    )
    ultima_comunicacion: Optional[datetime] = Field(
        default=None,
        description="Marca temporal UTC del último latido o dato recibido del hardware"
    )
    mensaje: str = Field(
        default="Componente no conectado",
        description="Mensaje descriptivo para el usuario o dashboard"
    )
