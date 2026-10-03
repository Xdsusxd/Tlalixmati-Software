# Cámaras

## Rol Futuro
Las cámaras serán el medio principal para la obtención de datos visuales (imágenes) en el sistema Tlahuicole, esenciales para los análisis de Inteligencia Artificial (detección, segmentación, etc.).

## Selección de Hardware
Actualmente **NO** se ha seleccionado ningún modelo, interfaz (USB, CSI) ni especificación de cámara.

## Pipeline de Imágenes
Las imágenes fluirán estrictamente de la siguiente manera:
1. **Camera (Hardware real)** captura la imagen.
2. **Raspberry Pi** procesa y empaqueta la imagen.
3. **API (FastAPI)** recibe la imagen en el backend.
4. **Supabase Storage** almacena la imagen de forma permanente.
5. **IA** (PyTorch / YOLO) analiza la imagen desde el almacenamiento.

> [!WARNING]
> **NUNCA** se permitirá la carga o subida manual de imágenes al sistema a través de interfaces de usuario. Todas las imágenes deben originarse exclusivamente desde el hardware de cámara real conectado al sistema Tlahuicole.

---
**Estado:** Cámara no configurada
