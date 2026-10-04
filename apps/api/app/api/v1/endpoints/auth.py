"""
Endpoints de autenticación y control de sesión (/api/v1/auth).

Controla el acceso seguro mediante una contraseña global única y cookie HttpOnly.
"""

from fastapi import APIRouter, Cookie, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from typing import Optional

from apps.api.app.core.security import (
    DURACION_SESION_SEGUNDOS,
    crear_cookie_sesion,
    validar_cookie_sesion,
    verificar_password_global,
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])

NOMBRE_COOKIE_SESION = "tlalixmati_session"


class LoginRequest(BaseModel):
    password: str = Field(..., min_length=1, description="Contraseña global de acceso al sistema")


class AuthResponse(BaseModel):
    autenticado: bool
    mensaje: str


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Iniciar sesión con contraseña global",
    description="Valida la contraseña global de la plataforma y establece una cookie HttpOnly segura."
)
async def login(datos: LoginRequest, request: Request, response: Response):
    """Verifica el hash bcrypt de la contraseña y genera la cookie de sesión."""
    if not verificar_password_global(datos.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña de acceso incorrecta."
        )

    valor_cookie = crear_cookie_sesion()
    
    # Detección automática de HTTPS para despliegue en dominio público
    import os
    es_https = (
        request.headers.get("x-forwarded-proto", "").lower() == "https" or
        request.url.scheme == "https" or
        os.getenv("COOKIE_SECURE", "false").lower() in ("true", "1")
    )

    # Cookie HttpOnly, SameSite Lax, duración 7 días
    response.set_cookie(
        key=NOMBRE_COOKIE_SESION,
        value=valor_cookie,
        max_age=DURACION_SESION_SEGUNDOS,
        httponly=True,
        samesite="lax",
        secure=es_https,
        path="/"
    )

    return AuthResponse(
        autenticado=True,
        mensaje="Sesión iniciada correctamente."
    )


@router.post(
    "/logout",
    response_model=AuthResponse,
    summary="Cerrar sesión",
    description="Invalida la cookie de sesión en el cliente."
)
async def logout(response: Response):
    """Elimina la cookie de sesión estableciendo max_age en 0."""
    response.delete_cookie(
        key=NOMBRE_COOKIE_SESION,
        path="/"
    )
    return AuthResponse(
        autenticado=False,
        mensaje="Sesión cerrada correctamente."
    )


@router.get(
    "/estado",
    response_model=AuthResponse,
    summary="Verificar estado de autenticación",
    description="Comprueba si la sesión activa del usuario es válida mediante su cookie HttpOnly."
)
async def verificar_estado(request: Request):
    """Comprueba la firma y vigencia de la cookie tlalixmati_session."""
    cookie_valor = request.cookies.get(NOMBRE_COOKIE_SESION)
    es_valida = validar_cookie_sesion(cookie_valor)

    return AuthResponse(
        autenticado=es_valida,
        mensaje="Sesión activa y válida." if es_valida else "Sesión no autenticada o expirada."
    )
