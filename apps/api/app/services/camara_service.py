"""
Servicio para la transmisión en tiempo real de la cámara de campo.

Permite:
1. Ingesta de frames reales desde la Raspberry Pi (POST /api/v1/camara/frame).
2. Streaming MJPEG en vivo hacia el dashboard web (GET /api/v1/camara/stream).
3. Si la cámara física no transmite aún, proyecta un lienzo en vivo con timestamp
   indicando claramente: 'Cámara física no conectada'.
"""

import asyncio
from datetime import datetime, timezone
import io
import time
from typing import Optional
from PIL import Image, ImageDraw, ImageFont


class CamaraService:
    def __init__(self):
        self._ultimo_frame: Optional[bytes] = None
        self._ultima_actualizacion: Optional[datetime] = None
        self._frame_count: int = 0

    def recibir_frame(self, frame_bytes: bytes) -> bool:
        """Almacena el último frame recibido desde la Raspberry Pi si es una imagen válida."""
        try:
            # Validar que los bytes correspondan a una imagen real y legible
            with Image.open(io.BytesIO(frame_bytes)) as img:
                img.verify()
            self._ultimo_frame = frame_bytes
            self._ultima_actualizacion = datetime.now(timezone.utc)
            self._frame_count += 1
            return True
        except Exception:
            return False

    def obtener_ultimo_frame(self) -> bytes:
        """
        Retorna el frame más reciente. Si no hay frame de hardware,
        genera dinámicamente un fotograma de prueba con timestamp en vivo.
        """
        if self._ultimo_frame:
            return self._ultimo_frame

        # Generar fotograma de lienzo en espera
        ancho, alto = 640, 360
        img = Image.new("RGB", (ancho, alto), color=(15, 23, 18)) # Fondo bosque oscuro
        draw = ImageDraw.Draw(img)

        # Rejilla sutil técnica
        for x in range(0, ancho, 40):
            draw.line([(x, 0), (x, alto)], fill=(25, 38, 30), width=1)
        for y in range(0, alto, 40):
            draw.line([(0, y), (ancho, y)], fill=(25, 38, 30), width=1)

        # Mirilla central
        cx, cy = ancho // 2, alto // 2
        draw.ellipse([(cx - 30, cy - 30), (cx + 30, cy + 30)], outline=(34, 197, 94), width=1)
        draw.line([(cx - 40, cy), (cx + 40, cy)], fill=(34, 197, 94), width=1)
        draw.line([(cx, cy - 40), (cx, cy + 40)], fill=(34, 197, 94), width=1)

        # Textos informativos
        ahora = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        draw.text((20, 20), "TLALIXMATI - MONITOR OPTICO DE CAMPO", fill=(240, 253, 244))
        draw.text((20, 42), f"TIMESTAMP EN VIVO: {ahora}", fill=(134, 239, 172))
        
        draw.text((cx - 140, cy + 45), "CAMARA FISICA NO CONECTADA", fill=(239, 68, 68))
        draw.text((cx - 165, cy + 65), "Esperando transmision de Raspberry Pi", fill=(148, 163, 184))

        # Cuadro de estado inferior
        draw.rectangle([(15, alto - 35), (ancho - 15, alto - 15)], fill=(24, 34, 27), outline=(40, 56, 45))
        draw.text((25, alto - 30), "Canal: CSI/USB  |  FPS: 0.0  |  Resolucion: 640x360", fill=(148, 163, 184))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        return buffer.getvalue()

    async def generar_stream(self):
        """Generador asíncrono para streaming MJPEG."""
        while True:
            frame = self.obtener_ultimo_frame()
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            )
            # 10 cuadros por segundo para visualización fluida
            await asyncio.sleep(0.1)


# Instancia única del servicio de cámara
_camara_service_instancia: Optional[CamaraService] = None


def get_camara_service() -> CamaraService:
    global _camara_service_instancia
    if _camara_service_instancia is None:
        _camara_service_instancia = CamaraService()
    return _camara_service_instancia
