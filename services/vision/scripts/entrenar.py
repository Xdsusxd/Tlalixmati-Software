"""
Script de entrenamiento para modelos de Visión Artificial e Inteligencia Artificial.
Entrena:
1. Red convolucional PyTorch (MobileNetV3) para clasificación de salud foliar y anomalías.
2. Modelo YOLOv8 de detección de cultivo con Ultralytics en GPU (NVIDIA RTX 4050 con CUDA).
"""

import argparse
import os
from pathlib import Path
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, transforms
from PIL import Image

from services.vision.app.core.config import cargar_configuracion_vision
from services.vision.app.modelos.clasificador_estres import RedDiagnosticoFoliar, CLASES_ESTRES


class DatasetCultivoLocal(Dataset):
    """Carga imágenes locales reales para entrenamiento de PyTorch."""
    def __init__(self, directorio_raiz: Path, transform=None):
        self.directorio_raiz = directorio_raiz
        self.transform = transform
        self.muestras = []
        
        # Buscar imágenes en subcarpetas de clases
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
    """Entrena la red convolucional PyTorch en GPU con checkpointing."""
    dispositivo = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print("=" * 60)
    print("INICIANDO ENTRENAMIENTO DE CLASIFICADOR FOLIAR PYTORCH")
    print(f"Dispositivo de aceleración: {dispositivo}")
    if torch.cuda.is_available():
        print(f"GPU detectada: {torch.cuda.get_device_name(0)}")
        print(f"Capacidad de memoria: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    print("=" * 60)

    # Transformaciones con aumento de datos óptico agrícola
    transform_train = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    dir_train = Path(directorio_datos) / "train"
    dataset_train = DatasetCultivoLocal(dir_train, transform=transform_train)
    
    if len(dataset_train) == 0:
        print(f"AVISO: No se encontraron imágenes estructuradas en subcarpetas en {dir_train}.")
        print("Estructura requerida para entrenamiento:")
        print(f"  {dir_train}/sano/")
        print(f"  {dir_train}/clorosis/")
        print(f"  {dir_train}/estres_hidrico/")
        print(f"  {dir_train}/necrosis/")
        print("Para recolectar imágenes reales desde la cámara, ejecute: python -m services.vision.scripts.recolectar_fotos")
        return False

    loader_train = DataLoader(dataset_train, batch_size=batch_size, shuffle=True)
    modelo = RedDiagnosticoFoliar(num_clases=len(CLASES_ESTRES)).to(dispositivo)
    criterio = nn.CrossEntropyLoss()
    optimizador = torch.optim.AdamW(modelo.parameters(), lr=lr, weight_decay=1e-2)

    Path(ruta_guardado).parent.mkdir(parents=True, exist_ok=True)
    
    modelo.train()
    print(f"Entrenando con {len(dataset_train)} muestras durante {epocas} épocas...")

    for epoca in range(epocas):
        perdida_acumulada = 0.0
        aciertos = 0
        total = 0

        for imagenes, etiquetas in loader_train:
            imagenes = imagenes.to(dispositivo)
            etiquetas = etiquetas.to(dispositivo)

            optimizador.zero_grad()
            salidas = modelo(imagenes)
            loss = criterio(salidas, etiquetas)
            loss.backward()
            optimizador.step()

            perdida_acumulada += loss.item() * imagenes.size(0)
            _, predicciones = torch.max(salidas, 1)
            aciertos += torch.sum(predicciones == etiquetas).item()
            total += etiquetas.size(0)

        perdida_epoca = perdida_acumulada / max(1, total)
        exactitud_epoca = (aciertos / max(1, total)) * 100.0

        print(f"Época [{epoca+1}/{epocas}] - Pérdida (Loss): {perdida_epoca:.4f} | Precisión: {exactitud_epoca:.1f}%")

    # Guardar pesos entrenados
    torch.save(modelo.state_dict(), ruta_guardado)
    print(f"Pesos de PyTorch exportados exitosamente en: {ruta_guardado}")
    return True


def entrenar_detector_yolo(
    ruta_yaml_dataset: str = "services/vision/dataset/cultivo.yaml",
    epocas: int = 25,
    imgsz: int = 640,
    dispositivo: str = "0"
):
    """Entrena o ajusta el modelo YOLOv8 en la GPU NVIDIA."""
    try:
        from ultralytics import YOLO
        print("=" * 60)
        print("INICIANDO ENTRENAMIENTO DE YOLOV8 EN GPU")
        print("=" * 60)

        if not Path(ruta_yaml_dataset).exists():
            print(f"AVISO: Archivo de configuración {ruta_yaml_dataset} no encontrado.")
            print("Generando archivo yaml plantilla para dataset de cultivo...")
            Path(ruta_yaml_dataset).parent.mkdir(parents=True, exist_ok=True)
            with open(ruta_yaml_dataset, "w", encoding="utf-8") as f:
                f.write(
                    "path: services/vision/dataset\n"
                    "train: imagenes/train\n"
                    "val: imagenes/val\n"
                    "test: imagenes/test\n"
                    "names:\n"
                    "  0: planta_sana\n"
                    "  1: anomalia_foliar\n"
                )
            print(f"Plantilla creada en {ruta_yaml_dataset}. Etiquete las imágenes antes de iniciar entrenamiento YOLO.")
            return False

        modelo = YOLO("yolov8n.pt")
        dev = "0" if torch.cuda.is_available() else "cpu"
        modelo.train(
            data=ruta_yaml_dataset,
            epochs=epocas,
            imgsz=imgsz,
            device=dev,
            project="services/vision/pesos",
            name="yolov8_cultivo",
            exist_ok=True
        )
        print("Entrenamiento de YOLOv8 finalizado.")
        return True
    except Exception as e:
        print(f"Error en entrenamiento YOLO: {e}")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Herramienta de entrenamiento de IA para Tlalixmati")
    parser.add_argument("--modelo", choices=["pytorch", "yolo", "todos"], default="pytorch", help="Modelo a entrenar")
    parser.add_argument("--epocas", type=int, default=10, help="Número de épocas de entrenamiento")
    args = parser.parse_args()

    if args.modelo in ("pytorch", "todos"):
        entrenar_clasificador_pytorch(epocas=args.epocas)
    if args.modelo in ("yolo", "todos"):
        entrenar_detector_yolo(epocas=args.epocas)
