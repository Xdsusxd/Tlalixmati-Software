"""
Pruebas para los endpoints y servicio de inferencia de visión artificial (/api/v1/vision).
"""

from fastapi.testclient import TestClient


def test_vision_estado_inicial_sin_inferencias(cliente: TestClient):
    """Verifica que inicialmente no se inventen diagnósticos falsos."""
    res = cliente.get("/api/v1/vision/estado")
    assert res.status_code == 200
    data = res.json()
    assert data["activo"] is False
    assert data["clase_actual"] is None
    assert data["confianza"] is None
    assert data["es_anomalia"] is False
    assert data["resumen_diagnostico"] == "Sin resultados"


def test_registrar_diagnostico_vision_actualiza_estado(cliente: TestClient):
    """Verifica la ingesta de inferencias reales desde el daemon de visión."""
    payload = {
        "clase": "SANO",
        "confianza": 0.94,
        "es_anomalia": False,
        "indice_anomalia": 0.05,
        "conteo_especimenes": 3,
        "dispositivo": "cuda:0",
        "duracion_ms": 42
    }
    res_post = cliente.post("/api/v1/vision/diagnostico", json=payload)
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert data_post["activo"] is True
    assert data_post["clase_actual"] == "SANO"
    assert data_post["confianza"] == 0.94
    assert data_post["conteo_especimenes"] == 3
    assert "Saludable" in data_post["resumen_diagnostico"]

    # Comprobar consulta GET
    res_get = cliente.get("/api/v1/vision/estado")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["activo"] is True
    assert data_get["clase_actual"] == "SANO"


def test_tlahuicole_refleja_diagnostico_vision(cliente: TestClient):
    """Verifica que Tlahuicole integre dinámicamente el análisis de visión computacional."""
    cliente.post(
        "/api/v1/vision/diagnostico",
        json={
            "clase": "CLOROSIS",
            "confianza": 0.89,
            "es_anomalia": True,
            "indice_anomalia": 0.52,
            "conteo_especimenes": 2,
            "dispositivo": "cuda:0",
        }
    )
    res = cliente.get("/api/v1/tlahuicole/estado")
    assert res.status_code == 200
    data = res.json()
    assert "CLOROSIS" in data["analisis"] or "Alerta" in data["analisis"]
