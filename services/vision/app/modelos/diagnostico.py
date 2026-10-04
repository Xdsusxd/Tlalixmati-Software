"""
Módulo de diagnóstico agronómico híbrido.
Combina análisis espectral colorimétrico (ExG / ExR) con la inferencia de la red neuronal.
"""

from typing import Dict, Optional, Tuple
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


def calcular_indices_vegetacion(imagen_bgr: np.ndarray) -> Dict[str, float]:
    """
    Calcula índices agronómicos ópticos estándar:
    - ExG (Excess Green Index = 2*G - R - B): Mide densidad y salud de clorofila.
    - ExR (Excess Red Index = 1.4*R - G): Detecta amarillamiento / clorosis y suelo expuesto.
    - Proporción de verde foliar vs tejido marchito o clorótico.
    """
    if imagen_bgr is None or imagen_bgr.size == 0:
        return {"exg_medio": 0.0, "proporcion_clorosis": 0.0, "vigor_color": 0.0}

    # Normalizar canales de color entre 0.0 y 1.0
    img_float = imagen_bgr.astype(np.float32) / 255.0
    b = img_float[:, :, 0]
    g = img_float[:, :, 1]
    r = img_float[:, :, 2]

    # Suma total para canales normalizados
    total = r + g + b + 1e-6
    rn = r / total
    gn = g / total
    bn = b / total

    # Excess Green Index
    exg = 2.0 * gn - rn - bn

    # Espacio HSV para evaluar tono foliar
    hsv = cv2.cvtColor(imagen_bgr, cv2.COLOR_BGR2HSV)
    tono = hsv[:, :, 0]       # Hue (0 a 180 en OpenCV)
    saturacion = hsv[:, :, 1] # Saturation
    brillo = hsv[:, :, 2]     # Value

    # Máscara de vegetación verde saludable (Hue aprox 35 a 85)
    mascara_verde = (tono >= 35) & (tono <= 85) & (saturacion > 40)
    # Máscara de clorosis / amarillamiento foliar (Hue aprox 18 a 34 con saturación)
    mascara_amarillo = (tono >= 18) & (tono < 35) & (saturacion > 40)
    # Máscara de necrosis / quemadura marrón (Hue bajo con brillo bajo o moderado)
    mascara_necrosis = (tono <= 18) & (saturacion > 40) & (brillo < 150)

    pixeles_vegetales = np.sum(mascara_verde | mascara_amarillo | mascara_necrosis)
    if pixeles_vegetales > 0:
        pct_clorosis = float(np.sum(mascara_amarillo) / pixeles_vegetales)
        pct_necrosis = float(np.sum(mascara_necrosis) / pixeles_vegetales)
        pct_verde = float(np.sum(mascara_verde) / pixeles_vegetales)
    else:
        pct_clorosis = 0.0
        pct_necrosis = 0.0
        pct_verde = 0.0

    exg_promedio = float(np.mean(exg))

    return {
        "exg_medio": round(exg_promedio, 3),
        "proporcion_verde": round(pct_verde, 3),
        "proporcion_clorosis": round(pct_clorosis, 3),
        "proporcion_necrosis": round(pct_necrosis, 3),
    }


def anotar_fotograma(
    imagen_bgr: np.ndarray,
    detecciones: list,
    diagnostico: Dict
) -> np.ndarray:
    """
    Dibuja anotaciones legibles y claras sobre el fotograma:
    - Verde si la planta está sana.
    - Rojo/Naranja si se detecta clorosis, estrés hídrico o anomalía.
    """
    anotada = imagen_bgr.copy()
    es_alerta = diagnostico.get("es_anomalia", False)
    clase = diagnostico.get("clase", "SANO")
    confianza = diagnostico.get("confianza", 0.0)

    color_borde = (34, 197, 94) if not es_alerta else (0, 0, 220) # BGR: Verde o Rojo vivo
    
    # Dibujar cajas de especímenes detectados
    for det in detecciones:
        caja = det["caja"]
        x1, y1, x2, y2 = caja
        cv2.rectangle(anotada, (x1, y1), (x2, y2), color_borde, 2)

    # Banner superior con diagnóstico agronómico
    h, w = anotada.shape[:2]
    overlay = anotada.copy()
    cv2.rectangle(overlay, (0, 0), (w, 50), (18, 25, 20), -1)
    cv2.addWeighted(overlay, 0.75, anotada, 0.25, 0, anotada)

    estado_texto = "DIAGNOSTICO: FOLLAJE EN BUEN ESTADO" if not es_alerta else f"ALERTA: {clase} DETECTADA"
    cv2.putText(anotada, estado_texto, (20, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    return anotada
