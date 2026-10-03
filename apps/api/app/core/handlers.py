"""
Manejadores globales de excepciones para FastAPI.
Garantizan que todas las respuestas de error sigan el esquema uniforme ErrorResponse en español.
"""

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from apps.api.app.core.exceptions import TlalixmatiException
from packages.schemas.error import DetalleError, ErrorResponse


async def tlalixmati_exception_handler(request: Request, exc: TlalixmatiException) -> JSONResponse:
    """Maneja todas las excepciones del dominio Tlalixmati."""
    contenido = ErrorResponse(
        error=DetalleError(
            codigo=exc.codigo,
            mensaje=exc.mensaje,
            detalles=exc.detalles
        )
    ).model_dump()
    return JSONResponse(status_code=exc.status_code, content=contenido)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Maneja errores de validación de esquemas Pydantic / parámetros de request."""
    detalles_formateados = []
    for err in exc.errors():
        campo = " -> ".join(str(loc) for loc in err.get("loc", []))
        detalles_formateados.append({
            "campo": campo,
            "motivo": err.get("msg", "Valor no válido"),
            "tipo": err.get("type", "valor_invalido")
        })

    contenido = ErrorResponse(
        error=DetalleError(
            codigo="VALIDACION_DATOS_ERROR",
            mensaje="La solicitud enviada no cumple con la estructura o tipos requeridos.",
            detalles=detalles_formateados
        )
    ).model_dump()
    return JSONResponse(status_code=422, content=contenido)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Maneja errores HTTP genéricos de Starlette / FastAPI (ej. 404 ruta no encontrada)."""
    codigo = f"HTTP_{exc.status_code}"
    mensaje = exc.detail if isinstance(exc.detail, str) else "Error al procesar la solicitud HTTP"
    
    if exc.status_code == 404 and mensaje == "Not Found":
        mensaje = f"La ruta solicitada '{request.url.path}' no existe en la API de Tlalixmati."
        codigo = "RUTA_NO_ENCONTRADA"

    contenido = ErrorResponse(
        error=DetalleError(
            codigo=codigo,
            mensaje=mensaje,
            detalles=None
        )
    ).model_dump()
    return JSONResponse(status_code=exc.status_code, content=contenido)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Maneja errores no capturados o fallos de ejecución internos."""
    contenido = ErrorResponse(
        error=DetalleError(
            codigo="ERROR_INTERNO_SERVIDOR",
            mensaje="Ocurrió un error inesperado al procesar la solicitud en el servidor.",
            detalles=str(exc) if "DEBUG" in request.headers else None
        )
    ).model_dump()
    return JSONResponse(status_code=500, content=contenido)
