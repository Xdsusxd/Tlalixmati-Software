"""
Punto de entrada principal de la aplicación FastAPI para Tlalixmati API.

Configura:
- Ciclo de vida (lifespan)
- Middleware de CORS
- Manejadores globales de errores uniformes
- Enrutador de API v1
- Documentación OpenAPI en español
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from apps.api.app.api.v1.router import api_v1_router
from apps.api.app.core.config import detectar_gpu_local, get_configuracion
from apps.api.app.core.exceptions import TlalixmatiException
from apps.api.app.core.handlers import (
    generic_exception_handler,
    http_exception_handler,
    tlalixmati_exception_handler,
    validation_exception_handler,
)

# Configuración básica de logging en español
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("tlalixmati.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestor de eventos de inicio y apagado del servidor API."""
    cfg = get_configuracion()
    logger.info("Iniciando Tlalixmati API versión %s...", cfg.proyecto.version)
    
    # Diagnóstico del entorno de cómputo en el arranque
    gpu = detectar_gpu_local()
    if gpu.cuda_disponible:
        logger.info("Aceleración GPU activa: %s (CUDA disponible)", gpu.nombre)
    else:
        logger.info("Modo de ejecución en CPU (sin aceleración CUDA activa)")
        
    logger.info("Configuración cargada desde: %s/config/system.yaml", cfg.raiz_proyecto)
    
    yield
    
    logger.info("Apagando Tlalixmati API de forma segura.")


def crear_app() -> FastAPI:
    """Fábrica de la aplicación FastAPI."""
    cfg = get_configuracion()

    aplicacion = FastAPI(
        title=f"{cfg.proyecto.nombre} API",
        description=(
            "API central de la plataforma inteligente de monitoreo agrícola Tlalixmati "
            "y del sistema de campo Tlahuicole."
        ),
        version=cfg.proyecto.version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configuración de CORS segura
    origenes_permitidos = [
        cfg.web_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    aplicacion.add_middleware(
        CORSMiddleware,
        allow_origins=origenes_permitidos,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Registro de manejadores globales de excepciones
    aplicacion.add_exception_handler(TlalixmatiException, tlalixmati_exception_handler)
    aplicacion.add_exception_handler(RequestValidationError, validation_exception_handler)
    aplicacion.add_exception_handler(StarletteHTTPException, http_exception_handler)
    aplicacion.add_exception_handler(Exception, generic_exception_handler)

    # Enrutadores
    aplicacion.include_router(api_v1_router)

    @aplicacion.get("/", tags=["General"])
    async def ruta_raiz():
        """Ruta raíz informativa con accesos directos a documentación y estado."""
        return {
            "plataforma": cfg.proyecto.nombre,
            "version": cfg.proyecto.version,
            "descripcion": cfg.proyecto.descripcion,
            "documentacion": "/docs",
            "salud": "/api/v1/salud",
            "tlahuicole": "/api/v1/tlahuicole/estado"
        }

    return aplicacion


# Instancia para servidores ASGI (uvicorn apps.api.app.main:app)
app = crear_app()
