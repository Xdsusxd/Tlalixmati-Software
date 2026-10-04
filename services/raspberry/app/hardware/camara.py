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
    def __init__(
        self,
        indice_camara: int = 0,
        ancho: Optional[int] = None,
        alto: Optional[int] = None,
        fps_objetivo: Optional[float] = None
    ):
        self.indice_camara = indice_camara
        self.ancho_solicitado = ancho
        self.alto_solicitado = alto
        self.fps_solicitado = fps_objetivo
        
        # Valores efectivos negociados con el hardware físico
        self.ancho: int = ancho or 1920
        self.alto: int = alto or 1080
        self.fps: float = fps_objetivo or 30.0
        self.fps_real: float = 0.0
        
        self._camara = None
        self._tiene_opencv = False
        self._ultimo_tiempo_captura: Optional[float] = None
        self._intentar_cargar_opencv()

    def _intentar_cargar_opencv(self):
        try:
            import cv2
            self.cv2 = cv2
            self._tiene_opencv = True
        except ImportError:
            self._tiene_opencv = False

    def _autodetectar_capacidades_maximas(self):
        """
        Sonda y configura automáticamente la resolución máxima y la tasa máxima de FPS
        que el sensor físico de la cámara y su controlador admiten.
        """
        if not self._camara or not self._camara.isOpened():
            return

        # 1. Configurar códec MJPEG si está disponible para evitar cuellos de botella del bus USB
        try:
            fourcc_mjpg = self.cv2.VideoWriter_fourcc(*"MJPG")
            self._camara.set(self.cv2.CAP_PROP_FOURCC, fourcc_mjpg)
        except Exception:
            pass

        # 2. Si el usuario no forzó resolución específica, sondear resolución máxima soportada
        if not self.ancho_solicitado or not self.alto_solicitado:
            # Lista de resoluciones estándar de alta fidelidad para probar en orden descendente
            resoluciones_candidatas = [
                (3840, 2160), # 4K Ultra HD
                (2560, 1440), # 2K QHD
                (1920, 1080), # Full HD
                (1280, 720),  # HD 720p
                (1024, 768),  # XGA
                (800, 600),   # SVGA
                (640, 480),   # VGA
            ]
            
            ancho_max = 640
            alto_max = 480
            
            for w, h in resoluciones_candidatas:
                self._camara.set(self.cv2.CAP_PROP_FRAME_WIDTH, w)
                self._camara.set(self.cv2.CAP_PROP_FRAME_HEIGHT, h)
                w_real = int(self._camara.get(self.cv2.CAP_PROP_FRAME_WIDTH))
                h_real = int(self._camara.get(self.cv2.CAP_PROP_FRAME_HEIGHT))
                if w_real >= w and h_real >= h:
                    ancho_max = w_real
                    alto_max = h_real
                    break
                elif w_real > ancho_max:
                    ancho_max = w_real
                    alto_max = h_real

            # Establecer y confirmar la resolución máxima hallada
            self._camara.set(self.cv2.CAP_PROP_FRAME_WIDTH, ancho_max)
            self._camara.set(self.cv2.CAP_PROP_FRAME_HEIGHT, alto_max)
            self.ancho = int(self._camara.get(self.cv2.CAP_PROP_FRAME_WIDTH)) or ancho_max
            self.alto = int(self._camara.get(self.cv2.CAP_PROP_FRAME_HEIGHT)) or alto_max
        else:
            self._camara.set(self.cv2.CAP_PROP_FRAME_WIDTH, self.ancho_solicitado)
            self._camara.set(self.cv2.CAP_PROP_FRAME_HEIGHT, self.alto_solicitado)
            self.ancho = int(self._camara.get(self.cv2.CAP_PROP_FRAME_WIDTH)) or self.ancho_solicitado
            self.alto = int(self._camara.get(self.cv2.CAP_PROP_FRAME_HEIGHT)) or self.alto_solicitado

        # 3. Detectar y solicitar FPS máximos soportados
        if not self.fps_solicitado:
            # Solicitar 60 FPS por defecto al controlador
            self._camara.set(self.cv2.CAP_PROP_FPS, 60.0)
            fps_cam = float(self._camara.get(self.cv2.CAP_PROP_FPS))
            if fps_cam <= 0 or fps_cam > 120.0:
                # Probar 30 FPS estándar si 60 no reporta valor válido
                self._camara.set(self.cv2.CAP_PROP_FPS, 30.0)
                fps_cam = float(self._camara.get(self.cv2.CAP_PROP_FPS))
            self.fps = fps_cam if fps_cam > 0 else 30.0
        else:
            self._camara.set(self.cv2.CAP_PROP_FPS, float(self.fps_solicitado))
            fps_cam = float(self._camara.get(self.cv2.CAP_PROP_FPS))
            self.fps = fps_cam if fps_cam > 0 else float(self.fps_solicitado)

    def iniciar(self) -> bool:
        """Inicializa la captura de video físico y autodetecta resolución y FPS máximos."""
        if self._tiene_opencv:
            try:
                self._camara = self.cv2.VideoCapture(self.indice_camara)
                if self._camara.isOpened():
                    self._autodetectar_capacidades_maximas()
                    return True
            except Exception:
                self._camara = None
        return False

    def capturar_frame_jpeg(self) -> Optional[bytes]:
        """
        Captura un fotograma óptico del hardware real y lo codifica en formato JPEG.
        Calcula dinámicamente la tasa efectiva de FPS en tiempo de ejecución.
        Si la cámara física no está conectada, genera un fotograma técnico en Full HD.
        """
        ahora = time.time()
        if self._ultimo_tiempo_captura is not None:
            dt = ahora - self._ultimo_tiempo_captura
            if dt > 0:
                fps_inst = 1.0 / dt
                self.fps_real = 0.85 * self.fps_real + 0.15 * fps_inst if self.fps_real > 0 else fps_inst
        self._ultimo_tiempo_captura = ahora

        # 1. Si OpenCV está activo y la cámara abrió correctamente
        if self._tiene_opencv and self._camara and self._camara.isOpened():
            ret, frame = self._camara.read()
            if ret and frame is not None:
                # Comprimir a alta calidad óptica (85%)
                ret_encode, buf = self.cv2.imencode(".jpg", frame, [self.cv2.IMWRITE_JPEG_QUALITY, 85])
                if ret_encode:
                    return buf.tobytes()

        # 2. Generar fotograma técnico informativo de espera en alta resolución (Full HD)
        ancho_canvas = self.ancho if self.ancho >= 1280 else 1920
        alto_canvas = self.alto if self.alto >= 720 else 1080
        img = Image.new("RGB", (ancho_canvas, alto_canvas), color=(14, 28, 20))
        draw = ImageDraw.Draw(img)

        # Retícula técnica de alta resolución
        paso_grid = 80
        for x in range(0, ancho_canvas, paso_grid):
            draw.line([(x, 0), (x, alto_canvas)], fill=(22, 45, 32), width=1)
        for y in range(0, alto_canvas, paso_grid):
            draw.line([(0, y), (ancho_canvas, y)], fill=(22, 45, 32), width=1)

        # Mirilla central de calibración
        cx, cy = ancho_canvas // 2, alto_canvas // 2
        r = 60
        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], outline=(34, 197, 94), width=2)
        draw.line([(cx - r - 20, cy), (cx + r + 20, cy)], fill=(34, 197, 94), width=2)
        draw.line([(cx, cy - r - 20), (cx, cy + r + 20)], fill=(34, 197, 94), width=2)

        timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        draw.text((40, 40), "TLALIXMATI - NODO RASPBERRY PI (CAMPO)", fill=(240, 253, 244))
        draw.text((40, 70), f"MONITOREO EN VIVO: {timestamp_str}", fill=(134, 239, 172))

        draw.text((cx - 210, cy + 90), "CAMARA FISICA EN ESPERA DE CONEXION", fill=(234, 179, 8))
        draw.text((cx - 260, cy + 120), "Autodeteccion nativa de resolucion maxima y FPS activada", fill=(148, 163, 184))
        draw.text((cx - 230, cy + 150), f"Modo configurado: Maxima capacidad nativa (Sensor CSI/USB)", fill=(203, 213, 225))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        return buffer.getvalue()

    def liberar(self):
        """Libera los recursos de hardware de la cámara."""
        if self._camara:
            try:
                self._camara.release()
            except Exception:
                pass
            self._camara = None
