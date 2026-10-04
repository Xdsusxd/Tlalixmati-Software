"""
Script de entrenamiento para modelos de Visión Artificial e Inteligencia Artificial de Tlalixmati.
Entrena:
1. Red convolucional PyTorch (MobileNetV3) para clasificación de salud foliar y anomalías:
   - SANO
   - CLOROSIS
   - ESTRES_HIDRICO
   - NECROSIS
2. Modelo YOLOv8 de detección y localización de plantas y patologías foliares con Ultralytics.
Acelerado por GPU NVIDIA GeForce RTX 4050 con CUDA 12.1.
"""

import argparse
import json
import os
from pathlib import Path
import shutil
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from PIL import Image

from services.vision.app.core.config import cargar_configuracion_vision
from services.vision.app.modelos.clasificador_estres import RedDiagnosticoFoliar, CLASES_ESTRES


class DatasetCultivoLocal(Dataset):
    """Carga imágenes locales para entrenamiento y validación de PyTorch."""
    def __init__(self, directorio_raiz: Path, transform=None):
        self.directorio_raiz = directorio_raiz
        self.transform = transform
        self.muestras = []
        
        extensiones = [".jpg", ".jpeg", ".png"]
        for idx_clase, nombre_clase in enumerate(CLASES_ESTRES):
            carpeta_clase = self.directorio_raiz / nombre_clase.lower()
            if carpeta_clase.exists():
                for ext in extensiones:
                    for archivo in carpeta_clase.glob(f"*{ext}"):
                        self.muestras.append((archivo, idx_clase))

    def __len__(self):
        return len(self.muestras)

    def __getitem__(self, idx):
        ruta_img, etiqueta = self.muestras[idx]
        img = Image.open(ruta_img).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, etiqueta


def entrenar_clasificador_pytorch(
    directorio_datos: str = "services/vision/dataset/imagenes",
    epocas: int = 15,
    batch_size: int = 16,
    lr: float = 1e-4,
    ruta_guardado: str = "services/vision/pesos/clasificador_estres.pt"
):
    """Entrena la red convolucional PyTorch en GPU con validación y guardado del mejor modelo."""
    dispositivo = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print("=" * 70)
    print("INICIANDO ENTRENAMIENTO DE CLASIFICADOR FOLIAR PYTORCH")
    print(f"Dispositivo de aceleración: {dispositivo}")
    if torch.cuda.is_available():
        print(f"GPU detectada: {torch.cuda.get_device_name(0)}")
        print(f"VRAM disponible: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    print("=" * 70)

    transform_train = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    transform_val = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    dir_train = Path(directorio_datos) / "train"
    dir_val = Path(directorio_datos) / "val"

    dataset_train = DatasetCultivoLocal(dir_train, transform=transform_train)
    dataset_val = DatasetCultivoLocal(dir_val, transform=transform_val)
    
    if len(dataset_train) == 0:
        print(f"ERROR: No se encontraron imágenes en {dir_train}.")
        print("Ejecute primero: py -3.10 -m services.vision.scripts.preparar_dataset")
        return False

    loader_train = DataLoader(dataset_train, batch_size=batch_size, shuffle=True, pin_memory=torch.cuda.is_available())
    loader_val = DataLoader(dataset_val, batch_size=batch_size, shuffle=False) if len(dataset_val) > 0 else None

    modelo = RedDiagnosticoFoliar(num_clases=len(CLASES_ESTRES)).to(dispositivo)
    criterio = nn.CrossEntropyLoss()
    optimizador = torch.optim.AdamW(modelo.parameters(), lr=lr, weight_decay=1e-2)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizador, T_max=epocas)

    Path(ruta_guardado).parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Dataset cargado: {len(dataset_train)} entrenamiento / {len(dataset_val)} validación")
    print(f"Clases de diagnóstico: {CLASES_ESTRES}")
    print(f"Iniciando ciclo durante {epocas} épocas...")

    historial = []
    mejor_acc_val = 0.0
    inicio_total = time.time()

    for epoca in range(epocas):
        inicio_epoca = time.time()
        modelo.train()
        perdida_train = 0.0
        aciertos_train = 0
        total_train = 0

        for imagenes, etiquetas in loader_train:
            imagenes = imagenes.to(dispositivo, non_blocking=True)
            etiquetas = etiquetas.to(dispositivo, non_blocking=True)

            optimizador.zero_grad()
            salidas = modelo(imagenes)
            loss = criterio(salidas, etiquetas)
            loss.backward()
            optimizador.step()

            perdida_train += loss.item() * imagenes.size(0)
            _, preds = torch.max(salidas, 1)
            aciertos_train += torch.sum(preds == etiquetas).item()
            total_train += etiquetas.size(0)

        scheduler.step()
        loss_ep_train = perdida_train / max(1, total_train)
        acc_ep_train = (aciertos_train / max(1, total_train)) * 100.0

        # Validación
        acc_ep_val = 0.0
        loss_ep_val = 0.0
        if loader_val:
            modelo.eval()
            perdida_val = 0.0
            aciertos_val = 0
            total_val = 0
            with torch.no_grad():
                for imagenes, etiquetas in loader_val:
                    imagenes = imagenes.to(dispositivo, non_blocking=True)
                    etiquetas = etiquetas.to(dispositivo, non_blocking=True)
                    salidas = modelo(imagenes)
                    loss = criterio(salidas, etiquetas)
                    perdida_val += loss.item() * imagenes.size(0)
                    _, preds = torch.max(salidas, 1)
                    aciertos_val += torch.sum(preds == etiquetas).item()
                    total_val += etiquetas.size(0)

            loss_ep_val = perdida_val / max(1, total_val)
            acc_ep_val = (aciertos_val / max(1, total_val)) * 100.0

        duracion_epoca = time.time() - inicio_epoca
        print(
            f"Época [{epoca+1:02d}/{epocas:02d}] "
            f"Train Loss: {loss_ep_train:.4f} | Train Acc: {acc_ep_train:5.1f}% | "
            f"Val Loss: {loss_ep_val:.4f} | Val Acc: {acc_ep_val:5.1f}% | "
            f"Tiempo: {duracion_epoca:.1f}s"
        )

        registro_ep = {
            "epoca": epoca + 1,
            "train_loss": loss_ep_train,
            "train_acc": acc_ep_train,
            "val_loss": loss_ep_val,
            "val_acc": acc_ep_val,
            "segundos": duracion_epoca
        }
        historial.append(registro_ep)

        # Guardar mejor modelo según validación
        if acc_ep_val >= mejor_acc_val:
            mejor_acc_val = acc_ep_val
            torch.save(modelo.state_dict(), ruta_guardado)

    # Evaluación detallada por clase en validación
    metricas_clases = {}
    if loader_val:
        modelo.load_state_dict(torch.load(ruta_guardado, map_location=dispositivo, weights_only=True))
        modelo.eval()
        conteo_por_clase = {c: {"total": 0, "aciertos": 0} for c in CLASES_ESTRES}
        with torch.no_grad():
            for imagenes, etiquetas in loader_val:
                imagenes = imagenes.to(dispositivo)
                etiquetas = etiquetas.to(dispositivo)
                salidas = modelo(imagenes)
                _, preds = torch.max(salidas, 1)
                for p, t in zip(preds, etiquetas):
                    nombre_clase = CLASES_ESTRES[t.item()]
                    conteo_por_clase[nombre_clase]["total"] += 1
                    if p.item() == t.item():
                        conteo_por_clase[nombre_clase]["aciertos"] += 1

        for nombre_clase, stats in conteo_por_clase.items():
            tot = stats["total"]
            ac = stats["aciertos"]
            acc = (ac / max(1, tot)) * 100.0
            metricas_clases[nombre_clase] = {
                "total_muestras": tot,
                "aciertos": ac,
                "precision_porcentaje": round(acc, 2)
            }
            print(f"  -> Clase {nombre_clase:<15}: {acc:5.1f}% ({ac}/{tot})")

    duracion_total = time.time() - inicio_total
    resumen_final = {
        "modelo": "MobileNetV3-Small (Custom Foliar Stress Head)",
        "dispositivo": str(dispositivo),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None",
        "epocas_totales": epocas,
        "duracion_segundos": round(duracion_total, 2),
        "mejor_exactitud_val": round(mejor_acc_val, 2),
        "ruta_pesos": str(ruta_guardado),
        "metricas_por_clase": metricas_clases,
        "historial": historial,
    }

    ruta_metricas = Path(ruta_guardado).parent / "metricas_clasificador.json"
    with open(ruta_metricas, "w", encoding="utf-8") as f:
        json.dump(resumen_final, f, indent=2, ensure_ascii=False)

    print("=" * 70)
    print(f"ENTRENAMIENTO PYTORCH FINALIZADO EN {duracion_total:.1f}s")
    print(f"Mejor Precisión en Validación: {mejor_acc_val:.2f}%")
    print(f"Pesos guardados en: {ruta_guardado}")
    print(f"Métricas exportadas en: {ruta_metricas}")
    print("=" * 70)
    return True


def entrenar_detector_yolo(
    ruta_yaml_dataset: str = "services/vision/dataset/cultivo.yaml",
    epocas: int = 20,
    imgsz: int = 640,
    batch: int = 16,
    dispositivo: str = "0"
):
    """Entrena el modelo YOLOv8 de detección foliar en GPU NVIDIA."""
    try:
        from ultralytics import YOLO
        print("=" * 70)
        print("INICIANDO ENTRENAMIENTO DE DETECTOR YOLOV8 EN GPU")
        print("=" * 70)

        yaml_path = Path(ruta_yaml_dataset).resolve()
        if not yaml_path.exists():
            print(f"ERROR: Archivo {yaml_path} no encontrado.")
            print("Ejecute primero: py -3.10 -m services.vision.scripts.preparar_dataset")
            return False

        dev = "0" if torch.cuda.is_available() else "cpu"
        print(f"Dispositivo YOLO: {dev} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")
        print(f"Dataset YAML: {yaml_path}")
        print(f"Épocas: {epocas} | Tamaño de Imagen: {imgsz} | Batch: {batch}")

        # Inicializar modelo YOLOv8 nano preentrenado
        modelo = YOLO("yolov8n.pt")

        directorio_salida = Path("services/vision/pesos").resolve()
        directorio_salida.mkdir(parents=True, exist_ok=True)

        resultados = modelo.train(
            data=str(yaml_path),
            epochs=epocas,
            imgsz=imgsz,
            batch=batch,
            device=dev,
            project=str(directorio_salida),
            name="yolov8_cultivo",
            exist_ok=True,
            plots=True,
            save=True,
            val=True,
            workers=2,
            verbose=True
        )

        # Localizar el archivo de mejores pesos
        ruta_best = directorio_salida / "yolov8_cultivo" / "weights" / "best.pt"
        ruta_destino = directorio_salida / "yolov8_cultivo.pt"

        if ruta_best.exists():
            shutil.copy(ruta_best, ruta_destino)
            print(f"Pesos de YOLOv8 copiados a la ruta oficial: {ruta_destino}")
        else:
            # Si no existe best.pt, verificar last.pt
            ruta_last = directorio_salida / "yolov8_cultivo" / "weights" / "last.pt"
            if ruta_last.exists():
                shutil.copy(ruta_last, ruta_destino)
                print(f"Pesos last.pt copiados a la ruta oficial: {ruta_destino}")

        # Ejecutar validación final para extraer métricas formales
        print("Ejecutando validación formal de YOLOv8 sobre conjunto de prueba/validación...")
        metricas_val = modelo.val()

        resumen_yolo = {
            "modelo": "Ultralytics YOLOv8n (Custom Crop Foliar Detector)",
            "dispositivo": dev,
            "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None",
            "epocas": epocas,
            "imgsz": imgsz,
            "ruta_pesos": str(ruta_destino),
            "metricas": {
                "mAP50": round(float(metricas_val.box.map50), 4) if hasattr(metricas_val, "box") else None,
                "mAP50_95": round(float(metricas_val.box.map), 4) if hasattr(metricas_val, "box") else None,
                "precision": round(float(metricas_val.box.mp), 4) if hasattr(metricas_val, "box") else None,
                "recall": round(float(metricas_val.box.mr), 4) if hasattr(metricas_val, "box") else None,
            }
        }

        ruta_metricas_yolo = directorio_salida / "metricas_yolo.json"
        with open(ruta_metricas_yolo, "w", encoding="utf-8") as f:
            json.dump(resumen_yolo, f, indent=2, ensure_ascii=False)

        print("=" * 70)
        print("ENTRENAMIENTO YOLOV8 FINALIZADO EXITOSAMENTE")
        if resumen_yolo["metricas"]["mAP50"] is not None:
            print(f"mAP@50: {resumen_yolo['metricas']['mAP50']*100:.2f}% | mAP@50-95: {resumen_yolo['metricas']['mAP50_95']*100:.2f}%")
        print(f"Pesos finales exportados en: {ruta_destino}")
        print(f"Métricas exportadas en: {ruta_metricas_yolo}")
        print("=" * 70)
        return True

    except Exception as e:
        print(f"Error durante el entrenamiento de YOLOv8: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Herramienta de entrenamiento de IA para Tlalixmati")
    parser.add_argument("--modelo", choices=["pytorch", "yolo", "todos"], default="todos", help="Modelo a entrenar")
    parser.add_argument("--epocas", type=int, default=15, help="Número de épocas generales")
    parser.add_argument("--epocas_pytorch", type=int, default=15, help="Épocas para PyTorch")
    parser.add_argument("--epocas_yolo", type=int, default=20, help="Épocas para YOLOv8")
    parser.add_argument("--batch_size", type=int, default=16, help="Tamaño de lote")
    args = parser.parse_args()

    epocas_pt = args.epocas_pytorch if args.epocas_pytorch != 15 or args.epocas == 15 else args.epocas
    epocas_yo = args.epocas_yolo if args.epocas_yolo != 20 or args.epocas == 15 else args.epocas

    if args.modelo in ("pytorch", "todos"):
        entrenar_clasificador_pytorch(epocas=epocas_pt, batch_size=args.batch_size)
    if args.modelo in ("yolo", "todos"):
        entrenar_detector_yolo(epocas=epocas_yo, batch=args.batch_size)
