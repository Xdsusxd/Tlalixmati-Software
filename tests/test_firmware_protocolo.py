"""
Pruebas para verificar el protocolo de comunicación y compatibilidad del firmware ESP32.
"""

import json
from pathlib import Path
from services.raspberry.app.hardware.enlace_esp32 import EnlaceESP32
from unittest.mock import MagicMock


def test_archivos_clave_firmware_existen():
    """Verifica la existencia de los archivos esenciales del proyecto ESP-IDF."""
    base = Path("services/firmware")
    assert (base / "CMakeLists.txt").exists()
    assert (base / "sdkconfig.defaults").exists()
    assert (base / "main/main.cpp").exists()
    assert (base / "main/CMakeLists.txt").exists()
    assert (base / "components/identidad/include/identidad.hpp").exists()
    assert (base / "components/sensores/include/sensores.hpp").exists()
    assert (base / "components/telemetria/include/telemetria.hpp").exists()
    assert (base / "components/actuadores/include/actuadores.hpp").exists()
    assert (base / "README.md").exists()


def test_compatibilidad_protocolo_esp32_hacia_raspberry():
    """Verifica que la trama producida por el ESP32 sea consumida exitosamente por el enlace de la Raspberry Pi."""
    # Trama simulada exactamente igual a la generada por TransmisorTelemetria::formatear_trama_json
    mac_real = "24:6F:28:1A:2B:3C"
    humedad = 62.5
    temperatura = 23.4
    radiacion = 780
    bateria = 3.95

    trama_esp32 = (
        f'{{"mac":"{mac_real}","humedad_suelo":{humedad:.1f},'
        f'"temperatura":{temperatura:.1f},"radiacion":{radiacion:.0f},"bateria":{bateria:.2f}}}\n'
    )

    # Verificar que sea un JSON válido
    datos = json.loads(trama_esp32.strip())
    assert datos["mac"] == mac_real
    assert datos["humedad_suelo"] == humedad
    assert datos["temperatura"] == temperatura
    assert datos["radiacion"] == radiacion
    assert datos["bateria"] == bateria

    # Verificar que el decodificador de la Raspberry Pi lo procese
    enlace = EnlaceESP32()
    mock_serial = MagicMock()
    mock_serial.is_open = True
    mock_serial.in_waiting = len(trama_esp32)
    mock_serial.readline.return_value = trama_esp32.encode("utf-8")

    enlace._serial = mock_serial
    lectura = enlace.leer_telemetria()

    assert lectura is not None
    assert lectura["mac"] == mac_real
    assert lectura["humedad_suelo"] == 62.5
