# Fase 01: Inicialización y Estructura

## ¿Qué se creó en esta fase?
En esta Fase 01, se estableció la base documental y la estructura inicial (blueprint) del monorepo Tlalixmati. No se ha implementado código funcional de los servicios (API, Frontend, Edge) todavía. Se priorizó establecer las reglas de negocio, la arquitectura y las limitaciones físicas/lógicas del sistema.

## Archivos Creados
Se generó toda la documentación de la carpeta `docs/`, abarcando hardware, software, IA y procesos:
- `docs/hardware/esp32.md`: Define el rol, restricciones y naturaleza del ESP32.
- `docs/hardware/raspberry.md`: Describe la función edge de la Raspberry Pi.
- `docs/hardware/camaras.md`: Establece el flujo exclusivo de imágenes reales.
- `docs/software/arquitectura.md`: Diagrama y explica las relaciones entre componentes.
- `docs/software/configuracion.md`: Define `system.yaml`, `.env.example` y Docker Compose.
- `docs/api/api.md`: Describe el backend FastAPI y su seguridad (contraseña única).
- `docs/ia/modelos.md`: Lista las herramientas PyTorch/YOLO.
- `docs/ia/datasets.md`: Reglas estrictas sobre la creación y naturaleza de los datos.
- `docs/ia/entrenamiento.md`: Pipeline de machine learning requerido.
- `docs/despliegue/README.md`: Estrategia de contenedores y Supabase.
- `docs/fases/fase-01.md`: Este archivo, que resume el progreso inicial.

## ¿Cómo ejecutarlo?
Al tratarse de archivos de documentación Markdown, no hay código ejecutable en esta fase. Se pueden previsualizar utilizando cualquier visor de Markdown o directamente en el repositorio, o consultando los lineamientos descritos en `docs/software/configuracion.md` para preparar el entorno futuro.

## ¿Qué falta?
- Código de inicialización de los servicios en el monorepo (FastAPI, Next.js).
- Estructura de carpetas reales de código (no solo documentación).
- Archivos `.env.example`, `system.yaml`, y `docker-compose.yml`.

## Próximos Pasos (Fase 02)
- Inicializar la estructura de carpetas del monorepo (`apps/`, `packages/`).
- Crear la configuración base (`docker-compose.yml`, `system.yaml`).
- Configurar el boilerplate de FastAPI (Backend) y Next.js (Frontend).
- Establecer la conexión inicial de desarrollo.
