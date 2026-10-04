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
        self._ancho: int = 1920
        self._alto: int = 1080
        self._fps_reportado: float = 0.0
        self._fps_calculado: float = 0.0
        self._timestamps_recientes: list = []
        self._nuevo_frame_evento: asyncio.Event = asyncio.Event()

    def recibir_frame(
        self,
        frame_bytes: bytes,
        fps: Optional[float] = None,
        ancho: Optional[int] = None,
        alto: Optional[int] = None
    ) -> bool:
        """
        Almacena el último frame recibido desde la Raspberry Pi,
        extrayendo la resolución nativa real del archivo JPEG y midiendo los FPS exactos.
        """
        try:
            # Validar y extraer resolución geométrica nativa directa de la imagen óptica
            with Image.open(io.BytesIO(frame_bytes)) as img:
                img.verify()
                w, h = img.size
                self._ancho = w
                self._alto = h

            ahora = time.time()
            self._timestamps_recientes.append(ahora)
            if len(self._timestamps_recientes) > 30:
                self._timestamps_recientes.pop(0)

            if len(self._timestamps_recientes) >= 2:
                duracion = self._timestamps_recientes[-1] - self._timestamps_recientes[0]
                if duracion > 0:
                    self._fps_calculado = (len(self._timestamps_recientes) - 1) / duracion

            if fps and fps > 0:
                self._fps_reportado = fps

            self._ultimo_frame = frame_bytes
            self._ultima_actualizacion = datetime.now(timezone.utc)
            self._frame_count += 1

            # Despertar de inmediato a los consumidores del stream MJPEG
            self._nuevo_frame_evento.set()
            return True
        except Exception:
            return False

    def obtener_fps(self) -> float:
        """Retorna la tasa de cuadros por segundo más fidedigna (medida o negociada por hardware)."""
        if self._fps_calculado > 0:
            return self._fps_calculado
        if self._fps_reportado > 0:
            return self._fps_reportado
        return 0.0

    def obtener_resolucion(self) -> str:
        """Retorna la resolución nativa de los fotogramas."""
        return f"{self._ancho}x{self._alto}"

    def obtener_ultimo_frame(self) -> bytes:
        """
        Retorna el frame más reciente transmitido por el sensor.
        Si no hay frame de hardware, genera dinámicamente un fotograma de prueba en Full HD (1080p).
        """
        if self._ultimo_frame:
            return self._ultimo_frame

        # Generar fotograma de lienzo en espera en Full HD
        ancho, alto = 1920, 1080
        img = Image.new("RGB", (ancho, alto), color=(15, 23, 18))
        draw = ImageDraw.Draw(img)

        # Rejilla técnica de alta definición
        paso = 80
        for x in range(0, ancho, paso):
            draw.line([(x, 0), (x, alto)], fill=(25, 38, 30), width=1)
        for y in range(0, alto, paso):
            draw.line([(0, y), (ancho, y)], fill=(25, 38, 30), width=1)

        # Mirilla central de enfoque
        cx, cy = ancho // 2, alto // 2
        r = 60
        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], outline=(34, 197, 94), width=2)
        draw.line([(cx - r - 25, cy), (cx + r + 25, cy)], fill=(34, 197, 94), width=2)
        draw.line([(cx, cy - r - 25), (cx, cy + r + 25)], fill=(34, 197, 94), width=2)

        # Textos informativos
        ahora = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        draw.text((40, 40), "TLALIXMATI - MONITOR OPTICO DE CAMPO", fill=(240, 253, 244))
        draw.text((40, 75), f"MONITOREO EN VIVO: {ahora}", fill=(134, 239, 172))
        
        draw.text((cx - 240, cy + 90), "CAMARA FISICA EN ESPERA DE CONEXION", fill=(239, 68, 68))
        draw.text((cx - 290, cy + 130), "Transmision automatica a resolucion nativa y FPS maximos", fill=(148, 163, 184))

        # Cuadro de estado inferior
        draw.rectangle([(30, alto - 60), (ancho - 30, alto - 20)], fill=(24, 34, 27), outline=(40, 56, 45))
        draw.text((50, alto - 48), "Sensor: CSI / USB  |  Tasa Maxima Autodetectable  |  Resolucion Full HD / 4K Dinamica", fill=(148, 163, 184))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        return buffer.getvalue()

    async def generar_stream(self):
        """
        Generador asíncrono para streaming MJPEG.
        Emite cada fotograma de inmediato al llegar desde el hardware sin demoras artificiales.
        """
        while True:
            try:
                # Esperar al siguiente fotograma entrante o tiempo límite de 0.5s si está en espera
                await asyncio.wait_for(self._nuevo_frame_evento.wait(), timeout=0.5)
                self._nuevo_frame_evento.clear()
            except asyncio.TimeoutError:
                pass

            frame = self.obtener_ultimo_frame()
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            )


# Instancia única del servicio de cámara
_camara_service_instancia: Optional[CamaraService] = None


def get_camara_service() -> CamaraService:
    global _camara_service_instancia
    if _camara_service_instancia is None:
        _camara_service_instancia = CamaraService()
    return _camara_service_instancia
