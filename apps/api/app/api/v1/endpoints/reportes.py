"""
Endpoints para la consulta, generación y descarga de reportes PDF (/api/v1/reportes).
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, Field

from apps.api.app.services.reporte_service import get_reporte_service

router = APIRouter(prefix="/reportes", tags=["Reportes Agronómicos"])


class GenerarReporteRequest(BaseModel):
    titulo: Optional[str] = Field(default="Reporte Agronómico Periódico", description="Título del informe")
    notas: Optional[str] = Field(default="", description="Observaciones adicionales de campo")


class ReporteInfoResponse(BaseModel):
    id: str
    titulo: str
    generado_en: str
    tamano_bytes: int
    nombre_archivo: str
    fases_resumen: str
    url_descarga: str


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
    description="Crea un reporte agronómico que incluye fases por defecto, metadatos y la captura óptica más reciente."
)
async def generar_reporte(datos: Optional[GenerarReporteRequest] = None):
    """Genera y almacena un nuevo PDF agronómico."""
    srv = get_reporte_service()
    titulo = datos.titulo if datos and datos.titulo else "Reporte Agronómico Periódico"
    notas = datos.notas if datos and datos.notas else ""
    return srv.generar_reporte(titulo=titulo, notas=notas)


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
