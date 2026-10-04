# Datasets de Tlalixmati

## Fuentes de Datos Utilizadas

### Estado Actual
Modelos entrenados exitosamente usando 3 fuentes de datos públicas de licencia abierta.

---

## Dataset para Clasificador PyTorch (MobileNetV3)

| Clase | Fuente | Split Train | Split Val |
|-------|--------|------------|-----------|
| `SANO` | PlantVillage (GVJahnavi/Plant_village_subset) | 350 | 75 |
| `CLOROSIS` | PlantVillage — Corn Common Rust, Grape Esca | 350 | 75 |
| `ESTRES_HIDRICO` | AGricolaModerna HS (deep-plants/AGM_HS) | 350 | 75 |
| `NECROSIS` | PlantVillage — Black Rot, Cercospora, Leaf Blight | 350 | 75 |
| **Total** | | **1,400** | **300** |

### Fuentes y Licencias
1. **[deep-plants/AGM_HS](https://huggingface.co/datasets/deep-plants/AGM_HS)** — Licencia CC BY 4.0.
   Dataset de 6,127 imágenes de plantas en vista cenital, categoría `healthy` / `stressed`. Usado para la clase `ESTRES_HIDRICO`.

2. **[GVJahnavi/Plant_village_subset](https://huggingface.co/datasets/GVJahnavi/Plant_village_subset)** — Dataset PlantVillage (dominio público / CC).
   11,322 imágenes de hojas clasificadas en 15 clases. Usado para `SANO`, `CLOROSIS`, `NECROSIS`.

---

## Dataset para YOLOv8 (Detección Foliar)

- **Fuente**: [rick003/plant-disease-clean-v1](https://huggingface.co/datasets/rick003/plant-disease-clean-v1) — Licencia CC BY 4.0
- **Origen original**: [Roboflow Universe / Muhammad Salah — Plant Diseases](https://universe.roboflow.com/muhammad-salah/plant-diseases-xy8x3)
- **Tipo**: Dataset anotado en formato YOLO (imágenes + archivos `.txt` de bounding boxes)
- **Clases**: 17 categorías de patologías foliares
- **Split**:
  - Train: 1,328 imágenes / 3,022 instancias anotadas
  - Val: 284 imágenes / 621 instancias anotadas
  - Test: 284 imágenes / 599 instancias anotadas

### Configuración del Dataset
El archivo `services/vision/dataset/cultivo.yaml` define la configuración completa para Ultralytics.

---

## Pipeline de Preparación

El script `services/vision/scripts/preparar_dataset.py` automatiza:
1. Descarga de `plant_disease_clean_v1.zip` desde Hugging Face Hub.
2. Extracción en `services/vision/dataset/yolo/` con estructura estándar YOLO.
3. Descarga de imágenes `AGM_HS` (estrés hídrico) y `Plant_village_subset` vía Parquet.
4. Organización balanceada en `services/vision/dataset/imagenes/{train,val}/{sano,clorosis,estres_hidrico,necrosis}/`.
5. Generación del resumen `dataset/resumen_clasificador.json`.

```bash
# Volver a preparar todos los datasets desde cero
py -3.10 -m services.vision.scripts.preparar_dataset
```

---

> [!NOTE]
> En producción, las imágenes de campo capturadas desde la cámara real de Tlahuicole se pueden usar para reentrenar el modelo mediante `services/vision/scripts/recolectar_fotos.py` y `entrenar.py`, mejorando la capacidad de generalización a condiciones específicas del cultivo local.
