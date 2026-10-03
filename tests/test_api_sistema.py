"""
Pruebas para los endpoints de sistema y GPU (/api/v1/sistema).
"""

from fastapi.testclient import TestClient


def test_endpoint_raiz_retorna_informacion_plataforma(cliente: TestClient):
    """Verifica que la raíz '/' retorne metadatos del proyecto y rutas clave."""
    respuesta = cliente.get("/")
    assert respuesta.status_code == 200
    
    data = respuesta.json()
    assert data["plataforma"] == "Tlalixmati"
    assert "version" in data
    assert data["salud"] == "/api/v1/salud"
    assert data["tlahuicole"] == "/api/v1/tlahuicole/estado"


def test_endpoint_sistema_configuracion_refleja_system_yaml(cliente: TestClient):
    """Verifica que /api/v1/sistema/configuracion retorne el estado de system.yaml sin inventar datos."""
    respuesta = cliente.get("/api/v1/sistema/configuracion")
    assert respuesta.status_code == 200
    
    data = respuesta.json()
    assert data["proyecto_nombre"] == "Tlalixmati"
    assert data["esp32_habilitado"] is False
    assert data["raspberry_habilitada"] is False
    assert data["camara_habilitada"] is False
    assert data["vision_habilitada"] is False


def test_endpoint_sistema_gpu_diagnostico(cliente: TestClient):
    """Verifica que /api/v1/sistema/gpu reporte la presencia de la GPU y soporte CUDA."""
    respuesta = cliente.get("/api/v1/sistema/gpu")
    assert respuesta.status_code == 200
    
    data = respuesta.json()
    assert "detectada" in data
    assert "cuda_disponible" in data
    assert "dispositivo_seleccionado" in data
    if data["cuda_disponible"]:
        assert "RTX 4050" in data["nombre"] or "NVIDIA" in data["nombre"]
