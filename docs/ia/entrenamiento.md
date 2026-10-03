# Entrenamiento de Modelos

## Requisitos Previos
Antes de iniciar cualquier proceso de entrenamiento, es absolutamente indispensable contar con:
1. **Imágenes reales** obtenidas desde el hardware final (Cámaras).
2. Un **Dataset** consolidado y validado.
3. **Etiquetas (Labels)** completas y correctas para dicho dataset.

## Flujo de Entrenamiento (Pipeline)
El ciclo de vida del entrenamiento de los modelos seguirá estos pasos de manera estricta:
1. **Recolección** de imágenes.
2. **Organización** y almacenamiento.
3. **Limpieza** de datos espurios.
4. **Etiquetado** riguroso.
5. **Revisión** cruzada de etiquetas.
6. **Split** (Entrenamiento, Validación, Prueba).
7. **Entrenamiento**: Uso de hardware acelerado.
8. **Evaluación**: Métricas sobre los conjuntos de validación y prueba.
9. **Análisis de Error**: Diagnóstico de falsos positivos/negativos.
10. **Mejora**: Ajustes de hiperparámetros o recolección de nueva data.

## Hardware
El entrenamiento aprovechará la tarjeta gráfica disponible:
- **GPU**: NVIDIA RTX 4050
- **Aceleración**: CUDA

## Estado Actual
No se ha realizado ningún entrenamiento en esta fase.
