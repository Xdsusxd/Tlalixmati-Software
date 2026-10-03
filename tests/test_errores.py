"""
Pruebas para el sistema de manejo uniforme de errores de la API.
"""

from fastapi.testclient import TestClient


def test_error_404_ruta_no_encontrada_formato_uniforme(cliente: TestClient):
    """Verifica que una ruta inexistente retorne el formato estándar ErrorResponse en español."""
    respuesta = cliente.get("/ruta_completamente_inexistente")
    assert respuesta.status_code == 404
    
    data = respuesta.json()
    assert "error" in data
    assert data["error"]["codigo"] == "RUTA_NO_ENCONTRADA"
    assert "no existe en la API de Tlalixmati" in data["error"]["mensaje"]


def test_error_422_validacion_payload_invalido_formato_uniforme(cliente: TestClient):
    """Verifica que un payload inválido dispare el manejador de validación 422 con detalles estructurados."""
    # Enviamos un payload vacío donde se requiere 'identidad'
    respuesta = cliente.post("/api/v1/componentes/registrar", json={})
    assert respuesta.status_code == 422
    
    data = respuesta.json()
    assert "error" in data
    assert data["error"]["codigo"] == "VALIDACION_DATOS_ERROR"
    assert "no cumple con la estructura" in data["error"]["mensaje"]
    assert isinstance(data["error"]["detalles"], list)
    assert len(data["error"]["detalles"]) > 0
