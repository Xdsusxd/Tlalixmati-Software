"""
Endpoints para la cámara en tiempo real y streaming (/api/v1/camara).
"""

from fastapi import APIRouter, File, Request, Response, UploadFile, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from apps.api.app.services.camara_service import get_camara_service

router = APIRouter(prefix="/camara", tags=["Cámara en Vivo"])


class CamaraEstadoResponse(BaseModel):
    conectada: bool = False
    fps: float = 0.0
    ancho: int = 0
    alto: int = 0
    resolucion: str = "En espera de hardware"
    frames_totales: int = 0
    ultima_actualizacion: Optional[str] = None
    mensaje: str


@router.get(
    "/stream",
    summary="Transmisión en vivo de la cámara (MJPEG)",
    description="Provee un flujo continuo de video MJPEG para incrustar directamente en la interfaz web."
)
async def video_stream():
    """Retorna un stream multipart/x-mixed-replace compatible con la etiqueta <img> de HTML."""
    srv = get_camara_service()
    return StreamingResponse(
        srv.generar_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.post(
    "/frame",
    status_code=status.HTTP_200_OK,
    summary="Ingesta de fotograma desde Raspberry Pi",
    description="Permite que el agente físico en la Raspberry Pi envíe cada cuadro capturado por la cámara real a su resolución y tasa nativas."
)
async def recibir_frame(request: Request):
    """Recibe los bytes binarios JPEG del fotograma y metadatos de tasa nativa."""
    body = await request.body()
    if body and len(body) > 100:
        fps_header = request.headers.get("X-FPS")
        fps_val: Optional[float] = None
        if fps_header:
            try:
                fps_val = float(fps_header)
            except ValueError:
                fps_val = None

        srv = get_camara_service()
        es_valido = srv.recibir_frame(body, fps=fps_val)
        if es_valido:
            return {
                "recibido": True,
                "tamano_bytes": len(body),
                "ancho": srv._ancho,
                "alto": srv._alto,
                "fps": round(srv.obtener_fps(), 1),
            }
        return {"recibido": False, "motivo": "El archivo enviado no es una imagen válida"}
    return {"recibido": False, "motivo": "Payload vacío o insuficiente"}


@router.get(
    "/estado",
    response_model=CamaraEstadoResponse,
    summary="Consultar estado de la cámara en vivo",
    description="Indica si la cámara está transmitiendo activamente, con su resolución y tasa de FPS nativos."
)
async def estado_camara():
    """Informa sobre la actividad reciente, resolución y FPS de la cámara."""
    srv = get_camara_service()
    activa = srv._ultimo_frame is not None
    fps_actual = round(srv.obtener_fps(), 1) if activa else 0.0

    return CamaraEstadoResponse(
        conectada=activa,
        fps=fps_actual,
        ancho=srv._ancho if activa else 0,
        alto=srv._alto if activa else 0,
        resolucion=srv.obtener_resolucion() if activa else "En espera de hardware",
        frames_totales=srv._frame_count,
        ultima_actualizacion=srv._ultima_actualizacion.isoformat() if srv._ultima_actualizacion else None,
        mensaje=(
            f"Cámara transmitiendo activamente a {fps_actual} FPS ({srv._ancho}x{srv._alto})"
            if activa else
            "Cámara física en espera de conexión"
        )
    )
