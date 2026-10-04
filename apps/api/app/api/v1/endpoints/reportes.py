"""
Endpoints para la gestión, generación y descarga de reportes PDF (/api/v1/reportes).
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, Field

from apps.api.app.services.reporte_service import get_reporte_service

router = APIRouter(prefix="/reportes", tags=["Reportes Agronómicos"])


class GenerarReporteRequest(BaseModel):
    titulo: Optional[str] = Field(default="Informe del Cultivo", description="Título del informe")
    notas: Optional[str] = Field(default="", description="Observaciones adicionales de campo")
    origen: Optional[str] = Field(default="manual", description="Origen: 'manual' o 'automatico'")
    alerta_detectada: Optional[bool] = Field(default=False, description="Indica si se detectó anomalía")
    detalle_anomalia: Optional[str] = Field(default="", description="Descripción de la anomalía")


class AlertaAutomaticaRequest(BaseModel):
    detalle_anomalia: Optional[str] = Field(
        default="Detección óptica: Hojas marchitas con signos visibles de clorosis.",
        description="Descripción de la anomalía observada en la planta"
    )


class ReporteInfoResponse(BaseModel):
    id: str
    titulo: str
    generado_en: str
    origen: str
    alerta_detectada: bool
    tamano_bytes: int
    nombre_archivo: str
    fases_resumen: str
    url_descarga: str
    supabase_url: Optional[str] = None
    almacenado_en_supabase: bool = False


@router.get(
    "",
    response_model=List[ReporteInfoResponse],
    summary="Listar reportes anteriores",
    description="Retorna el historial de reportes generados con sus metadatos y enlaces de descarga."
)
async def listar_reportes():
    """Consulta la lista de informes PDF disponibles para descarga."""
    srv = get_reporte_service()
    return srv.listar_reportes()


@router.post(
    "/generar",
    response_model=ReporteInfoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generar nuevo reporte en PDF",
    description="Crea un reporte agronómico manual o automático, subiéndolo a Supabase Storage."
)
async def generar_reporte(datos: Optional[GenerarReporteRequest] = None):
    """Genera y almacena un nuevo PDF agronómico."""
    srv = get_reporte_service()
    titulo = datos.titulo if datos and datos.titulo else "Informe del Cultivo"
    notas = datos.notas if datos and datos.notas else ""
    origen = datos.origen if datos and datos.origen else "manual"
    alerta = datos.alerta_detectada if datos else False
    detalle = datos.detalle_anomalia if datos and datos.detalle_anomalia else ""

    return srv.generar_reporte(
        titulo=titulo,
        notas=notas,
        origen=origen,
        alerta_detectada=alerta,
        detalle_anomalia=detalle,
    )


@router.post(
    "/alerta-automatica",
    response_model=ReporteInfoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Disparo automático de reporte por planta en mal estado",
    description="Genera de manera automática un informe de alerta agronómica cuando se detecta una anomalía vegetal."
)
async def disparar_alerta_automatica(datos: Optional[AlertaAutomaticaRequest] = None):
    """Dispara la generación automática por detección de planta en mal estado."""
    srv = get_reporte_service()
    detalle = datos.detalle_anomalia if datos and datos.detalle_anomalia else "Signos de estrés foliar y deficiencia hídrica detectados en campo."
    return srv.disparar_alerta_automatica(detalle=detalle)


@router.get(
    "/reciente/descargar",
    summary="Descargar el reporte más reciente en PDF",
    description="Descarga directamente el último informe técnico generado con fotos y fases del cultivo."
)
async def descargar_reporte_reciente():
    """Retorna el PDF más reciente disponible."""
    srv = get_reporte_service()
    reportes = srv.listar_reportes()
    if not reportes:
        nuevo = srv.generar_reporte(titulo="Informe del Cultivo Reciente")
        reporte_id = nuevo["id"]
    else:
        reporte_id = reportes[0]["id"]

    pdf_bytes = srv.obtener_pdf_bytes(reporte_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_reciente_tlalixmati.pdf"'
        }
    )


@router.get(
    "/{reporte_id}/descargar",
    summary="Descargar reporte en formato PDF",
    description="Descarga el archivo binario PDF correspondiente al identificador provisto."
)
async def descargar_reporte(reporte_id: str):
    """Retorna el flujo binario del archivo PDF."""
    srv = get_reporte_service()
    pdf_bytes = srv.obtener_pdf_bytes(reporte_id)
    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reporte con ID '{reporte_id}' no encontrado en el sistema."
        )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_tlalixmati_{reporte_id[:8]}.pdf"'
        }
    )
