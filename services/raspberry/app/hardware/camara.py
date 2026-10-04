"""
Módulo de captura de cámara física para la Raspberry Pi.

Soporta cámaras USB (V4L2 / OpenCV) y módulo oficial de cámara CSI.
"""

from datetime import datetime, timezone
import io
import time
from typing import Optional
from PIL import Image, ImageDraw


class CapturadorCamara:
    def __init__(self, indice_camara: int = 0, ancho: int = 640, alto: int = 360):
        self.indice_camara = indice_camara
        self.ancho = ancho
        self.alto = alto
        self._camara = None
        self._tiene_opencv = False
        self._intentar_cargar_opencv()

    def _intentar_cargar_opencv(self):
        try:
            import cv2
            self.cv2 = cv2
            self._tiene_opencv = True
        except ImportError:
            self._tiene_opencv = False

    def iniciar(self) -> bool:
        """Inicializa la captura de video si existe dispositivo físico."""
        if self._tiene_opencv:
            try:
                self._camara = self.cv2.VideoCapture(self.indice_camara)
                self._camara.set(self.cv2.CAP_PROP_FRAME_WIDTH, self.ancho)
                self._camara.set(self.cv2.CAP_PROP_FRAME_HEIGHT, self.alto)
                if self._camara.isOpened():
                    return True
            except Exception:
                self._camara = None
        return False

    def capturar_frame_jpeg(self) -> Optional[bytes]:
        """
        Captura un fotograma óptico y lo codifica en formato JPEG.
        Si la cámara física no está conectada, genera un fotograma técnico informativo.
        """
        # 1. Si OpenCV está activo y la cámara abrió correctamente
        if self._tiene_opencv and self._camara and self._camara.isOpened():
            ret, frame = self._camara.read()
            if ret and frame is not None:
                ret_encode, buf = self.cv2.imencode(".jpg", frame, [self.cv2.IMWRITE_JPEG_QUALITY, 80])
                if ret_encode:
                    return buf.tobytes()

        # 2. Generar fotograma de campo con Pillow (Monitoreo técnico de Raspberry Pi)
        img = Image.new("RGB", (self.ancho, self.alto), color=(18, 38, 26))
        draw = ImageDraw.Draw(img)

        # Retícula técnica
        for x in range(0, self.ancho, 40):
            draw.line([(x, 0), (x, self.alto)], fill=(28, 56, 38), width=1)
        for y in range(0, self.alto, 40):
            draw.line([(0, y), (self.ancho, y)], fill=(28, 56, 38), width=1)

        # Mirilla central
        cx, cy = self.ancho // 2, self.alto // 2
        draw.ellipse([(cx - 30, cy - 30), (cx + 30, cy + 30)], outline=(34, 197, 94), width=1)
        draw.line([(cx - 40, cy), (cx + 40, cy)], fill=(34, 197, 94), width=1)
        draw.line([(cx, cy - 40), (cx, cy + 40)], fill=(34, 197, 94), width=1)

        ahora = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        draw.text((20, 20), "TLALIXMATI - NODO RASPBERRY PI (CAMPO)", fill=(240, 253, 244))
        draw.text((20, 42), f"CAPTURA EN VIVO: {ahora}", fill=(134, 239, 172))

        draw.text((cx - 130, cy + 45), "CAMARA FISICA EN ESPERA", fill=(234, 179, 8))
        draw.text((cx - 150, cy + 65), "Conectar sensor de camara CSI o USB", fill=(148, 163, 184))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=80)
        return buffer.getvalue()

    def liberar(self):
        """Libera los recursos de hardware de la cámara."""
        if self._camara:
            try:
                self._camara.release()
            except Exception:
                pass
            self._camara = None
