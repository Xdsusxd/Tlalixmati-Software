"""
Red neuronal convolucional en PyTorch para diagnóstico y clasificación de estrés foliar.
Categoriza el estado de las plantas en:
1. SANO (Vigor vegetal óptimo)
2. CLOROSIS (Amarillamiento y deficiencia nutricional)
3. ESTRES_HIDRICO (Marchitamiento y deshidratación)
4. NECROSIS (Daño tisular y manchas foliares)
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms

logger = logging.getLogger("tlalixmati.vision.clasificador")

CLASES_ESTRES = [
    "SANO",
    "CLOROSIS",
    "ESTRES_HIDRICO",
    "NECROSIS"
]


class RedDiagnosticoFoliar(nn.Module):
    """
    Arquitectura ligera basada en MobileNetV3 con cabeza personalizada para diagnóstico agrícola.
    Optimizada para alta velocidad de inferencia en tiempo real en GPU de campo o servidor.
    """
    def __init__(self, num_clases: int = len(CLASES_ESTRES)):
        super().__init__()
        # Cargar backbone ligero preentrenado
        self.backbone = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
        in_features = self.backbone.classifier[0].in_features
        
        # Cabeza clasificadora personalizada
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.2),
            nn.Linear(256, num_clases)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)


class ClasificadorEstresFoliar:
    def __init__(self, ruta_pesos: Optional[str] = None, dispositivo: str = "cpu"):
        self.dispositivo = torch.device(dispositivo if torch.cuda.is_available() and "cuda" in dispositivo else "cpu")
        self.ruta_pesos = ruta_pesos
        self.modelo = RedDiagnosticoFoliar(num_clases=len(CLASES_ESTRES)).to(self.dispositivo)
        self.modelo.eval()
        self._cargado = False
        
        self.transformacion = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
        self._cargar_pesos()

    def _cargar_pesos(self):
        """Carga pesos si existe archivo local de entrenamiento previo."""
        if self.ruta_pesos and Path(self.ruta_pesos).exists():
            try:
                checkpoint = torch.load(self.ruta_pesos, map_location=self.dispositivo, weights_only=True)
                if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                    self.modelo.load_state_dict(checkpoint["state_dict"])
                else:
                    self.modelo.load_state_dict(checkpoint)
                self._cargado = True
                logger.info(f"Pesos de PyTorch cargados exitosamente desde {self.ruta_pesos}")
            except Exception as e:
                logger.warning(f"No se pudieron cargar los pesos de {self.ruta_pesos}: {e}")
        else:
            logger.info("Modelo de PyTorch inicializado con arquitectura base.")

    def clasificar(self, imagen_np: np.ndarray) -> Dict:
        """
        Evalúa un fotograma o recorte vegetal y retorna el diagnóstico con probabilidades.
        """
        try:
            # Convertir arreglo NumPy a imagen PIL
            if len(imagen_np.shape) == 2:
                img_pil = Image.fromarray(imagen_np).convert("RGB")
            else:
                img_pil = Image.fromarray(imagen_np)

            tensor_entrada = self.transformacion(img_pil).unsqueeze(0).to(self.dispositivo)

            with torch.no_grad():
                logits = self.modelo(tensor_entrada)
                probabilidades = torch.softmax(logits, dim=1)[0].cpu().numpy()

            idx_pred = int(np.argmax(probabilidades))
            clase_predicha = CLASES_ESTRES[idx_pred]
            confianza = float(probabilidades[idx_pred])

            # Cálculo del índice de severidad de anomalía (suma de las probabilidades no-sanas)
            prob_sano = float(probabilidades[0])
            prob_anomalias = float(np.sum(probabilidades[1:]))

            es_anomalia = (clase_predicha != "SANO") and (prob_anomalias >= 0.55)

            return {
                "clase": clase_predicha,
                "confianza": confianza,
                "es_anomalia": es_anomalia,
                "indice_anomalia": prob_anomalias,
                "probabilidad_sano": prob_sano,
                "desglose": {
                    CLASES_ESTRES[i]: float(probabilidades[i]) for i in range(len(CLASES_ESTRES))
                }
            }
        except Exception as e:
            logger.error(f"Error en inferencia de clasificación PyTorch: {e}")
            return {
                "clase": "INDETERMINADO",
                "confianza": 0.0,
                "es_anomalia": False,
                "indice_anomalia": 0.0,
                "probabilidad_sano": 1.0,
                "desglose": {}
            }
