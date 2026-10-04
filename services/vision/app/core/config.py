"""
Configuración del servicio de Visión Artificial e Inteligencia Artificial.
"""

import os
from pathlib import Path
import torch
from pydantic import BaseModel, Field


class ConfiguracionVision(BaseModel):
    api_url: str = Field(
        default="http://localhost:8000",
        description="URL base del servidor FastAPI de Tlalixmati"
    )
    dispositivo: str = Field(
        default="cuda:0" if torch.cuda.is_available() else "cpu",
        description="Dispositivo de aceleración para inferencia y entrenamiento (GPU o CPU)"
    )
    umbral_confianza_yolo: float = Field(
        default=0.35,
        description="Umbral mínimo de confianza para detección de especímenes vegetales"
    )
    umbral_anomalia_alerta: float = Field(
        default=0.60,
        description="Umbral de severidad a partir del cual se dispara automáticamente el informe PDF"
    )
    cooldown_alerta_seg: int = Field(
        default=180,
        description="Tiempo mínimo en segundos entre disparos automáticos consecutivos de alerta"
    )
    directorio_dataset: str = Field(
        default="services/vision/dataset",
        description="Ruta donde se organizan las imágenes del cultivo para entrenamiento"
    )
    ruta_pesos_yolo: str = Field(
        default="services/vision/pesos/yolov8_cultivo.pt",
        description="Ruta de los pesos del modelo YOLOv8"
    )
    ruta_pesos_pytorch: str = Field(
        default="services/vision/pesos/clasificador_estres.pt",
        description="Ruta de los pesos de la red convolucional PyTorch"
    )


def cargar_configuracion_vision() -> ConfiguracionVision:
    """Carga configuración con variables de entorno o valores por defecto."""
    dispositivo_env = os.getenv("VISION_DEVICE")
    if not dispositivo_env:
        dispositivo_env = "cuda:0" if torch.cuda.is_available() else "cpu"

    return ConfiguracionVision(
        api_url=os.getenv("API_URL", "http://localhost:8000"),
        dispositivo=dispositivo_env,
        umbral_confianza_yolo=float(os.getenv("UMBRAL_CONFIANZA_YOLO", "0.35")),
        umbral_anomalia_alerta=float(os.getenv("UMBRAL_ANOMALIA_ALERTA", "0.60")),
        cooldown_alerta_seg=int(os.getenv("COOLDOWN_ALERTA_SEG", "180")),
        directorio_dataset=os.getenv("DIRECTORIO_DATASET", "services/vision/dataset"),
        ruta_pesos_yolo=os.getenv("RUTA_PESOS_YOLO", "services/vision/pesos/yolov8_cultivo.pt"),
        ruta_pesos_pytorch=os.getenv("RUTA_PESOS_PYTORCH", "services/vision/pesos/clasificador_estres.pt"),
    )
