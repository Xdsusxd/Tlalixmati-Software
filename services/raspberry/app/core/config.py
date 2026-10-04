"""
Configuración del servicio Edge de Raspberry Pi.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field


class ConfiguracionEdge(BaseModel):
    api_url: str = Field(
        default="http://localhost:8000",
        description="URL base del servidor FastAPI"
    )
    puerto_serial: str = Field(
        default="/dev/ttyUSB0",
        description="Puerto serial de comunicación con el ESP32"
    )
    baudrate: int = Field(
        default=115200,
        description="Velocidad en baudios para el enlace serial"
    )
    camara_index: int = Field(
        default=0,
        description="Índice del dispositivo de video para la cámara"
    )
    fps_captura: int = Field(
        default=10,
        description="Cuadros por segundo para la transmisión de video"
    )
    ancho_frame: int = Field(
        default=640,
        description="Ancho en píxeles para el fotograma óptico"
    )
    alto_frame: int = Field(
        default=360,
        description="Alto en píxeles para el fotograma óptico"
    )
    intervalo_sensores_seg: float = Field(
        default=5.0,
        description="Intervalo en segundos entre lecturas de telemetría"
    )


def cargar_configuracion_edge() -> ConfiguracionEdge:
    """Carga configuración desde variables de entorno o archivo .env."""
    # Buscar .env en la raíz o directorio local
    for path in [Path(".env"), Path("../.env"), Path("../../.env")]:
        if path.exists():
            load_dotenv(path)
            break

    return ConfiguracionEdge(
        api_url=os.getenv("API_URL", "http://localhost:8000"),
        puerto_serial=os.getenv("PUERTO_SERIAL", "/dev/ttyUSB0"),
        baudrate=int(os.getenv("BAUDRATE", "115200")),
        camara_index=int(os.getenv("CAMARA_INDEX", "0")),
        fps_captura=int(os.getenv("FPS_CAPTURA", "10")),
        ancho_frame=int(os.getenv("ANCHO_FRAME", "640")),
        alto_frame=int(os.getenv("ALTO_FRAME", "360")),
        intervalo_sensores_seg=float(os.getenv("INTERVALO_SENSORES_SEG", "5.0")),
    )
