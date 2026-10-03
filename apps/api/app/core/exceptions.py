"""
Jerarquía de excepciones personalizadas para el backend de Tlalixmati.

Todas las excepciones del dominio heredan de TlalixmatiException y definen
un código de error estándar y un mensaje en español.
"""

from typing import Any, Optional


class TlalixmatiException(Exception):
    """Excepción base del sistema."""
    def __init__(
        self,
        mensaje: str,
        codigo: str = "ERROR_INTERNO_SISTEMA",
        status_code: int = 500,
        detalles: Optional[Any] = None
    ):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.codigo = codigo
        self.status_code = status_code
        self.detalles = detalles


class ComponenteNoEncontradoException(TlalixmatiException):
    """Se lanza cuando se consulta un componente que no está registrado o conectado."""
    def __init__(self, tipo_o_id: str):
        super().__init__(
            mensaje=f"Componente físico '{tipo_o_id}' no encontrado o no conectado al sistema.",
            codigo="COMPONENTE_NO_CONECTADO",
            status_code=404,
            detalles={"identificador": tipo_o_id}
        )


class IdentificadorInvalidoException(TlalixmatiException):
    """Se lanza si se intenta registrar un componente con un identificador no válido."""
    def __init__(self, identificador: str, motivo: str):
        super().__init__(
            mensaje=f"El identificador físico '{identificador}' no es válido: {motivo}.",
            codigo="IDENTIFICADOR_INVALIDO",
            status_code=400,
            detalles={"identificador": identificador, "motivo": motivo}
        )


class ConfiguracionInvalidaException(TlalixmatiException):
    """Se lanza cuando existe una inconsistencia o fallo al leer config/system.yaml."""
    def __init__(self, detalle: str):
        super().__init__(
            mensaje=f"Error en la configuración global del sistema: {detalle}",
            codigo="CONFIGURACION_INVALIDA",
            status_code=500,
            detalles={"detalle": detalle}
        )


class HardwareNoConectadoException(TlalixmatiException):
    """Se lanza cuando una acción requiere hardware físico real y este no está presente."""
    def __init__(self, componente: str, accion: str):
        super().__init__(
            mensaje=f"No es posible ejecutar '{accion}': el componente '{componente}' no está conectado.",
            codigo="HARDWARE_NO_CONECTADO",
            status_code=503,
            detalles={"componente": componente, "accion": accion}
        )
