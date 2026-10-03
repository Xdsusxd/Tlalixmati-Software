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
def reiniciar_servicio_componentes():
    """Reinicia el estado en memoria de los componentes antes de cada prueba para aislamiento."""
    srv = get_componente_service()
    srv._registros.clear()
    srv._ultimos_estados.clear()
    yield
    srv._registros.clear()
    srv._ultimos_estados.clear()
