"""
Pruebas para el endpoint de Tlahuicole (/api/v1/tlahuicole/estado).

Verifica la regla fundamental:
- Tlahuicole NO es una entidad de dispositivo independiente ni posee un device_id propio.
- Su estado se deriva dinámicamente de sus componentes reales (ESP32 + Raspberry Pi).
- Muestra estrictamente 'Sin datos' y 'Sin resultados' cuando no existen lecturas reales.
"""

from fastapi.testclient import TestClient


def test_tlahuicole_estado_inicial_sin_hardware(cliente: TestClient):
    """Verifica que inicialmente Tlahuicole refleje ausencia de componentes conectados."""
    respuesta = cliente.get("/api/v1/tlahuicole/estado")
    assert respuesta.status_code == 200
    
    data = respuesta.json()
    assert data["nombre"] == "Tlahuicole"
    assert "Agrupación lógica" in data["naturaleza"]
    assert data["estado_general"] == "Componente no conectado"
    assert data["sensores"] == "Sin datos"
    assert data["analisis"] == "Sin resultados"
    assert data["esp32"]["estado"] == "Componente no conectado"
    assert data["raspberry"]["estado"] == "Componente no conectado"
    assert data["camara"]["estado"] == "Componente no configurado"
    assert "Sin componentes físicos conectados" in data["resumen_operativo"]


def test_tlahuicole_estado_derivado_conexion_parcial(cliente: TestClient):
    """
    Verifica que al registrar solo el ESP32, el estado de Tlahuicole se derive
    automáticamente a conexión parcial / error sin requerir un ID propio para Tlahuicole.
    """
    cliente.post(
        "/api/v1/componentes/registrar",
        json={
            "identidad": {
                "tipo": "esp32",
                "identificador_hardware": "24:0A:C4:00:11:22",
                "modelo": "ESP32-WROOM-32D"
            }
        }
    )
    
    respuesta = cliente.get("/api/v1/tlahuicole/estado")
    assert respuesta.status_code == 200
    data = respuesta.json()
    
    assert data["esp32"]["estado"] == "Conectado"
    assert data["raspberry"]["estado"] == "Componente no conectado"
    assert data["estado_general"] == "Error"
    assert "Comunicación parcial" in data["resumen_operativo"]


def test_tlahuicole_estado_derivado_conexion_completa(cliente: TestClient):
    """
    Verifica que al registrar ambos componentes físicos reales (ESP32 y Raspberry Pi),
    Tlahuicole pase a estado 'Conectado' automáticamente.
    """
    # 1. Registrar ESP32 con su MAC real
    cliente.post(
        "/api/v1/componentes/registrar",
        json={
            "identidad": {
                "tipo": "esp32",
                "identificador_hardware": "24:0A:C4:00:11:22",
                "modelo": "ESP32-WROOM-32D"
            }
        }
    )
    # 2. Registrar Raspberry Pi con su número de serie real
    cliente.post(
        "/api/v1/componentes/registrar",
        json={
            "identidad": {
                "tipo": "raspberry",
                "identificador_hardware": "10000000a1b2c3d4",
                "modelo": "Raspberry Pi 4 Model B"
            }
        }
    )

    respuesta = cliente.get("/api/v1/tlahuicole/estado")
    assert respuesta.status_code == 200
    data = respuesta.json()

    assert data["esp32"]["estado"] == "Conectado"
    assert data["raspberry"]["estado"] == "Conectado"
    assert data["estado_general"] == "Conectado"
    assert "operativa" in data["resumen_operativo"]
    
    # REGLA: Los sensores y análisis siguen indicando 'Sin datos' y 'Sin resultados'
    # porque aún no se han realizado lecturas físicas.
    assert data["sensores"] == "Sin datos"
    assert data["analisis"] == "Sin resultados"
