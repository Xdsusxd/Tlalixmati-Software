"""
Punto de entrada ejecutable para el servicio de Visión Artificial e IA de Tlalixmati.
Monitorea de forma continua el cultivo, ejecuta inferencia con YOLOv8 y PyTorch en GPU,
y dispara alertas fitosanitarias automáticas cuando se detecta una planta en mal estado.
"""

import argparse
import asyncio
import logging
from pathlib import Path
import signal
import sys
import time
from typing import Optional

# Asegurar que la raíz del proyecto esté en sys.path
_raiz = Path(__file__).resolve().parent.parent.parent.parent
if str(_raiz) not in sys.path:
    sys.path.insert(0, str(_raiz))

import httpx
import torch

from services.vision.app.core.config import ConfiguracionVision, cargar_configuracion_vision
from services.vision.app.pipeline.orquestador_vision import OrquestadorVision

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (IA-Vision) %(message)s"
)
logger = logging.getLogger("tlalixmati.vision.servicio")


class ServicioVisionDaemon:
    def __init__(self, config: Optional[ConfiguracionVision] = None, intervalo_seg: float = 3.0):
        self.config = config or cargar_configuracion_vision()
        self.intervalo_seg = intervalo_seg
        self.orquestador = OrquestadorVision(config=self.config)
        self.ejecutando = False

    def obtener_fotograma_desde_api(self) -> Optional[bytes]:
        """Obtiene el fotograma más reciente transmitido por la cámara a la API."""
        url = f"{self.config.api_url}/api/v1/camara/snapshot"
        try:
            with httpx.Client(timeout=4.0) as client:
                res = client.get(url)
                if res.status_code == 200 and len(res.content) > 100:
                    return res.content
        except Exception as e:
            logger.debug(f"Esperando transmisión de cámara en API ({url}): {e}")
        return None

    def ejecutar_inspeccion_unica(self) -> dict:
        """Realiza una única pasada de inferencia sobre el fotograma actual."""
        frame_bytes = self.obtener_fotograma_desde_api()
        if not frame_bytes:
            logger.warning("No se pudo obtener fotograma para la inspección.")
            return {"exito": False, "motivo": "Sin fotograma disponible"}

        return self.orquestador.procesar_fotograma(frame_bytes)

    async def bucle_monitoreo_continuo(self):
        """Bucle en segundo plano para supervisión fitosanitaria permanente."""
        self.ejecutando = True
        logger.info("=" * 65)
        logger.info("INICIANDO SERVICIO CONTINUO DE VISION E INTELIGENCIA ARTIFICIAL")
        logger.info(f"Dispositivo de Inferencia: {self.config.dispositivo}")
        if torch.cuda.is_available():
            logger.info(f"Aceleración por GPU: {torch.cuda.get_device_name(0)}")
        logger.info(f"Cadencia de Inspección: Cada {self.intervalo_seg} segundos")
        logger.info(f"Servidor API de Destino: {self.config.api_url}")
        logger.info("=" * 65)

        inspecciones = 0
        while self.ejecutando:
            inicio = time.time()
            try:
                frame_bytes = self.obtener_fotograma_desde_api()
                if frame_bytes:
                    inspecciones += 1
                    resultado = self.orquestador.procesar_fotograma(frame_bytes)
                    if resultado.get("exito"):
                        diag = resultado.get("diagnostico", {})
                        clase = diag.get("clase", "SANO")
                        es_alerta = diag.get("es_anomalia", False)
                        conf = diag.get("confianza", 0.0)
                        conteo = diag.get("conteo_especimenes", 0)

                        if es_alerta:
                            logger.warning(
                                f"[Inspección #{inspecciones}] ALERTA DETECTADA: {clase} "
                                f"(Confianza: {conf*100:.1f}% | Especímenes: {conteo})"
                            )
                        else:
                            logger.info(
                                f"[Inspección #{inspecciones}] Cultivo Saludable: {clase} "
                                f"(Confianza: {conf*100:.1f}% | Especímenes: {conteo})"
                            )
                else:
                    logger.info("Cámara física en espera. Aguardando transmisión de campo...")

            except Exception as e:
                logger.error(f"Excepción en ciclo de visión: {e}")

            duracion = time.time() - inicio
            tiempo_espera = max(0.5, self.intervalo_seg - duracion)
            await asyncio.sleep(tiempo_espera)

    def detener(self):
        """Detiene el bucle de ejecución de forma segura."""
        self.ejecutando = False
        logger.info("Servicio de Visión detenido correctamente.")


def diagnostico_sistema_ia():
    """Ejecuta una comprobación técnica del entorno de GPU y librerías."""
    print("=" * 60)
    print("DIAGNOSTICO DEL ENTORNO DE INTELIGENCIA ARTIFICIAL")
    print("=" * 60)
    print(f"Versión de Python: {sys.version.split()[0]}")
    print(f"Versión de PyTorch: {torch.__version__}")
    print(f"CUDA Disponible: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"Dispositivo GPU: {torch.cuda.get_device_name(0)}")
        print(f"Dispositivos detectados: {torch.cuda.device_count()}")
        mem_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"Memoria de Video (VRAM): {mem_gb:.2f} GB")
    else:
        print("Aviso: Ejecutando en CPU sin aceleración CUDA.")

    try:
        import ultralytics
        print(f"Versión de Ultralytics YOLO: {ultralytics.__version__}")
    except ImportError:
        print("Ultralytics YOLO no encontrado.")

    print("=" * 60)
    print("El subsistema de IA se encuentra listo para operar.")


def main():
    parser = argparse.ArgumentParser(description="Daemon de Visión e IA Tlalixmati")
    parser.add_argument(
        "--modo",
        choices=["continuo", "once", "diagnostico"],
        default="continuo",
        help="Modo de ejecución del servicio"
    )
    parser.add_argument(
        "--intervalo",
        type=float,
        default=3.0,
        help="Segundos entre inspecciones sucesivas en modo continuo"
    )
    parser.add_argument(
        "--api-url",
        type=str,
        default=None,
        help="URL base del servidor FastAPI"
    )
    args = parser.parse_args()

    if args.modo == "diagnostico":
        diagnostico_sistema_ia()
        return

    config = cargar_configuracion_vision()
    if args.api_url:
        config.api_url = args.api_url

    daemon = ServicioVisionDaemon(config=config, intervalo_seg=args.intervalo)

    if args.modo == "once":
        logger.info("Ejecutando inspección única...")
        res = daemon.ejecutar_inspeccion_unica()
        print(res)
        return

    # Modo continuo
    def manejar_sigint(sig, frame):
        daemon.detener()
        sys.exit(0)

    signal.signal(signal.SIGINT, manejar_sigint)

    try:
        asyncio.run(daemon.bucle_monitoreo_continuo())
    except KeyboardInterrupt:
        daemon.detener()


if __name__ == "__main__":
    main()
