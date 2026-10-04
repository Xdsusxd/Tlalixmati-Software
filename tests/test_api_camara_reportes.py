"""
Pruebas para los endpoints de cámara en tiempo real y generación de reportes en PDF.
"""

from fastapi.testclient import TestClient


def test_camara_estado_inicial(cliente: TestClient):
    """Verifica que el estado de la cámara indique correctamente si está conectada o no."""
    res = cliente.get("/api/v1/camara/estado")
    assert res.status_code == 200
    data = res.json()
    assert "conectada" in data
    assert "fps" in data


def test_camara_recibir_frame_exitoso(cliente: TestClient):
    """Verifica que la API acepte fotogramas binarios JPEG enviados por la Raspberry Pi."""
    from PIL import Image
    import io

    # Generar un frame JPEG válido con Pillow
    img = Image.new("RGB", (120, 120), color=(20, 83, 45))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    valid_frame = buf.getvalue()

    res = cliente.post("/api/v1/camara/frame", content=valid_frame)
    assert res.status_code == 200
    assert res.json()["recibido"] is True

    # Verificar que el estado cambie a activa
    res_est = cliente.get("/api/v1/camara/estado")
    assert res_est.json()["conectada"] is True


def test_listar_reportes_iniciales(cliente: TestClient):
    """Verifica que el servicio retorne la lista de reportes disponibles."""
    res = cliente.get("/api/v1/reportes")
    assert res.status_code == 200
    lista = res.json()
    assert isinstance(lista, list)


def test_generar_y_descargar_nuevo_reporte_pdf(cliente: TestClient):
    """Verifica la generación de un PDF con fases por default y su descarga en binario."""
    # 1. Generar nuevo reporte
    payload = {
        "titulo": "Reporte de Cierre de Ciclo",
        "notas": "Excelente vigor vegetal observado en campo."
    }
    res_gen = cliente.post("/api/v1/reportes/generar", json=payload)
    assert res_gen.status_code == 201
    nuevo_reporte = res_gen.json()
    reporte_id = nuevo_reporte["id"]
    assert "reporte_" in nuevo_reporte["nombre_archivo"]

    # 2. Descargar el reporte en PDF
    res_down = cliente.get(f"/api/v1/reportes/{reporte_id}/descargar")
    assert res_down.status_code == 200
    assert res_down.headers["content-type"] == "application/pdf"
    assert res_down.content.startswith(b"%PDF-")


def test_disparo_automatico_alerta_planta_en_mal_estado(cliente: TestClient):
    """Verifica que el sistema genere automáticamente un PDF de alerta si se detecta planta en mal estado."""
    payload = {"detalle_anomalia": "Marchitamiento foliar y estrés hídrico severo detectado."}
    res = cliente.post("/api/v1/reportes/alerta-automatica", json=payload)
    assert res.status_code == 201
    alerta = res.json()
    assert alerta["origen"] == "automatico"
    assert alerta["alerta_detectada"] is True
    assert "ALERTA" in alerta["fases_resumen"]

    # Descarga directa del reporte más reciente (que ahora es la alerta)
    res_rec = cliente.get("/api/v1/reportes/reciente/descargar")
    assert res_rec.status_code == 200
    assert res_rec.headers["content-type"] == "application/pdf"
    assert res_rec.content.startswith(b"%PDF-")

