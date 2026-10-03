# Datasets y Datos

## Estado Actual
Actualmente **NO** existen datasets creados para Tlalixmati. 

> [!CAUTION]
> **Regla de Oro**: Nunca se inventarán ni generarán datos falsos (Fake data), mediciones, ni imágenes simuladas. Todo dato debe provenir estrictamente de la recolección física en hardware real.

## Flujo de Trabajo Futuro
El proceso para la creación de datasets seguirá este pipeline:
1. **Recolección**: Obtención de imágenes desde las cámaras reales.
2. **Organización**: Estructuración del material crudo.
3. **Limpieza**: Eliminación de imágenes defectuosas o inútiles.
4. **Etiquetado**: Anotación manual de las imágenes (bounding boxes, máscaras de segmentación).
5. **Revisión**: Verificación de calidad del etiquetado.
6. **División (Split)**: Partición del dataset en conjuntos de entrenamiento, validación y prueba.

## Rol del Asistente de IA
El asistente virtual (IA de desarrollo) ayudará en el futuro a:
- Determinar los tipos y variaciones de imágenes necesarias.
- Sugerir cantidades óptimas de recolección para lograr significancia estadística.
- Recomendar las condiciones ambientales (iluminación, ángulos) requeridas para la recolección robusta.
