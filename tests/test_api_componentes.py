"""
Pruebas para los endpoints de componentes físicos (/api/v1/componentes).

Valida:
1. Estados por defecto sin hardware: 'Componente no conectado', 'Cámara no configurada'.
2. Registro de hardware real mediante identificador físico legítimo.
3. Rechazo estricto de nombres inventados como 'tlahuicole-01' o 'dummy'.
4. Consulta individual y manejo de errores 404 para tipos inexistentes.
"""

from fastapi.testclient import TestClient


def test_listar_componentes_por_defecto_sin_datos(cliente: TestClient):
    """Verifica que sin hardware conectado los componentes reporten 'Componente no conectado'."""
    respuesta = cliente.get("/api/v1/componentes")
    assert respuesta.status_code == 200
    
    lista = respuesta.json()
    assert len(lista) == 3
    
    tipos = {c["tipo"]: c for c in lista}
    assert "esp32" in tipos
    assert "raspberry" in tipos
    assert "camara" in tipos
    
    assert tipos["esp32"]["estado"] == "Componente no conectado"
    assert tipos["raspberry"]["estado"] == "Componente no conectado"
    assert tipos["camara"]["estado"] == "Componente no configurado"


def test_obtener_componente_especifico(cliente: TestClient):
    """Verifica la consulta individual de un componente conocido."""
    respuesta = cliente.get("/api/v1/componentes/esp32")
    assert respuesta.status_code == 200
    data = respuesta.json()
    assert data["tipo"] == "esp32"
    assert data["estado"] == "Componente no conectado"


def test_obtener_componente_invalido_retorna_404_con_error_estructurado(cliente: TestClient):
    """Verifica que solicitar un componente inexistente retorne 404 con ErrorResponse."""
    respuesta = cliente.get("/api/v1/componentes/sensor_inexistente")
    assert respuesta.status_code == 404
    
    data = respuesta.json()
    assert "error" in data
    assert data["error"]["codigo"] == "COMPONENTE_NO_CONECTADO"
    assert "no encontrado" in data["error"]["mensaje"]


def test_registrar_componente_real_exitoso(cliente: TestClient):
    """Verifica el registro de un ESP32 con dirección MAC de hardware real."""
    payload = {
        "identidad": {
            "tipo": "esp32",
            "identificador_hardware": "24:0A:C4:00:11:22",
            "modelo": "ESP32-WROOM-32D",
            "version_firmware": "0.1.0"
        },
        "ip_local": "192.168.1.105"
    }
    
    respuesta = cliente.post("/api/v1/componentes/registrar", json=payload)
    assert respuesta.status_code == 200
    
    data = respuesta.json()
    assert data["tipo"] == "esp32"
    assert data["identificador_hardware"] == "24:0A:C4:00:11:22"
    assert data["estado"] == "Conectado"
    assert data["ultima_comunicacion"] is not None


def test_rechazo_de_identificador_inventado_o_prohibido(cliente: TestClient):
    """
    Regla del sistema: NO inventar identificadores como 'tlahuicole-01'.
    Se debe retornar error 400 con código IDENTIFICADOR_INVALIDO.
    """
    nombres_prohibidos = ["tlahuicole", "tlahuicole-01", "dummy", "fake"]
    
    for nombre in nombres_prohibidos:
        payload = {
            "identidad": {
                "tipo": "esp32",
                "identificador_hardware": nombre,
                "modelo": "Modelo Inventado"
            }
        }
        respuesta = cliente.post("/api/v1/componentes/registrar", json=payload)
        assert respuesta.status_code == 400
        data = respuesta.json()
        assert "error" in data
        assert data["error"]["codigo"] == "IDENTIFICADOR_INVALIDO"


def test_rechazo_de_identificador_demasiado_corto(cliente: TestClient):
    """Verifica que un identificador con menos de 4 caracteres sea rechazado por validación (422)."""
    payload = {
        "identidad": {
            "tipo": "esp32",
            "identificador_hardware": "abc",
            "modelo": "Modelo Real"
        }
    }
    respuesta = cliente.post("/api/v1/componentes/registrar", json=payload)
    assert respuesta.status_code == 422
    data = respuesta.json()
    assert data["error"]["codigo"] == "VALIDACION_DATOS_ERROR"
