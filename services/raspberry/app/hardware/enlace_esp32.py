"""
Módulo de enlace serial para la comunicación con el microcontrolador ESP32.

Lee las tramas de telemetría de sensores enviadas por el ESP32 a través de UART/USB.
"""

import json
import logging
from typing import Optional

logger = logging.getLogger("tlalixmati.raspberry.serial")


class EnlaceESP32:
    def __init__(self, puerto: str = "/dev/ttyUSB0", baudrate: int = 115200):
        self.puerto = puerto
        self.baudrate = baudrate
        self._serial = None
        self._tiene_serial = False
        self._intentar_cargar_serial()

    def _intentar_cargar_serial(self):
        try:
            import serial
            self.serial = serial
            self._tiene_serial = True
        except ImportError:
            self._tiene_serial = False

    def conectar(self) -> bool:
        """Intenta abrir la conexión serial con el ESP32."""
        if not self._tiene_serial:
            return False

        try:
            self._serial = self.serial.Serial(
                port=self.puerto,
                baudrate=self.baudrate,
                timeout=1.5
            )
            return self._serial.is_open
        except Exception as e:
            self._serial = None
            return False

    def leer_telemetria(self) -> Optional[dict]:
        """
        Lee una línea del puerto serial y parsea la trama JSON del ESP32.
        Retorna un diccionario con las lecturas o None si no hay datos válidos.
        """
        if not self._serial or not self._serial.is_open:
            return None

        try:
            if self._serial.in_waiting > 0:
                linea = self._serial.readline().decode("utf-8", errors="ignore").strip()
                if linea.startswith("{") and linea.endswith("}"):
                    datos = json.loads(linea)
                    # Validación básica de estructura
                    if isinstance(datos, dict):
                        return datos
        except Exception:
            pass

        return None

    def desconectar(self):
        """Cierra el puerto serial de forma limpia."""
        if self._serial:
            try:
                self._serial.close()
            except Exception:
                pass
            self._serial = None
