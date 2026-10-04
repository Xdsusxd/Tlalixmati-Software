"""
Pruebas para los endpoints y servicio de la bitácora de eventos (/api/v1/eventos).
"""

from fastapi.testclient import TestClient


def test_listar_eventos_retorna_lista(cliente: TestClient):
    """Verifica que el listado de eventos responda con código 200 y formato de lista."""
    res = cliente.get("/api/v1/eventos")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_crear_evento_y_filtrar_por_nivel(cliente: TestClient):
    """Verifica la creación de un evento y su posterior consulta filtrada."""
    payload = {
        "nivel": "aviso",
        "origen": "PRUEBA_SISTEMA",
        "mensaje": "Mensaje de prueba de auditoría de campo",
        "detalles": {"voltaje": 3.8}
    }
    res_crear = cliente.post("/api/v1/eventos", json=payload)
    assert res_crear.status_code == 201
    data_crear = res_crear.json()
    assert data_crear["nivel"] == "aviso"
    assert data_crear["origen"] == "PRUEBA_SISTEMA"
    assert "voltaje" in data_crear["detalles"]

    # Verificar filtrado por nivel 'aviso'
    res_filtrado = cliente.get("/api/v1/eventos?nivel=aviso")
    assert res_filtrado.status_code == 200
    eventos_aviso = res_filtrado.json()
    assert len(eventos_aviso) >= 1
    assert any(e["mensaje"] == "Mensaje de prueba de auditoría de campo" for e in eventos_aviso)
