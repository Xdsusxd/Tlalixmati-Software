"""
Módulo de configuración centralizada de Tlalixmati.

Carga y valida los valores provenientes de:
1. `config/system.yaml` (configuración del sistema, hardware habilitado, puertos)
2. Variables de entorno / archivo `.env`
3. Detección automática del hardware de cómputo local (GPU NVIDIA RTX 4050, CUDA)
"""

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional
import yaml
from pydantic import BaseModel, ConfigDict, Field

from packages.schemas.sistema import GPUInfo


def encontrar_directorio_raiz() -> Path:
    """Localiza de manera determinista la raíz del proyecto tlalixmati."""
    # Camino 1: Variable de entorno explícita
    if "TLALIXMATI_ROOT" in os.environ:
        return Path(os.environ["TLALIXMATI_ROOT"]).resolve()
    
    # Camino 2: Ascender desde la ubicación actual de este archivo
    archivo_actual = Path(__file__).resolve()
    for parent in archivo_actual.parents:
        if (parent / "config" / "system.yaml").exists():
            return parent
            
    # Fallback predeterminado para el workspace actual
    return Path(r"C:\PROYECTS\proyecto\tlalixmati").resolve()


class ProyectoConfig(BaseModel):
    nombre: str = "Tlalixmati"
    version: str = "0.1.0"
    descripcion: str = "Plataforma inteligente de monitoreo agrícola"


class ComponenteHardwareConfig(BaseModel):
    habilitado: bool = False
    modelo: Optional[str] = None
    identificacion: str = "automatico"
    driver: Optional[str] = None


class ServiciosConfig(BaseModel):
    api_puerto: int = 8000
    api_host: str = "0.0.0.0"
    web_puerto: int = 3000


class ConfiguracionSistema(BaseModel):
    """Modelo estructurado con la configuración completa del sistema."""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    raiz_proyecto: Path
    proyecto: ProyectoConfig
    esp32: ComponenteHardwareConfig
    raspberry: ComponenteHardwareConfig
    camara: ComponenteHardwareConfig
    vision: ComponenteHardwareConfig
    comunicacion_protocolo: Optional[str] = None
    servicios: ServiciosConfig
    
    # Variables de entorno operativas
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    database_url: Optional[str] = None
    api_url: str = "http://localhost:8000"
    web_url: str = "http://localhost:3000"
    session_secret: Optional[str] = None
    password_hash: Optional[str] = None


def detectar_gpu_local() -> GPUInfo:
    """
    Detecta de forma segura el hardware de aceleración gráfica disponible en el entorno local.
    Verifica compatibilidad con NVIDIA RTX 4050 y CUDA.
    """
    try:
        import torch
        cuda_disponible = torch.cuda.is_available()
        if cuda_disponible:
            nombre_gpu = torch.cuda.get_device_name(0)
            return GPUInfo(
                detectada=True,
                nombre=nombre_gpu,
                cuda_disponible=True,
                dispositivo_seleccionado="cuda:0"
            )
    except Exception:
        pass

    return GPUInfo(
        detectada=False,
        nombre=None,
        cuda_disponible=False,
        dispositivo_seleccionado="cpu"
    )


@lru_cache()
def get_configuracion() -> ConfiguracionSistema:
    """
    Lee config/system.yaml y las variables de entorno, devolviendo
    una instancia única validada de ConfiguracionSistema.
    """
    raiz = encontrar_directorio_raiz()
    yaml_path = raiz / "config" / "system.yaml"
    
    data_yaml: Dict[str, Any] = {}
    if yaml_path.exists():
        with open(yaml_path, "r", encoding="utf-8") as f:
            data_yaml = yaml.safe_load(f) or {}

    proy_raw = data_yaml.get("proyecto", {})
    esp32_raw = data_yaml.get("esp32", {})
    rpi_raw = data_yaml.get("raspberry", {})
    camara_raw = data_yaml.get("camara", {})
    vision_raw = data_yaml.get("vision", {})
    servicios_raw = data_yaml.get("servicios", {})
    api_srv = servicios_raw.get("api", {})
    web_srv = servicios_raw.get("web", {})

    return ConfiguracionSistema(
        raiz_proyecto=raiz,
        proyecto=ProyectoConfig(
            nombre=proy_raw.get("nombre", "Tlalixmati"),
            version=proy_raw.get("version", "0.1.0"),
            descripcion=proy_raw.get("descripcion", "Plataforma inteligente de monitoreo agrícola"),
        ),
        esp32=ComponenteHardwareConfig(
            habilitado=esp32_raw.get("habilitado", False),
            modelo=esp32_raw.get("modelo"),
            identificacion=esp32_raw.get("identificacion", "automatico"),
        ),
        raspberry=ComponenteHardwareConfig(
            habilitado=rpi_raw.get("habilitada", False),
            modelo=rpi_raw.get("modelo"),
            identificacion=rpi_raw.get("identificacion", "automatico"),
        ),
        camara=ComponenteHardwareConfig(
            habilitado=camara_raw.get("habilitada", False),
            modelo=camara_raw.get("modelo"),
            driver=camara_raw.get("driver"),
        ),
        vision=ComponenteHardwareConfig(
            habilitado=vision_raw.get("habilitada", False),
            modelo=vision_raw.get("modelo"),
        ),
        comunicacion_protocolo=data_yaml.get("comunicacion", {}).get("protocolo"),
        servicios=ServiciosConfig(
            api_puerto=api_srv.get("puerto", 8000),
            api_host=api_srv.get("host", "0.0.0.0"),
            web_puerto=web_srv.get("puerto", 3000),
        ),
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY"),
        database_url=os.getenv("DATABASE_URL"),
        api_url=os.getenv("API_URL", "http://localhost:8000"),
        web_url=os.getenv("WEB_URL", "http://localhost:3000"),
        session_secret=os.getenv("SESSION_SECRET"),
        password_hash=os.getenv("PASSWORD_HASH"),
    )
