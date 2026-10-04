"""
Pruebas para el servicio y endpoints de telemetría sensorial (/api/v1/telemetria).

Verifica la regla estricta de CERO DATOS FALSOS:
- Inicialmente o sin hardware activo, reporta honestamente 'Sin datos' y valores en null.
- Al recibir lecturas reales del ESP32 vía Edge, actualiza el estado y alimenta a Tlahuicole.
"""

from fastapi.testclient import TestClient


def test_telemetria_actual_inicial_sin_datos(cliente: TestClient):
    """Verifica que inicialmente no existan datos falsos inventados."""
    res = cliente.get("/api/v1/telemetria/actual")
    assert res.status_code == 200
    data = res.json()
    assert data["conectado"] is False
    assert data["humedad_suelo"] is None
    assert data["temperatura"] is None
    assert data["radiacion"] is None
    assert data["bateria"] is None
    assert data["resumen_sensores"] == "Sin datos"


def test_recibir_telemetria_esp32_actualiza_estado(cliente: TestClient):
    """Verifica la ingesta de mediciones reales provenientes del microcontrolador."""
    payload = {
        "mac": "24:0A:C4:00:11:22",
        "humedad_suelo": 48.5,
        "temperatura": 24.3,
        "radiacion": 920.0,
        "bateria": 4.15
    }
    res_post = cliente.post("/api/v1/telemetria/recibir", json=payload)
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert data_post["conectado"] is True
    assert data_post["humedad_suelo"] == 48.5
    assert data_post["temperatura"] == 24.3
    assert data_post["radiacion"] == 920.0
    assert data_post["bateria"] == 4.15
    assert "48.5%" in data_post["resumen_sensores"]

    # Verificar que el endpoint GET /actual devuelve los valores recibidos
    res_get = cliente.get("/api/v1/telemetria/actual")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["conectado"] is True
    assert data_get["humedad_suelo"] == 48.5


def test_historial_telemetria_estructura_valida(cliente: TestClient):
    """Verifica que la consulta histórica responda con la estructura de puntos esperada."""
    res = cliente.get("/api/v1/telemetria/historial?horas=12")
    assert res.status_code == 200
    data = res.json()
    assert "total_puntos" in data
    assert isinstance(data["puntos"], list)


def test_tlahuicole_refleja_sensores_reales(cliente: TestClient):
    """Verifica que el estado unificado de Tlahuicole integre las lecturas sensoriales reales."""
    cliente.post(
        "/api/v1/telemetria/recibir",
        json={
            "mac": "24:0A:C4:00:11:22",
            "humedad_suelo": 48.5,
            "temperatura": 24.3,
            "radiacion": 920.0,
            "bateria": 4.15
        }
    )
    res = cliente.get("/api/v1/tlahuicole/estado")
    assert res.status_code == 200
    data = res.json()
    assert "48.5%" in data["sensores"]

