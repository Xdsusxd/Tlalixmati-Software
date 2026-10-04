"""
Script CLI para recolectar y almacenar fotogramas reales desde la cámara.
Permite capturar muestras continuas o manuales para nutrir el dataset de entrenamiento.
"""

import argparse
import time
import httpx
import cv2

from services.vision.app.pipeline.recolector_dataset import RecolectorDataset


def recolectar_desde_api(
    url_api: str = "http://localhost:8000",
    cantidad: int = 10,
    intervalo_seg: float = 2.0,
    clase: str = "sano",
    split: str = "train"
):
    recolector = RecolectorDataset()
    url_frame = f"{url_api}/api/v1/camara/stream"
    print(f"Iniciando recolección de {cantidad} muestras desde {url_api}...")
    print(f"Destino: Split={split} | Categoría={clase}")

    guardadas = 0
    with httpx.Client(timeout=10.0) as client:
        for i in range(cantidad):
            try:
                # Consultar fotograma más reciente
                res = client.get(f"{url_api}/api/v1/camara/estado")
                # Descargar snapshot o capturar desde endpoint
                res_img = client.get(f"{url_api}/api/v1/camara/frame_reciente", timeout=5.0)
                if res_img.status_code == 200:
                    img_bytes = res_img.content
                    ruta = recolector.guardar_muestra(
                        imagen_bytes=img_bytes,
                        etiqueta_clase=clase,
                        split=split
                    )
                    if ruta:
                        guardadas += 1
                        print(f"[{guardadas}/{cantidad}] Muestra guardada: {ruta.name}")
                else:
                    print(f"Aviso: Estado de respuesta {res_img.status_code}")
            except Exception as e:
                print(f"Error en captura #{i+1}: {e}")

            time.sleep(intervalo_seg)

    print(f"Recolección concluida. {guardadas} de {cantidad} muestras archivadas exitosamente.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Recolección de fotos reales para dataset")
    parser.add_argument("--cantidad", type=int, default=5, help="Número de imágenes a capturar")
    parser.add_argument("--clase", type=str, default="sano", choices=["sano", "clorosis", "estres_hidrico", "necrosis"])
    parser.add_argument("--split", type=str, default="train", choices=["train", "val", "test"])
    parser.add_argument("--intervalo", type=float, default=2.0, help="Intervalo en segundos entre tomas")
    args = parser.parse_args()

    recolectar_desde_api(
        cantidad=args.cantidad,
        intervalo_seg=args.intervalo,
        clase=args.clase,
        split=args.split
    )
