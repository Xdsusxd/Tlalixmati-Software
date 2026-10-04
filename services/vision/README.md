# Módulo de Visión Artificial e Inteligencia Artificial (Tlalixmati)

Este módulo implementa el pipeline de visión e inteligencia artificial para el monitoreo agrícola continuo en Tlalixmati, combinando **Ultralytics YOLOv8** para detección foliar, **PyTorch** para diagnóstico de estrés/anomalías vegetales y **análisis espectral de color (ExG/ExR)**.

Acelerado localmente mediante la GPU **NVIDIA GeForce RTX 4050** con **CUDA 12.1**.

---

## 1. Arquitectura del Pipeline

```
                     ┌──────────────────────────────┐
                     │     Cámara de Campo          │
                     │  (Nativa Max FPS / Res)      │
                     └──────────────┬───────────────┘
                                    │ Fotograma JPEG
                                    ▼
                     ┌──────────────────────────────┐
                     │   Orquestador de Visión      │
                     └──────┬────────────────┬──────┘
                            │                │
            ┌───────────────▼┐              ┌▼────────────────┐
            │ YOLOv8 en GPU  │              │ Índice Espectral│
            │ Detección/Cajas│              │  ExG / ExR      │
            └───────┬────────┘              └────────┬────────┘
                    │                                │
                    └───────────────┬────────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │   Clasificador PyTorch       │
                     │  (Sano, Clorosis,            │
                     │   Estrés Hídrico, Necrosis)  │
                     └──────────────┬───────────────┘
                                    │ ¿Planta en mal estado?
                     ┌──────────────┴───────────────┐
                     │ Sí                           │ No
                     ▼                              ▼
      ┌──────────────────────────────┐  ┌──────────────────────┐
      │ Disparo Automático de Alerta │  │ Monitoreo Regular    │
      │ POST /alerta-automatica      │  │ Sin Alertas          │
      └──────────────┬───────────────┘  └──────────────────────┘
                     ▼
      ┌──────────────────────────────┐
      │ Generación de PDF Rojo       │
      │ + Subida a Supabase Storage  │
      └──────────────────────────────┘
```

---

## 2. Categorías de Diagnóstico Fitosanitario

1. **SANO**: Tejido foliar con vigor óptimo, turgencia adecuada y coloración verde uniforme.
2. **CLOROSIS**: Pérdida de clorofila y amarillamiento visible por deficiencia nutricional (nitrógeno, hierro) o compactación radicular.
3. **ESTRES_HIDRICO**: Marchitamiento, pérdida de presión de turgencia o enrollamiento foliar por déficit de riego.
4. **NECROSIS**: Muerte de tejido celular, manchas marrones o lesiones visibles por ataque biológico o quemaduras.

---

## 3. Disparo Autónomo de Alertas a Supabase

Cuando el orquestador detecta una planta en mal estado:
1. Marca el fotograma con recuadros rojos y banner de alerta fitosanitaria.
2. Envía la imagen al servidor FastAPI vía `POST /api/v1/camara/frame`.
3. Dispara `POST /api/v1/reportes/alerta-automatica` con el detalle de la anomalía observada.
4. La API genera el informe técnico en PDF con encabezado rojo y sube el archivo directamente a **Supabase Storage** (bucket `informes-pdf`), quedando registrado en PostgreSQL.

---

## 4. Guía de Entrenamiento y Recolección de Datos

### Recolección de Imágenes Reales (Dataset)
```bash
# Recolectar 20 muestras reales desde la cámara activa y clasificarlas como 'sano'
py -3.10 -m services.vision.scripts.recolectar_fotos --cantidad 20 --clase sano --split train

# Recolectar muestras de plantas con estrés para el conjunto de validación
py -3.10 -m services.vision.scripts.recolectar_fotos --cantidad 10 --clase clorosis --split val
```

### Entrenamiento en GPU NVIDIA RTX 4050
```bash
# Entrenar clasificador PyTorch durante 15 épocas
py -3.10 -m services.vision.scripts.entrenar --modelo pytorch --epocas 15

# Entrenar detector YOLOv8
py -3.10 -m services.vision.scripts.entrenar --modelo yolo --epocas 25

# Entrenar ambos modelos de forma secuencial
py -3.10 -m services.vision.scripts.entrenar --modelo todos --epocas 20
```
