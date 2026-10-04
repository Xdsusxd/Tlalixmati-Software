"""
Pruebas para los endpoints de gestión de cultivos (/api/v1/cultivos).
"""

from fastapi.testclient import TestClient


def test_obtener_cultivo_activo_inicial(cliente: TestClient):
    """Verifica la consulta inicial del cultivo activo."""
    res = cliente.get("/api/v1/cultivos/activo")
    assert res.status_code == 200
    # Puede ser null inicialmente si no hay cultivo registrado


def test_registrar_y_recuperar_cultivo_activo(cliente: TestClient):
    """Verifica que al registrar un cultivo activo, el endpoint /activo lo retorne."""
    payload = {
        "nombre": "Parcela Experimental Cuernavaca",
        "variedad": "Maíz Criollo Blanco",
        "ubicacion": "Cuadrante 4",
        "notas": "Siembra de temporal bajo supervisión Tlalixmati",
        "activo": True
    }
    res_crear = cliente.post("/api/v1/cultivos", json=payload)
    assert res_crear.status_code == 201
    data_crear = res_crear.json()
    assert data_crear["nombre"] == "Parcela Experimental Cuernavaca"
    assert data_crear["variedad"] == "Maíz Criollo Blanco"
    assert data_crear["activo"] is True

    # Comprobar recuperación
    res_activo = cliente.get("/api/v1/cultivos/activo")
    assert res_activo.status_code == 200
    data_activo = res_activo.json()
    assert data_activo is not None
    assert data_activo["nombre"] == "Parcela Experimental Cuernavaca"
