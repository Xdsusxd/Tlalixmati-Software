"""
Configuración del servicio Edge de Raspberry Pi.
"""

import os
from pathlib import Path
from typing import Optional
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
    fps_captura: Optional[int] = Field(
        default=None,
        description="Cuadros por segundo deseados. Si es None o 0, el capturador autodetecta y utiliza la tasa máxima soportada por el sensor."
    )
    ancho_frame: Optional[int] = Field(
        default=None,
        description="Ancho en píxeles. Si es None o 0, el capturador negocia la resolución máxima soportada por el hardware."
    )
    alto_frame: Optional[int] = Field(
        default=None,
        description="Alto en píxeles. Si es None o 0, el capturador negocia la resolución máxima soportada por el hardware."
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

    fps_env = os.getenv("FPS_CAPTURA")
    ancho_env = os.getenv("ANCHO_FRAME")
    alto_env = os.getenv("ALTO_FRAME")

    return ConfiguracionEdge(
        api_url=os.getenv("API_URL", "http://localhost:8000"),
        puerto_serial=os.getenv("PUERTO_SERIAL", "/dev/ttyUSB0"),
        baudrate=int(os.getenv("BAUDRATE", "115200")),
        camara_index=int(os.getenv("CAMARA_INDEX", "0")),
        fps_captura=int(fps_env) if fps_env and fps_env.isdigit() and int(fps_env) > 0 else None,
        ancho_frame=int(ancho_env) if ancho_env and ancho_env.isdigit() and int(ancho_env) > 0 else None,
        alto_frame=int(alto_env) if alto_env and alto_env.isdigit() and int(alto_env) > 0 else None,
        intervalo_sensores_seg=float(os.getenv("INTERVALO_SENSORES_SEG", "5.0")),
    )
