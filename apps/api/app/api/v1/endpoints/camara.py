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
    fps: float
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
    description="Permite que el agente físico en la Raspberry Pi envíe cada cuadro capturado por la cámara real."
)
async def recibir_frame(request: Request):
    """Recibe los bytes binarios JPEG del fotograma."""
    body = await request.body()
    if body and len(body) > 100:
        srv = get_camara_service()
        es_valido = srv.recibir_frame(body)
        if es_valido:
            return {"recibido": True, "tamano_bytes": len(body)}
        return {"recibido": False, "motivo": "El archivo enviado no es una imagen válida"}
    return {"recibido": False, "motivo": "Payload vacío o insuficiente"}


@router.get(
    "/estado",
    summary="Consultar estado de la cámara en vivo",
    description="Indica si la cámara está transmitiendo activamente fotogramas de campo."
)
async def estado_camara():
    """Informa sobre la actividad reciente de la cámara."""
    srv = get_camara_service()
    activa = srv._ultimo_frame is not None
    return {
        "conectada": activa,
        "fps": 10.0 if activa else 0.0,
        "frames_totales": srv._frame_count,
        "ultima_actualizacion": srv._ultima_actualizacion.isoformat() if srv._ultima_actualizacion else None,
        "mensaje": "Cámara transmitiendo en vivo" if activa else "Cámara no conectada"
    }
