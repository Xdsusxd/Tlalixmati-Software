# Fase 08: Pipeline de Visión Artificial e Inteligencia Artificial (PyTorch + YOLOv8)

## 1. Resumen de la Fase
En esta fase se implementó la infraestructura de visión computacional e inteligencia artificial para Tlalixmati, aprovechando la aceleración de hardware en la GPU **NVIDIA GeForce RTX 4050 Laptop GPU** con **CUDA 12.1**.

El pipeline está diseñado bajo la regla estricta de **cero datos falsos**, permitiendo el entrenamiento sobre capturas ópticas reales y conectando la detección de anomalías directamente con la generación autónoma de informes en PDF guardados en Supabase Storage.

---

## 2. Componentes Desarrollados

### 2.1. Detección y Segmentación con YOLOv8 (`detector_yolo.py`)
* Wrapper para **Ultralytics YOLOv8** con aceleración CUDA.
* Inferencia sobre fotogramas para localización y delimitación de especímenes vegetales en campo.
* Extracción de regiones de interés (ROI) para análisis patológico secundario.

### 2.2. Clasificación de Estrés Foliar con PyTorch (`clasificador_estres.py`)
* Red neuronal convolucional basada en `MobileNetV3` con cabeza de clasificación personalizada.
* Categorías agronómicas:
  1. `SANO`: Vigor vegetal óptimo y coloración uniforme.
  2. `CLOROSIS`: Amarillamiento por déficit nutricional.
  3. `ESTRES_HIDRICO`: Marchitamiento foliar y deshidratación.
  4. `NECROSIS`: Muerte celular y manchas foliares.

### 2.3. Diagnóstico Espectral de Color (`diagnostico.py`)
* Cálculo de índices ópticos agronómicos estándar:
  * **ExG (Excess Green Index)**: Densidad de clorofila.
  * Proporción de verde foliar vs amarillamiento clorótico en espacios RGB y HSV.
* Anotación visual dinámica en fotograma con semáforo de colores (verde para saludable, rojo para alerta activa).

### 2.4. Orquestador de Inspección y Disparo Automático (`orquestador_vision.py`)
* Coordina la entrada de fotogramas, inferencia YOLO, clasificación PyTorch y evaluación espectral.
* **Disparo Automático de Alerta**: Si se detecta una planta en mal estado (clorosis severa, marchitamiento o necrosis):
  1. Marca el fotograma con el diagnóstico.
  2. Actualiza la imagen en la API.
  3. Invoca `POST /api/v1/reportes/alerta-automatica`.
  4. La API genera un PDF con encabezado rojo y lo sube directamente al bucket `informes-pdf` de Supabase Storage.

### 2.5. Herramientas de Entrenamiento y Dataset (`entrenar.py` y `recolector_fotos.py`)
* Script CLI para recolectar fotos reales de la cámara y estructurar el dataset en `train/`, `val/`, `test/`.
* Filtro de calidad óptica (evaluación de brillo y nitidez con varianza del Laplaciano).
* Script de entrenamiento en GPU (`py -3.10 -m services.vision.scripts.entrenar`) para PyTorch y YOLOv8.

---

## 3. Verificación y Pruebas
* Suite de pruebas automatizadas: **41 pruebas aprobadas** (100% exitosas).
* Compatibilidad verificada con PyTorch 2.5.1+cu121, Torchvision 0.20.1+cu121 y Ultralytics 8.4.41.
