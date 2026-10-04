# Modelos de Inteligencia Artificial (Tlalixmati)

## Ecosistema de Visión Artificial
El subsistema de Inteligencia Artificial de Tlalixmati combina arquitecturas de **PyTorch** y **Ultralytics YOLOv8**, aceleradas localmente mediante la GPU **NVIDIA GeForce RTX 4050 Laptop GPU (6 GB VRAM)** con **CUDA 12.1**.

---

## 1. Detector de Plantas y Patologías Foliar (YOLOv8)

### Arquitectura
- **Modelo Base**: YOLOv8n (Nano) de Ultralytics.
- **Entrada**: Fotogramas RGB de campo a 640x640 px.
- **Salida**: Cajas delimitadoras (Bounding Boxes), clase y nivel de certeza.
- **Dispositivo**: `cuda:0` (Inferencia en tiempo real < 6 ms por fotograma).
- **Ruta de Pesos**: `services/vision/pesos/yolov8_cultivo.pt`

### Clases Detectadas (17 Categorías)
1. `Apple Scab Leaf`
2. `Apple rust leaf`
3. `Bell_pepper leaf spot`
4. `Corn Gray leaf spot`
5. `Corn leaf blight`
6. `Corn rust leaf`
7. `Potato leaf early blight`
8. `Potato leaf late blight`
9. `Squash Powdery mildew leaf`
10. `Tomato Early blight leaf`
11. `Tomato Septoria leaf spot`
12. `Tomato leaf bacterial spot`
13. `Tomato leaf late blight`
14. `Tomato leaf mosaic virus`
15. `Tomato leaf yellow virus` (Clorosis viral)
16. `Tomato mold leaf`
17. `grape leaf black rot` (Necrosis)

### Métricas de Validación
- **mAP@50**: 33.99%
- **mAP@50-95**: 23.53%
- **Precisión Media**: 31.1%
- **Recall Medio**: 41.2%
- **Archivo de Métricas**: `services/vision/pesos/metricas_yolo.json`

---

## 2. Clasificador de Salud y Estrés Foliar (PyTorch / MobileNetV3)

### Arquitectura
- **Backbone**: MobileNetV3-Small preentrenado con normalización ImageNet.
- **Cabeza Clasificadora**: Perceptrón multicapa con `Linear(576, 256) -> Hardswish -> Dropout(0.2) -> Linear(256, 4)`.
- **Entrada**: Recortes o fotogramas redimensionados a 224x224 px.
- **Salida**: Probabilidades softmax para las 4 categorías agronómicas y cálculo de índice de severidad de anomalía.
- **Ruta de Pesos**: `services/vision/pesos/clasificador_estres.pt`

### Clases de Diagnóstico Agrícola
1. **`SANO`**: Follaje con vigor fotosintético óptimo y turgencia celular normal.
2. **`CLOROSIS`**: Pérdida de clorofila, deficiencia de nitrógeno/hierro o virus foliar amarillo.
3. **`ESTRES_HIDRICO`**: Deshidratación, déficit hídrico radicular, marchitamiento.
4. **`NECROSIS`**: Muerte celular tisular, manchas foliares necróticas o tizón.

### Métricas de Validación
- **Exactitud en Validación (Val Acc)**: 100.0%
- **Pérdida en Validación (Val Loss)**: 0.0035
- **Desempeño por Clase**:
  - `SANO`: 100.0% (75/75 aciertos)
  - `CLOROSIS`: 100.0% (75/75 aciertos)
  - `ESTRES_HIDRICO`: 100.0% (75/75 aciertos)
  - `NECROSIS`: 100.0% (75/75 aciertos)
- **Archivo de Métricas**: `services/vision/pesos/metricas_clasificador.json`

---

## 3. Disparo Autónomo de Alertas
Cuando el orquestador (`OrquestadorVision`) detecta un espécimen con `es_anomalia == True` (probabilidad combinada no-sana >= 0.55 o índices espectrales de clorosis/necrosis elevados):
1. Anota el fotograma con recuadros y etiquetas técnicas.
2. Dispara el reporte fitosanitario de alerta a FastAPI (`POST /api/v1/reportes/alerta-automatica`).
3. La API genera el informe técnico en PDF con encabezado rojo y lo sube directamente al bucket de **Supabase Storage**.

---
**Estado:** Modelos Entrenados y Desplegados en Producción Local (GPU NVIDIA RTX 4050).
