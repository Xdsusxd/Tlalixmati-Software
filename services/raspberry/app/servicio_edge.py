"""
Servicio orquestador Edge para la Raspberry Pi en campo.

Coordina:
1. Registro de identidad física en la API de Tlalixmati.
2. Transmisión periódica de fotogramas de la cámara para el streaming en vivo.
3. Adquisición de telemetría desde el microcontrolador ESP32 por puerto serial.
"""

import asyncio
import logging
from typing import Optional
import httpx

from services.raspberry.app.core.config import ConfiguracionEdge, cargar_configuracion_edge
from services.raspberry.app.hardware.camara import CapturadorCamara
from services.raspberry.app.hardware.enlace_esp32 import EnlaceESP32
from services.raspberry.app.hardware.identidad import obtener_serial_raspberry

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("tlalixmati.raspberry")


class ServicioEdgeRaspberry:
    def __init__(self, config: Optional[ConfiguracionEdge] = None):
        self.config = config or cargar_configuracion_edge()
        self.camara = CapturadorCamara(
            indice_camara=self.config.camara_index,
            ancho=self.config.ancho_frame,
            alto=self.config.alto_frame,
            fps_objetivo=self.config.fps_captura,
        )
        self.enlace_esp32 = EnlaceESP32(
            puerto=self.config.puerto_serial,
            baudrate=self.config.baudrate,
        )
        self.serial_hardware = obtener_serial_raspberry()
        self.ejecutando = False

    def registrar_en_servidor(self) -> bool:
        """Registra la Raspberry Pi ante la API utilizando su número de serie real y capacidades de cámara."""
        if not self.serial_hardware:
            logger.warning("No se pudo obtener el serial de hardware de la Raspberry Pi.")
            return False

        url = f"{self.config.api_url}/api/v1/componentes/registrar"
        payload = {
            "tipo": "raspberry",
            "identificador_hardware": self.serial_hardware,
            "habilitado": True,
            "metadatos": {
                "rol": "Edge Computing & Camara",
                "fps_nativo": self.camara.fps,
                "resolucion_nativa": f"{self.camara.ancho}x{self.camara.alto}",
            }
        }
        try:
            with httpx.Client(timeout=4.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    logger.info(f"Raspberry Pi registrada exitosamente en API con ID: {self.serial_hardware}")
                    return True
                logger.warning(f"Respuesta inesperada al registrar en API: {res.status_code}")
        except Exception as e:
            logger.warning(f"No se pudo contactar a la API en {url}: {e}")

        return False

    def enviar_fotograma(self) -> bool:
        """Captura un fotograma y lo envía al endpoint de la cámara en la API a su resolución y FPS nativos."""
        frame_bytes = self.camara.capturar_frame_jpeg()
        if not frame_bytes:
            return False

        url = f"{self.config.api_url}/api/v1/camara/frame"
        headers = {
            "Content-Type": "image/jpeg",
            "X-Resolucion": f"{self.camara.ancho}x{self.camara.alto}",
            "X-FPS": f"{self.camara.fps:.1f}",
        }
        try:
            with httpx.Client(timeout=3.0) as client:
                res = client.post(
                    url,
                    content=frame_bytes,
                    headers=headers
                )
                return res.status_code == 200
        except Exception:
            return False

    def procesar_telemetria_esp32(self) -> Optional[dict]:
        """Consulta el puerto serial y reenvía datos a la plataforma si hay lectura."""
        datos = self.enlace_esp32.leer_telemetria()
        if datos:
            logger.info(f"Lectura recibida del ESP32: {datos}")
            mac = datos.get("mac")
            if mac and len(str(mac)) >= 8:
                try:
                    url = f"{self.config.api_url}/api/v1/componentes/registrar"
                    payload = {
                        "tipo": "esp32",
                        "identificador_hardware": str(mac),
                        "habilitado": True,
                        "metadatos": {"sensores": list(datos.keys())}
                    }
                    with httpx.Client(timeout=3.0) as client:
                        client.post(url, json=payload)
                except Exception:
                    pass

            # Reenviar mediciones de sensores al endpoint de telemetría de la API
            try:
                url_telem = f"{self.config.api_url}/api/v1/telemetria/recibir"
                payload_telem = {
                    "mac": str(mac) if mac else (self.serial_hardware or "ESP32_FIELD"),
                    "humedad_suelo": datos.get("humedad_suelo"),
                    "temperatura": datos.get("temperatura"),
                    "radiacion": datos.get("radiacion"),
                    "bateria": datos.get("bateria"),
                }
                with httpx.Client(timeout=3.0) as client:
                    client.post(url_telem, json=payload_telem)
            except Exception as e:
                logger.debug(f"Aviso al reenviar telemetría: {e}")

        return datos

    def ejecutar_ciclo(self) -> dict:
        """Ejecuta un ciclo completo de captura óptica y lectura sensorial."""
        frame_enviado = self.enviar_fotograma()
        datos_sensores = self.procesar_telemetria_esp32()
        return {
            "frame_enviado": frame_enviado,
            "telemetria": datos_sensores,
            "serial_rpi": self.serial_hardware,
            "ancho": self.camara.ancho,
            "alto": self.camara.alto,
            "fps": self.camara.fps,
        }

    async def bucle_principal(self):
        """Bucle asíncrono para transmisión continua a la tasa máxima nativa del hardware óptico."""
        import time
        self.ejecutando = True
        logger.info("Iniciando servicio Edge Tlalixmati en Raspberry Pi...")
        self.camara.iniciar()
        self.enlace_esp32.conectar()
        self.registrar_en_servidor()

        # Determinar cadencia de muestreo a partir de los FPS máximos reales
        fps_efectivo = self.camara.fps if self.camara.fps > 0 else 30.0
        intervalo_frame = 1.0 / max(1.0, fps_efectivo)
        logger.info(
            f"Streaming óptico configurado a {fps_efectivo:.1f} FPS "
            f"({self.camara.ancho}x{self.camara.alto}) - intervalo {intervalo_frame * 1000:.1f}ms"
        )

        while self.ejecutando:
            t_inicio = time.time()
            self.enviar_fotograma()
            self.procesar_telemetria_esp32()
            
            t_transcurrido = time.time() - t_inicio
            t_espera = max(0.001, intervalo_frame - t_transcurrido)
            await asyncio.sleep(t_espera)

    def detener(self):
        """Detiene el servicio y libera hardware."""
        self.ejecutando = False
        self.camara.liberar()
        self.enlace_esp32.desconectar()
        logger.info("Servicio Edge detenido.")
