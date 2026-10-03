"""
Pruebas para el sistema de autenticación de contraseña global y sesiones por cookie.
"""

from fastapi.testclient import TestClient
from apps.api.app.api.v1.endpoints.auth import NOMBRE_COOKIE_SESION


def test_login_exitoso_establece_cookie(cliente: TestClient):
    """Verifica que la contraseña correcta establezca la cookie HttpOnly."""
    respuesta = cliente.post("/api/v1/auth/login", json={"password": "Tlalixmati2026!"})
    assert respuesta.status_code == 200
    data = respuesta.json()
    assert data["autenticado"] is True
    assert NOMBRE_COOKIE_SESION in respuesta.cookies


def test_login_invalido_retorna_401(cliente: TestClient):
    """Verifica que una contraseña incorrecta sea rechazada con 401."""
    respuesta = cliente.post("/api/v1/auth/login", json={"password": "clave_equivocada"})
    assert respuesta.status_code == 401
    assert "error" in respuesta.json()


def test_flujo_completo_sesion_y_logout(cliente: TestClient):
    """Verifica inicio de sesión, comprobación de estado y posterior cierre de sesión."""
    # 1. Estado inicial sin cookie
    r_estado1 = cliente.get("/api/v1/auth/estado")
    assert r_estado1.status_code == 200
    assert r_estado1.json()["autenticado"] is False

    # 2. Login correcto
    r_login = cliente.post("/api/v1/auth/login", json={"password": "Tlalixmati2026!"})
    assert r_login.status_code == 200
    cookie_valor = r_login.cookies[NOMBRE_COOKIE_SESION]

    # 3. Estado con cookie enviada
    cliente.cookies.set(NOMBRE_COOKIE_SESION, cookie_valor)
    r_estado2 = cliente.get("/api/v1/auth/estado")
    assert r_estado2.status_code == 200
    assert r_estado2.json()["autenticado"] is True

    # 4. Logout
    r_logout = cliente.post("/api/v1/auth/logout")
    assert r_logout.status_code == 200
    assert r_logout.json()["autenticado"] is False
