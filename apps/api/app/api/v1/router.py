"""
Enrutador principal de la API Versión 1 (/api/v1).
"""

from fastapi import APIRouter
from apps.api.app.api.v1.endpoints import (
    componentes,
    salud,
    sistema,
    tlahuicole,
)

api_v1_router = APIRouter(prefix="/api/v1")

# Inclusión de submódulos
api_v1_router.include_router(salud.router)
api_v1_router.include_router(sistema.router)
api_v1_router.include_router(componentes.router)
api_v1_router.include_router(tlahuicole.router)
