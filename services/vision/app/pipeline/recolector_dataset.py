"""
Módulo de recolección y estructuración de dataset a partir de la cámara física.
Almacena imágenes reales de campo bajo estructura compatible con YOLO y PyTorch.
"""

from datetime import datetime, timezone
import io
import json
import logging
from pathlib import Path
from typing import Optional, Tuple
import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger("tlalixmati.vision.recolector")


class RecolectorDataset:
    def __init__(self, directorio_base: str = "services/vision/dataset"):
        self.directorio_base = Path(directorio_base)
        self.dir_imagenes = self.directorio_base / "imagenes"
        self.dir_etiquetas = self.directorio_base / "etiquetas"
        self._inicializar_directorios()

    def _inicializar_directorios(self):
        """Crea las carpetas del dataset si aún no existen."""
        for split in ["train", "val", "test"]:
            (self.dir_imagenes / split).mkdir(parents=True, exist_ok=True)
            (self.dir_etiquetas / split).mkdir(parents=True, exist_ok=True)

    def evaluar_calidad_fotograma(self, imagen_np: np.ndarray) -> Tuple[bool, str]:
        """
        Verifica que la imagen no esté borrosa, completamente oscura o saturada.
        Utiliza la varianza del Laplaciano para determinar la nitidez óptica.
        """
        if imagen_np is None or imagen_np.size == 0:
            return False, "Imagen vacía o corrupta"

        gris = cv2.cvtColor(imagen_np, cv2.COLOR_BGR2GRAY) if len(imagen_np.shape) == 3 else imagen_np
        brillo_medio = np.mean(gris)

        if brillo_medio < 25.0:
            return False, "Imagen subexpuesta (demasiado oscura para entrenamiento)"
        if brillo_medio > 235.0:
            return False, "Imagen sobreexpuesta (saturación blanca)"

        varianza_laplaciano = cv2.Laplacian(gris, cv2.CV_64F).var()
        if varianza_laplaciano < 40.0:
            return False, f"Imagen borrosa o desenfocada (nitidez: {varianza_laplaciano:.1f})"

        return True, f"Fotograma nítido (brillo: {brillo_medio:.1f}, nitidez: {varianza_laplaciano:.1f})"

    def guardar_muestra(
        self,
        imagen_bytes: bytes,
        etiqueta_clase: str = "sin_etiquetar",
        split: str = "train",
        metadatos: Optional[dict] = None
    ) -> Optional[Path]:
        """
        Guarda un fotograma óptico real en el split indicado con metadatos asociados.
        """
        try:
            # Validar bytes de imagen
            img_pil = Image.open(io.BytesIO(imagen_bytes))
            img_pil.verify()
            
            # Recargar para operaciones
            img_pil = Image.open(io.BytesIO(imagen_bytes))
            img_np = np.array(img_pil)

            es_valido, motivo = self.evaluar_calidad_fotograma(img_np)
            if not es_valido:
                logger.warning(f"Muestra rechazada: {motivo}")
                return None

            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
            nombre_archivo = f"cultivo_{timestamp}.jpg"
            ruta_destino = self.dir_imagenes / split / nombre_archivo

            img_pil.save(ruta_destino, format="JPEG", quality=95)

            # Guardar metadatos asociados
            ruta_meta = self.dir_etiquetas / split / f"cultivo_{timestamp}.json"
            info = {
                "archivo": nombre_archivo,
                "dimensiones": [img_pil.width, img_pil.height],
                "etiqueta": etiqueta_clase,
                "calidad": motivo,
                "fecha_utc": datetime.now(timezone.utc).isoformat(),
                "metadatos_extra": metadatos or {},
            }
            with open(ruta_meta, "w", encoding="utf-8") as f:
                json.dump(info, f, indent=2, ensure_ascii=False)

            logger.info(f"Muestra guardada exitosamente en {ruta_destino}")
            return ruta_destino
        except Exception as e:
            logger.error(f"Error al guardar muestra de dataset: {e}")
            return None
