"""
Esquema Pydantic para el estado derivado de Tlahuicole.

PRINCIPIOS CRÍTICOS:
- Tlahuicole NO es un dispositivo físico individual.
- Tlahuicole NO tiene un identificador de hardware propio ni device_id.
- Tlahuicole es la agrupación lógica de ESP32 + Raspberry Pi + periféricos en campo.
- Su estado se CALCULA Y DERIVA en tiempo de ejecución a partir del estado de sus componentes reales.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from packages.schemas.componente import ComponenteEstado, EstadoConexion


class TlahuicoleEstado(BaseModel):
    """
    Vista agregada e integrada del sistema de campo Tlahuicole.
    Representa el estado operativo derivado de sus componentes reales.
    """
    nombre: str = Field(
        default="Tlahuicole",
        description="Nombre conceptual de la unidad física de campo"
    )
    naturaleza: str = Field(
        default="Agrupación lógica de componentes de campo (ESP32 + Raspberry Pi)",
        description="Aclaración explícita de que no constituye una entidad de dispositivo separada"
    )
    estado_general: EstadoConexion = Field(
        ...,
        description="Estado calculado en base a la disponibilidad de sus componentes principales"
    )
    esp32: ComponenteEstado = Field(
        ...,
        description="Estado actual del microcontrolador ESP32 real"
    )
    raspberry: ComponenteEstado = Field(
        ...,
        description="Estado actual de la computadora edge Raspberry Pi real"
    )
    camara: ComponenteEstado = Field(
        ...,
        description="Estado actual del módulo de captura de imagen"
    )
    sensores: str = Field(
        default="Sin datos",
        description="Estado de telemetría sensorial: siempre 'Sin datos' si no hay lecturas físicas reales"
    )
    analisis: str = Field(
        default="Sin resultados",
        description="Estado del análisis de visión: siempre 'Sin resultados' si no hay inferencia de imágenes reales"
    )
    perifericos_adicionales: List[ComponenteEstado] = Field(
        default_factory=list,
        description="Lista de periféricos futuros conectados a la unidad"
    )
    resumen_operativo: str = Field(
        ...,
        description="Diagnóstico textual del estado conjunto de la unidad"
    )
