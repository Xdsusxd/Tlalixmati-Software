"""
Detector y segmentador de especímenes vegetales basado en Ultralytics YOLOv8.
Acelerado mediante GPU NVIDIA (CUDA) para inferencia en tiempo real.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
from PIL import Image

logger = logging.getLogger("tlalixmati.vision.yolo")


class DetectorYOLO:
    def __init__(self, ruta_pesos: Optional[str] = None, dispositivo: str = "cpu"):
        self.dispositivo = dispositivo
        self.ruta_pesos = ruta_pesos or "yolov8n.pt"
        self._modelo = None
        self._cargado = False
        self._inicializar_modelo()

    def _inicializar_modelo(self):
        """Carga el modelo YOLOv8 y lo transfiere a la GPU si está disponible."""
        try:
            from ultralytics import YOLO
            # Si existen pesos personalizados entrenados localmente, cargarlos; si no, modelo base
            if Path(self.ruta_pesos).exists():
                logger.info(f"Cargando pesos personalizados de YOLO desde {self.ruta_pesos}...")
                self._modelo = YOLO(self.ruta_pesos)
            else:
                logger.info("Pesos personalizados aún no entrenados. Inicializando YOLOv8n base.")
                self._modelo = YOLO("yolov8n.pt")

            # Transferir a GPU si está especificado
            self._modelo.to(self.dispositivo)
            self._cargado = True
            logger.info(f"YOLOv8 inicializado exitosamente en dispositivo: {self.dispositivo}")
        except Exception as e:
            logger.error(f"Error al inicializar YOLOv8: {e}")
            self._modelo = None
            self._cargado = False

    def detectar(self, imagen_np: np.ndarray, umbral_confianza: float = 0.35) -> List[Dict]:
        """
        Ejecuta la inferencia sobre una imagen en formato NumPy (RGB o BGR).
        Retorna la lista de detecciones con cajas delimitadoras, clases y niveles de confianza.
        """
        if not self._cargado or self._modelo is None:
            return []

        try:
            resultados = self._modelo.predict(
                source=imagen_np,
                conf=umbral_confianza,
                device=self.dispositivo,
                verbose=False
            )
            
            detecciones = []
            for r in resultados:
                boxes = r.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    nombre_clase = r.names.get(cls_id, f"clase_{cls_id}")

                    detecciones.append({
                        "caja": (int(x1), int(y1), int(x2), int(y2)),
                        "confianza": conf,
                        "clase": nombre_clase,
                        "clase_id": cls_id,
                    })
            return detecciones
        except Exception as e:
            logger.error(f"Error durante inferencia YOLO: {e}")
            return []

    def recortar_region(self, imagen_np: np.ndarray, caja: Tuple[int, int, int, int]) -> Optional[np.ndarray]:
        """Extrae el recorte de una región vegetal para análisis fino de anomalías."""
        x1, y1, x2, y2 = caja
        h, w = imagen_np.shape[:2]
        x1 = max(0, min(x1, w - 1))
        y1 = max(0, min(y1, h - 1))
        x2 = max(x1 + 1, min(x2, w))
        y2 = max(y1 + 1, min(y2, h))
        recorte = imagen_np[y1:y2, x1:x2]
        if recorte.size > 0:
            return recorte
        return None
