"""
Orquestador autónomo de visión artificial para Tlalixmati.
Coordina:
1. Recepción e inferencia sobre fotogramas ópticos del cultivo.
2. Detección y segmentación vegetal con YOLOv8 en GPU (RTX 4050).
3. Clasificación de estrés y anomalías con PyTorch.
4. Disparo automático autónomo del informe PDF ante plantas en mal estado.
"""

from datetime import datetime, timezone
import io
import logging
import time
from typing import Dict, Optional, Tuple
import cv2
import httpx
import numpy as np
from PIL import Image

from services.vision.app.core.config import ConfiguracionVision, cargar_configuracion_vision
from services.vision.app.modelos.detector_yolo import DetectorYOLO
from services.vision.app.modelos.clasificador_estres import ClasificadorEstresFoliar
from services.vision.app.modelos.diagnostico import calcular_indices_vegetacion, anotar_fotograma

logger = logging.getLogger("tlalixmati.vision.orquestador")


class OrquestadorVision:
    def __init__(self, config: Optional[ConfiguracionVision] = None):
        self.config = config or cargar_configuracion_vision()
        self.detector = DetectorYOLO(
            ruta_pesos=self.config.ruta_pesos_yolo,
            dispositivo=self.config.dispositivo
        )
        self.clasificador = ClasificadorEstresFoliar(
            ruta_pesos=self.config.ruta_pesos_pytorch,
            dispositivo=self.config.dispositivo
        )
        self._ultimo_disparo_alerta: float = 0.0

    def procesar_fotograma(self, imagen_bytes: bytes) -> Dict:
        """
        Procesa un fotograma óptico real:
        1. Decodifica la imagen.
        2. Ejecuta detección YOLO de especímenes vegetales.
        3. Realiza análisis espectral de color y clasificación PyTorch.
        4. Si detecta planta en mal estado, dispara el reporte automático.
        """
        try:
            # 1. Decodificar imagen a formato NumPy BGR
            arr_bytes = np.frombuffer(imagen_bytes, dtype=np.uint8)
            img_bgr = cv2.imdecode(arr_bytes, cv2.IMREAD_COLOR)
            if img_bgr is None:
                return {"exito": False, "motivo": "No se pudo decodificar el fotograma"}

            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

            # 2. Inferencia con YOLOv8 en GPU
            detecciones = self.detector.detectar(
                img_rgb,
                umbral_confianza=self.config.umbral_confianza_yolo
            )

            # 3. Análisis de color vegetal e inferencia PyTorch
            indices = calcular_indices_vegetacion(img_bgr)
            diagnostico_red = self.clasificador.clasificar(img_rgb)

            # Evaluar si existe anomalía foliar por red o por clorosis severa
            es_anomalia = (
                diagnostico_red.get("es_anomalia", False) or
                indices.get("proporcion_clorosis", 0.0) >= 0.40 or
                indices.get("proporcion_necrosis", 0.0) >= 0.25
            )

            diagnostico_final = {
                "es_anomalia": es_anomalia,
                "clase": diagnostico_red.get("clase", "SANO"),
                "confianza": diagnostico_red.get("confianza", 0.0),
                "indice_anomalia": max(
                    diagnostico_red.get("indice_anomalia", 0.0),
                    indices.get("proporcion_clorosis", 0.0)
                ),
                "indices_color": indices,
                "conteo_especimenes": len(detecciones),
            }

            # 4. Generar fotograma anotado
            fotograma_anotado = anotar_fotograma(img_bgr, detecciones, diagnostico_final)
            ret_encode, buf_anotado = cv2.imencode(".jpg", fotograma_anotado, [cv2.IMWRITE_JPEG_QUALITY, 85])
            bytes_anotados = buf_anotado.tobytes() if ret_encode else imagen_bytes

            # 5. Si la planta está en mal estado, disparar reporte automático a Supabase
            if es_anomalia:
                self._evaluar_y_disparar_alerta(diagnostico_final, bytes_anotados)

            return {
                "exito": True,
                "diagnostico": diagnostico_final,
                "fotograma_anotado_bytes": bytes_anotados,
            }
        except Exception as e:
            logger.error(f"Error al procesar fotograma en orquestador de visión: {e}")
            return {"exito": False, "motivo": str(e)}

    def _evaluar_y_disparar_alerta(self, diagnostico: Dict, fotograma_anotado_bytes: bytes) -> bool:
        """
        Envía solicitud POST al endpoint de alerta automática de la API.
        Controlado por un cooldown temporal para evitar duplicación continua.
        """
        ahora = time.time()
        if ahora - self._ultimo_disparo_alerta < self.config.cooldown_alerta_seg:
            logger.info("Alerta omitida temporalmente: período de enfriamiento activo.")
            return False

        detalle = (
            f"Detección visual: {diagnostico.get('clase')} "
            f"(Índice de severidad: {diagnostico.get('indice_anomalia', 0.0) * 100:.1f}%). "
            f"Clorosis foliar estimada: {diagnostico.get('indices_color', {}).get('proporcion_clorosis', 0.0) * 100:.1f}%."
        )

        url = f"{self.config.api_url}/api/v1/reportes/alerta-automatica"
        try:
            # Primero actualizamos el frame de la cámara en el servidor para que el PDF use la imagen de la alerta
            url_frame = f"{self.config.api_url}/api/v1/camara/frame"
            with httpx.Client(timeout=5.0) as client:
                client.post(
                    url_frame,
                    content=fotograma_anotado_bytes,
                    headers={"Content-Type": "image/jpeg"}
                )
                
                # Disparar generación automática del reporte PDF en Supabase
                res = client.post(
                    url,
                    json={"detalle_anomalia": detalle}
                )
                if res.status_code == 201:
                    self._ultimo_disparo_alerta = ahora
                    logger.info(f"Reporte de alerta automática generado y subido a Supabase con éxito: {detalle}")
                    return True
                logger.warning(f"Respuesta inesperada al disparar alerta automática: {res.status_code}")
        except Exception as e:
            logger.error(f"No se pudo contactar con la API para generar el reporte de alerta: {e}")

        return False
