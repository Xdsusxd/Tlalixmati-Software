"""
Pruebas para el endpoint de salud de la API (/api/v1/salud).
"""

from fastapi.testclient import TestClient


def test_endpoint_salud_retorna_200_y_estructura_valida(cliente: TestClient):
    """Verifica que /api/v1/salud responda exitosamente con los campos requeridos."""
    respuesta = cliente.get("/api/v1/salud")
    assert respuesta.status_code == 200
    
    data = respuesta.json()
    assert data["estado"] == "ok"
    assert "timestamp" in data
    assert "version" in data
    assert "servicios" in data
    assert data["servicios"]["api"] == "operativo"
    assert data["componentes_activos"] == 0
