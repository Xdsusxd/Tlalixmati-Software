# Entrenamiento de Modelos de IA (Tlalixmati)

## Resumen de Entrenamientos Realizados

Ambos modelos de Inteligencia Artificial han sido entrenados exitosamente en la GPU **NVIDIA GeForce RTX 4050 Laptop GPU** con aceleración CUDA 12.1.

---

## 1. Clasificador de Salud Foliar (PyTorch / MobileNetV3)

### Parámetros de Entrenamiento
| Parámetro | Valor |
|-----------|-------|
| Arquitectura | MobileNetV3-Small + cabeza personalizada |
| Épocas | 15 |
| Batch Size | 16 |
| Learning Rate | 1e-4 (CosineAnnealingLR scheduler) |
| Optimizador | AdamW (weight_decay=0.01) |
| Dispositivo | NVIDIA RTX 4050 (cuda:0) |
| Duración | 137.2 segundos |

### Curva de Aprendizaje
| Época | Train Loss | Train Acc | Val Loss | Val Acc |
|-------|-----------|-----------|---------|---------|
| 1 | 0.7819 | 81.3% | 0.2107 | 94.3% |
| 3 | 0.0991 | 96.8% | 0.0280 | 99.7% |
| 4 | 0.0604 | 98.2% | 0.0174 | **100.0%** |
| 10 | 0.0305 | 98.9% | 0.0042 | 100.0% |
| 15 | 0.0176 | 99.5% | 0.0035 | 100.0% |

### Métricas Finales (Mejor Checkpoint)
- **Val Accuracy**: 100.0%
- **Desglose por clase**: 100.0% en todas las 4 categorías (75/75 aciertos cada una)
- **Archivo de pesos**: `services/vision/pesos/clasificador_estres.pt`
- **Archivo de métricas**: `services/vision/pesos/metricas_clasificador.json`

---

## 2. Detector YOLO de Patologías Foliares (YOLOv8n)

### Parámetros de Entrenamiento
| Parámetro | Valor |
|-----------|-------|
| Arquitectura base | YOLOv8n (Nano) — Ultralytics 8.4.41 |
| Épocas | 15 |
| Batch Size | 16 |
| Tamaño de imagen | 640 × 640 px |
| Dispositivo | NVIDIA RTX 4050 (cuda:0) |
| Dataset YAML | `services/vision/dataset/cultivo.yaml` |

### Métricas Finales de Validación (mAP)
| Métrica | Valor |
|---------|-------|
| mAP@50 | **33.99%** |
| mAP@50-95 | **23.53%** |
| Precisión Media | 31.1% |
| Recall Medio | 41.2% |
| Velocidad inferencia | 2.1 ms por fotograma (GPU) |

### Desempeño por Clase Destacado
| Clase | mAP@50 | mAP@50-95 |
|-------|--------|-----------|
| Corn rust leaf | 81.3% | 66.3% |
| Corn Gray leaf spot | 60.5% | 50.2% |
| Squash Powdery mildew leaf | 53.3% | 38.4% |
| grape leaf black rot | 53.4% | 35.4% |
| Corn leaf blight | 61.4% | 37.5% |

- **Archivo de pesos**: `services/vision/pesos/yolov8_cultivo.pt`
- **Archivo de métricas**: `services/vision/pesos/metricas_yolo.json`
- **Resultados Ultralytics**: `services/vision/pesos/yolov8_cultivo/`

---

## 3. Cómo Reproducir el Entrenamiento

```bash
# Paso 1: Preparar datasets (descarga y estructuración automática desde HuggingFace)
py -3.10 -m services.vision.scripts.preparar_dataset

# Paso 2: Entrenar ambos modelos de forma secuencial
py -3.10 -m services.vision.scripts.entrenar --modelo todos --epocas_pytorch 15 --epocas_yolo 20

# Paso 2a: Entrenar solo el clasificador PyTorch
py -3.10 -m services.vision.scripts.entrenar --modelo pytorch --epocas_pytorch 15

# Paso 2b: Entrenar solo el detector YOLOv8
py -3.10 -m services.vision.scripts.entrenar --modelo yolo --epocas_yolo 20
```

---

## 4. Mejora Continua con Datos Reales

Cuando el hardware de campo (Tlahuicole) esté operativo, se puede enriquecer el dataset con imágenes reales del cultivo:

```bash
# Recolectar 30 fotos reales de planta sana desde la cámara
py -3.10 -m services.vision.scripts.recolectar_fotos --cantidad 30 --clase sano --split train

# Recolectar muestras con clorosis
py -3.10 -m services.vision.scripts.recolectar_fotos --cantidad 20 --clase clorosis --split train

# Reentrenar el clasificador PyTorch con nuevas muestras
py -3.10 -m services.vision.scripts.entrenar --modelo pytorch --epocas_pytorch 20
```

---

**Estado:** Ambos modelos entrenados y operativos. Pesos disponibles en `services/vision/pesos/`.
