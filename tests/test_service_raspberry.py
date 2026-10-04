"""
Pruebas unitarias para el servicio Edge de Raspberry Pi.
"""

from unittest.mock import MagicMock, patch
from services.raspberry.app.core.config import ConfiguracionEdge
from services.raspberry.app.hardware.camara import CapturadorCamara
from services.raspberry.app.hardware.enlace_esp32 import EnlaceESP32
from services.raspberry.app.hardware.identidad import obtener_serial_raspberry
from services.raspberry.app.servicio_edge import ServicioEdgeRaspberry


def test_obtener_serial_hardware_no_vacio():
    """Verifica que el serial de hardware no sea nulo ni contenga cadenas ficticias prohibidas."""
    serial = obtener_serial_raspberry()
    assert serial is not None
    assert len(serial) >= 6
    assert "dummy" not in serial.lower()
    assert "tlahuicole" not in serial.lower()


def test_captura_frame_jpeg_valido():
    """Verifica que el capturador genere fotogramas con cabecera binaria JPEG válida."""
    capturador = CapturadorCamara(ancho=320, alto=240)
    frame = capturador.capturar_frame_jpeg()
    assert frame is not None
    assert isinstance(frame, bytes)
    # Cabecera estándar SOI (Start of Image) de JPEG
    assert frame.startswith(b"\xff\xd8")


def test_enlace_esp32_parseo_trama_json():
    """Verifica que el enlace serial decodifique tramas JSON válidas del ESP32."""
    enlace = EnlaceESP32()
    # Simular lectura serial con mock
    mock_serial = MagicMock()
    mock_serial.is_open = True
    mock_serial.in_waiting = 65
    mock_serial.readline.return_value = b'{"humedad_suelo": 63.4, "temperatura": 24.1, "mac": "24:6F:28:11:22:33"}\n'
    
    enlace._serial = mock_serial
    datos = enlace.leer_telemetria()
    
    assert datos is not None
    assert datos["humedad_suelo"] == 63.4
    assert datos["temperatura"] == 24.1
    assert datos["mac"] == "24:6F:28:11:22:33"


def test_servicio_edge_ejecutar_ciclo():
    """Verifica la ejecución de un ciclo del servicio Edge orquestador."""
    cfg = ConfiguracionEdge(api_url="http://test-server")
    servicio = ServicioEdgeRaspberry(config=cfg)

    # Simular envío exitoso de frame
    with patch.object(servicio, "enviar_fotograma", return_value=True):
        resultado = servicio.ejecutar_ciclo()
        assert resultado["frame_enviado"] is True
        assert resultado["serial_rpi"] is not None
