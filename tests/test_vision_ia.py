"""
Pruebas para el módulo de Visión Artificial e Inteligencia Artificial (PyTorch + YOLOv8).
"""

import io
import numpy as np
import pytest
from PIL import Image
from services.vision.app.core.config import cargar_configuracion_vision
from services.vision.app.modelos.detector_yolo import DetectorYOLO
from services.vision.app.modelos.clasificador_estres import ClasificadorEstresFoliar, CLASES_ESTRES
from services.vision.app.modelos.diagnostico import calcular_indices_vegetacion, anotar_fotograma
from services.vision.app.pipeline.recolector_dataset import RecolectorDataset
from services.vision.app.pipeline.orquestador_vision import OrquestadorVision


def test_configuracion_vision_detecta_dispositivo():
    """Verifica que la configuración de visión seleccione CUDA si existe GPU o CPU."""
    cfg = cargar_configuracion_vision()
    assert cfg.dispositivo in ("cuda:0", "cpu")
    assert cfg.umbral_confianza_yolo > 0.0
    assert cfg.umbral_anomalia_alerta > 0.0


def test_indices_vegetacion_calculo():
    """Verifica que el cálculo espectral distinga tonalidades verdes de amarillas."""
    # 1. Imagen verde saludable
    img_verde = np.zeros((100, 100, 3), dtype=np.uint8)
    img_verde[:, :] = (30, 180, 45) # BGR
    res_verde = calcular_indices_vegetacion(img_verde)
    assert res_verde["proporcion_verde"] > 0.8

    # 2. Imagen con clorosis (amarillenta)
    img_amarilla = np.zeros((100, 100, 3), dtype=np.uint8)
    img_amarilla[:, :] = (20, 200, 220) # BGR: Amarillo
    res_amarillo = calcular_indices_vegetacion(img_amarilla)
    assert res_amarillo["proporcion_clorosis"] > 0.5


def test_clasificador_estres_foliar_estructura_salida():
    """Verifica que la red neuronal PyTorch retorne el esquema de diagnóstico esperado."""
    clasificador = ClasificadorEstresFoliar(dispositivo="cpu")
    
    # Crear imagen de prueba sintética
    img_test = np.full((224, 224, 3), 100, dtype=np.uint8)
    res = clasificador.clasificar(img_test)

    assert "clase" in res
    assert res["clase"] in CLASES_ESTRES
    assert "confianza" in res
    assert "es_anomalia" in res
    assert "indice_anomalia" in res
    assert "probabilidad_sano" in res
    assert isinstance(res["desglose"], dict)


def test_evaluacion_calidad_recolector(tmp_path):
    """Verifica que el recolector de dataset evalúe la nitidez y descarte imágenes borrosas."""
    recolector = RecolectorDataset(directorio_base=str(tmp_path))
    
    # Imagen completamente negra (debe ser rechazada)
    img_negra = np.zeros((100, 100, 3), dtype=np.uint8)
    valido_negra, motivo = recolector.evaluar_calidad_fotograma(img_negra)
    assert valido_negra is False
    assert "oscura" in motivo

    # Imagen con textura y contraste (debe ser aceptada)
    img_textura = np.random.randint(50, 200, (200, 200, 3), dtype=np.uint8)
    valido_textura, _ = recolector.evaluar_calidad_fotograma(img_textura)
    assert valido_textura is True


def test_orquestador_procesamiento_fotograma():
    """Verifica que el orquestador ejecute el pipeline completo sobre un fotograma."""
    orquestador = OrquestadorVision()
    
    # Generar fotograma JPEG de prueba
    img_pil = Image.new("RGB", (320, 240), color=(34, 139, 34))
    buf = io.BytesIO()
    img_pil.save(buf, format="JPEG")
    jpeg_bytes = buf.getvalue()

    resultado = orquestador.procesar_fotograma(jpeg_bytes)
    assert resultado["exito"] is True
    assert "diagnostico" in resultado
    assert "fotograma_anotado_bytes" in resultado
    assert len(resultado["fotograma_anotado_bytes"]) > 100
