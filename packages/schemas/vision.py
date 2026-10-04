"""
Esquemas Pydantic para el subsistema de visión artificial e inferencia de IA.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class VisionDiagnosticoIn(BaseModel):
    """Diagnóstico vegetal remitido por el daemon u orquestador de visión."""
    clase: str = Field(..., min_length=2, max_length=64, description="Clase foliar diagnosticada (ej. SANO, CLOROSIS, ESTRES_HIDRICO, NECROSIS)")
    confianza: float = Field(..., ge=0.0, le=1.0, description="Nivel de certeza de la inferencia (0.0 a 1.0)")
    es_anomalia: bool = Field(False, description="Indica si se diagnosticó una patología o estrés")
    indice_anomalia: float = Field(0.0, ge=0.0, le=1.0, description="Índice numérico de severidad foliar")
    conteo_especimenes: int = Field(0, ge=0, description="Número de plantas u órganos detectados en el encuadre")
    dispositivo: Optional[str] = Field("cuda:0", description="Dispositivo de cómputo donde corrió la inferencia")
    duracion_ms: Optional[int] = Field(None, ge=0, description="Tiempo de inferencia en milisegundos")
    detalles: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadatos espectrales (ExG, clorosis, necrosis)")


class VisionEstadoOut(BaseModel):
    """Estado operativo actual del análisis de visión computacional."""
    activo: bool = Field(False, description="Indica si se han recibido inferencias en la ventana reciente")
    clase_actual: Optional[str] = Field(None, description="Última clase diagnóstica detectada")
    confianza: Optional[float] = Field(None, description="Certeza de la última inferencia")
    es_anomalia: bool = Field(False, description="Indica si el estado actual es anómalo")
    indice_anomalia: Optional[float] = Field(None, description="Severidad del estrés")
    conteo_especimenes: Optional[int] = Field(None, description="Cantidad de especímenes visibles")
    dispositivo: Optional[str] = Field(None, description="Dispositivo de cómputo (GPU/CPU)")
    ultima_inferencia: Optional[datetime] = Field(None, description="Marca temporal de la última inferencia recibida")
    resumen_diagnostico: str = Field("Sin resultados", description="Resumen agronómico legible")
