"""
Script de preparación, descarga y balanceo de datasets para Tlalixmati.
Construye:
1. Dataset para YOLOv8 en formato estándar (imágenes + anotaciones de visión de cultivo).
2. Dataset balanceado para el Clasificador PyTorch (4 clases: SANO, CLOROSIS, ESTRES_HIDRICO, NECROSIS).
"""

import io
import json
import logging
import os
from pathlib import Path
import random
import shutil
import zipfile
import pandas as pd
from PIL import Image
from huggingface_hub import hf_hub_download

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] (Dataset) %(message)s")
logger = logging.getLogger("tlalixmati.vision.dataset")

# Semilla reproducible
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent.parent.parent
DIR_DATASET = RAIZ_PROYECTO / "services" / "vision" / "dataset"
DIR_IMAGENES = DIR_DATASET / "imagenes"
DIR_YOLO = DIR_DATASET / "yolo"


def preparar_dataset_yolo() -> Path:
    """Descarga y extrae el dataset anotado de hojas y patologías para YOLOv8."""
    logger.info("=== 1. Preparando Dataset para YOLOv8 ===")
    DIR_YOLO.mkdir(parents=True, exist_ok=True)

    archivo_zip = hf_hub_download(
        repo_id="rick003/plant-disease-clean-v1",
        filename="plant_disease_clean_v1.zip",
        repo_type="dataset"
    )

    logger.info(f"Extrayendo archivo YOLO desde {archivo_zip}...")
    with zipfile.ZipFile(archivo_zip, "r") as z:
        for member in z.namelist():
            if member.startswith("dataset/train/") or member.startswith("dataset/val/") or member.startswith("dataset/test/"):
                sub_path = member.replace("dataset/", "", 1)
                dest = DIR_YOLO / sub_path
                dest.parent.mkdir(parents=True, exist_ok=True)
                if not member.endswith("/"):
                    with open(dest, "wb") as f_out:
                        f_out.write(z.read(member))

    # Configurar cultivo.yaml para YOLOv8
    ruta_yaml = DIR_DATASET / "cultivo.yaml"
    # Usar forward slashes para compatibilidad con Windows y Ultralytics
    ruta_yolo_str = str(DIR_YOLO).replace("\\", "/")
    
    contenido_yaml = f"""# Configuración de Dataset para Detección Foliar en Tlalixmati
path: "{ruta_yolo_str}"
train: train/images
val: val/images
test: test/images

nc: 17
names:
  0: Apple Scab Leaf
  1: Apple rust leaf
  2: Bell_pepper leaf spot
  3: Corn Gray leaf spot
  4: Corn leaf blight
  5: Corn rust leaf
  6: Potato leaf early blight
  7: Potato leaf late blight
  8: Squash Powdery mildew leaf
  9: Tomato Early blight leaf
  10: Tomato Septoria leaf spot
  11: Tomato leaf bacterial spot
  12: Tomato leaf late blight
  13: Tomato leaf mosaic virus
  14: Tomato leaf yellow virus
  15: Tomato mold leaf
  16: grape leaf black rot
"""
    with open(ruta_yaml, "w", encoding="utf-8") as f:
        f.write(contenido_yaml)

    logger.info(f"Dataset YOLOv8 preparado exitosamente en: {DIR_YOLO}")
    logger.info(f"Archivo de configuración generado: {ruta_yaml}")
    return ruta_yaml


def preparar_dataset_pytorch():
    """
    Construye las carpetas estructuradas para el clasificador foliar de PyTorch:
    - SANO: Muestras sanas de PlantVillage, AGM_HS y hojas sin enfermedad
    - CLOROSIS: Hojas con Tomato leaf yellow virus y deficiencias de clorofila
    - ESTRES_HIDRICO: Plantas con estrés hídrico de deep-plants/AGM_HS
    - NECROSIS: Manchas foliares, tizón temprano/tardío, pudrición negra
    """
    logger.info("=== 2. Preparando Dataset Balanceado para Clasificador PyTorch ===")

    # Crear directorios
    clases = ["sano", "clorosis", "estres_hidrico", "necrosis"]
    for split in ["train", "val"]:
        for c in clases:
            (DIR_IMAGENES / split / c).mkdir(parents=True, exist_ok=True)

    cantidades_train = {"sano": 350, "clorosis": 350, "estres_hidrico": 350, "necrosis": 350}
    cantidades_val = {"sano": 75, "clorosis": 75, "estres_hidrico": 75, "necrosis": 75}

    logger.info("Cargando fuentes de datos...")

    # Fuente 1: deep-plants/AGM_HS (para estres_hidrico y sano adicional)
    logger.info("Procesando deep-plants/AGM_HS para estres_hidrico...")
    p_agm = hf_hub_download(
        repo_id="deep-plants/AGM_HS",
        filename="data/train-00000-of-00001-0a6125f0e8a371b5.parquet",
        repo_type="dataset"
    )
    df_agm = pd.read_parquet(p_agm)
    df_stressed = df_agm[df_agm["label"] == "stressed"].sample(
        n=cantidades_train["estres_hidrico"] + cantidades_val["estres_hidrico"],
        random_state=RANDOM_SEED
    )

    idx_stressed = 0
    # Train estres_hidrico
    for _ in range(cantidades_train["estres_hidrico"]):
        row = df_stressed.iloc[idx_stressed]
        img = Image.open(io.BytesIO(row["image"]["bytes"])).convert("RGB")
        img.save(DIR_IMAGENES / "train" / "estres_hidrico" / f"agm_stress_{idx_stressed:04d}.jpg", quality=92)
        idx_stressed += 1
    # Val estres_hidrico
    for _ in range(cantidades_val["estres_hidrico"]):
        row = df_stressed.iloc[idx_stressed]
        img = Image.open(io.BytesIO(row["image"]["bytes"])).convert("RGB")
        img.save(DIR_IMAGENES / "val" / "estres_hidrico" / f"agm_stress_{idx_stressed:04d}.jpg", quality=92)
        idx_stressed += 1

    # Fuente 2: Plant_village_subset (para clorosis, necrosis y sano)
    logger.info("Procesando Plant_village_subset para clorosis, necrosis y hojas sanas...")
    p_pv = hf_hub_download(
        repo_id="GVJahnavi/Plant_village_subset",
        filename="data/train-00000-of-00001.parquet",
        repo_type="dataset"
    )
    df_pv = pd.read_parquet(p_pv)
    # 3: Apple___healthy, 4: Blueberry___healthy, 10: Corn___healthy, 14: Grape___healthy
    # 8: Corn___Common_rust_ (clorosis / pústulas amarillas), 12: Grape___Esca (clorosis)
    # 1: Apple__Black_rot, 7: Cercospora, 9: Corn Northern Leaf Blight, 11: Grape Black rot (necrosis)
    
    # Clorosis de PlantVillage
    df_pv_clorosis = df_pv[df_pv["label"].isin([8, 12])].sample(
        n=cantidades_train["clorosis"] + cantidades_val["clorosis"],
        random_state=RANDOM_SEED
    )
    idx_clorosis = 0
    for _ in range(cantidades_train["clorosis"]):
        row = df_pv_clorosis.iloc[idx_clorosis]
        img = Image.open(io.BytesIO(row["image"]["bytes"])).convert("RGB")
        img.save(DIR_IMAGENES / "train" / "clorosis" / f"pv_clorosis_{idx_clorosis:04d}.jpg", quality=92)
        idx_clorosis += 1
    for _ in range(cantidades_val["clorosis"]):
        row = df_pv_clorosis.iloc[idx_clorosis]
        img = Image.open(io.BytesIO(row["image"]["bytes"])).convert("RGB")
        img.save(DIR_IMAGENES / "val" / "clorosis" / f"pv_clorosis_{idx_clorosis:04d}.jpg", quality=92)
        idx_clorosis += 1

    # Necrosis de PlantVillage
    df_pv_necrosis = df_pv[df_pv["label"].isin([1, 7, 9, 11])].sample(
        n=cantidades_train["necrosis"] + cantidades_val["necrosis"],
        random_state=RANDOM_SEED
    )
    idx_necrosis = 0
    for _ in range(cantidades_train["necrosis"]):
        row = df_pv_necrosis.iloc[idx_necrosis]
        img = Image.open(io.BytesIO(row["image"]["bytes"])).convert("RGB")
        img.save(DIR_IMAGENES / "train" / "necrosis" / f"pv_necrosis_{idx_necrosis:04d}.jpg", quality=92)
        idx_necrosis += 1
    for _ in range(cantidades_val["necrosis"]):
        row = df_pv_necrosis.iloc[idx_necrosis]
        img = Image.open(io.BytesIO(row["image"]["bytes"])).convert("RGB")
        img.save(DIR_IMAGENES / "val" / "necrosis" / f"pv_necrosis_{idx_necrosis:04d}.jpg", quality=92)
        idx_necrosis += 1

    # Sano de PlantVillage
    df_pv_sano = df_pv[df_pv["label"].isin([3, 4, 10, 14])].sample(
        n=cantidades_train["sano"] + cantidades_val["sano"],
        random_state=RANDOM_SEED
    )
    idx_sano = 0
    for _ in range(cantidades_train["sano"]):
        row = df_pv_sano.iloc[idx_sano]
        img = Image.open(io.BytesIO(row["image"]["bytes"])).convert("RGB")
        img.save(DIR_IMAGENES / "train" / "sano" / f"pv_sano_{idx_sano:04d}.jpg", quality=92)
        idx_sano += 1
    for _ in range(cantidades_val["sano"]):
        row = df_pv_sano.iloc[idx_sano]
        img = Image.open(io.BytesIO(row["image"]["bytes"])).convert("RGB")
        img.save(DIR_IMAGENES / "val" / "sano" / f"pv_sano_{idx_sano:04d}.jpg", quality=92)
        idx_sano += 1

    # Resumen del dataset preparado
    resumen = {
        "origen_datos": [
            "deep-plants/AGM_HS (Hugging Face / AgricolaModerna)",
            "GVJahnavi/Plant_village_subset (PlantVillage)",
            "rick003/plant-disease-clean-v1 (Roboflow Clean v1)"
        ],
        "distribucion_train": {c: len(list((DIR_IMAGENES / "train" / c).glob("*.jpg"))) for c in clases},
        "distribucion_val": {c: len(list((DIR_IMAGENES / "val" / c).glob("*.jpg"))) for c in clases},
        "total_train": sum(len(list((DIR_IMAGENES / "train" / c).glob("*.jpg"))) for c in clases),
        "total_val": sum(len(list((DIR_IMAGENES / "val" / c).glob("*.jpg"))) for c in clases),
    }

    with open(DIR_DATASET / "resumen_clasificador.json", "w", encoding="utf-8") as f:
        json.dump(resumen, f, indent=2, ensure_ascii=False)

    logger.info(f"Dataset PyTorch preparado con éxito: {resumen['total_train']} train / {resumen['total_val']} val.")
    return resumen


if __name__ == "__main__":
    preparar_dataset_yolo()
    preparar_dataset_pytorch()
    logger.info("=== Preparación de todos los datasets completada ===")
