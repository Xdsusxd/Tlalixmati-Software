"""
Módulo de seguridad para autenticación con contraseña global única.

Reglas:
- Una sola contraseña de sistema verificada mediante hash bcrypt.
- Sesiones administradas mediante cookie segura HttpOnly.
- Sin Supabase Auth ni almacenamiento en texto plano.
"""

import hmac
import hashlib
import time
from typing import Optional
import bcrypt

from apps.api.app.core.config import get_configuracion

# Duración de la sesión: 7 días en segundos
DURACION_SESION_SEGUNDOS = 7 * 24 * 3600


def verificar_password_global(password_plano: str) -> bool:
    """Verifica si la contraseña provista coincide con el hash configurado en .env."""
    cfg = get_configuracion()
    if not cfg.password_hash:
        return False
    try:
        return bcrypt.checkpw(
            password_plano.encode("utf-8"),
            cfg.password_hash.encode("utf-8")
        )
    except Exception:
        return False


def generar_firma_sesion(timestamp_expiracion: int, secreto: str) -> str:
    """Genera una firma HMAC-SHA256 para validar la autenticidad de la cookie de sesión."""
    mensaje = f"tlalixmati_session:{timestamp_expiracion}"
    return hmac.new(
        secreto.encode("utf-8"),
        mensaje.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()


def crear_cookie_sesion() -> str:
    """Crea el valor firmado para la cookie de sesión con tiempo de expiración."""
    cfg = get_configuracion()
    secreto = cfg.session_secret or "secreto_provisional_tlalixmati_32caracteres"
    expira = int(time.time()) + DURACION_SESION_SEGUNDOS
    firma = generar_firma_sesion(expira, secreto)
    return f"{expira}:{firma}"


def validar_cookie_sesion(cookie_valor: Optional[str]) -> bool:
    """Valida la integridad y expiración de la cookie de sesión."""
    if not cookie_valor or ":" not in cookie_valor:
        return False

    try:
        partes = cookie_valor.split(":")
        if len(partes) != 2:
            return False
        expira_str, firma = partes
        expira = int(expira_str)

        # Verificar si expiró
        if time.time() > expira:
            return False

        # Verificar firma criptográfica
        cfg = get_configuracion()
        secreto = cfg.session_secret or "secreto_provisional_tlalixmati_32caracteres"
        firma_esperada = generar_firma_sesion(expira, secreto)

        return hmac.compare_digest(firma, firma_esperada)
    except Exception:
        return False
