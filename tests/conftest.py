"""
Configuración común y fixtures para pytest en Tlalixmati.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Asegurar que la raíz del proyecto esté en sys.path para resolución de módulos
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from apps.api.app.main import app
from apps.api.app.services.componente_service import ComponenteService, get_componente_service


@pytest.fixture
def cliente() -> TestClient:
    """Fixture que provee un cliente de pruebas síncrono para FastAPI."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def reiniciar_servicios_aislamiento():
    """Reinicia el estado en memoria de los servicios antes y después de cada prueba para aislamiento total."""
    from apps.api.app.services.componente_service import get_componente_service
    from apps.api.app.services.telemetria_service import get_telemetria_service
    from apps.api.app.services.evento_service import get_evento_service
    from apps.api.app.services.cultivo_service import get_cultivo_service
    from apps.api.app.services.vision_service import get_vision_service

    def _reset():
        comp_srv = get_componente_service()
        comp_srv._registros.clear()
        comp_srv._ultimos_estados.clear()

        telem_srv = get_telemetria_service()
        telem_srv._ultima_lectura = None
        telem_srv._ultima_marca = None

        ev_srv = get_evento_service()
        ev_srv._eventos_memoria.clear()

        cul_srv = get_cultivo_service()
        cul_srv._cultivo_activo_memoria = None

        vis_srv = get_vision_service()
        vis_srv._ultimo_diagnostico = None
        vis_srv._ultima_marca = None

    _reset()
    yield
    _reset()


