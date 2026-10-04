# Tlalixmati

> **Plataforma Inteligente de Monitoreo Agrícola y Diagnóstico Fitosanitario**

Tlalixmati es una solución integral que une software en la nube, visión artificial por computadora y hardware embebido en campo para la supervisión agronómica de cultivos. Su objetivo es proporcionar diagnósticos visuales precisos, telemetría ambiental fidedigna y generación automática de alertas cuando se detecta estrés o deterioro vegetal.

El sistema de campo, denominado **Tlahuícole**, opera como una agrupación lógica de componentes físicos reales (microcontrolador **ESP32** para sensores de suelo y ambiente, y **Raspberry Pi** para captura de video de alta definición e inferencia en el borde). Su identidad proviene directamente de los identificadores de silicio de cada dispositivo (MAC en eFuses y serial de CPU), eliminando identificadores inventados o entidades ficticias.

---

## 1. Arquitectura del Sistema

```
                         TLALIXMATI (Cloud / Server)
                     ┌─────────────────────────────────┐
                     │  FastAPI Backend (Puerto 8000)  │
                     │  Next.js Dashboard (Puerto 3000)│
                     │  Proxy Nginx (Puertos 80 / 443) │
                     │  Supabase (PostgreSQL + Storage)│
                     └────────────────┬────────────────┘
                                      ▲
                        HTTPS / REST  │  Streaming MJPEG
                                      ▼
                        TLAHUÍCOLE (Unidad de Campo)
          ┌───────────────────────────┴───────────────────────────┐
          │                                                       │
    ESP32 (Core 1)                                        Raspberry Pi (Edge)
  ┌─────────────────────────┐                           ┌─────────────────────────┐
  │ Firmware C++ / FreeRTOS │  UART Serial (115200)     │ Servicio Edge Python    │
  │ Lectura ADC 12 bits     │ ◄───────────────────────► │ Autodetección Max FPS   │
  │ Sonda capacitiva suelo  │     JSON Líneas           │ Cámara CSI / USB HD-4K  │
  │ Sensor LDR y Batería    │                           │ Orquestador de Visión   │
  └─────────────────────────┘                           └─────────────────────────┘
```

---

## 2. Pila Tecnológica (Stack)

| Capa | Tecnologías | Descripción |
| :--- | :--- | :--- |
| **Backend & API** | Python 3.10, FastAPI, Pydantic v2, FPDF2 | API REST asíncrona, generación de PDF agronómicos y streaming de video. |
| **Dashboard Web** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 | Interfaz orgánica minimalista, visualizador en vivo, métricas Recharts y animaciones GSAP. |
| **Visión & IA** | PyTorch 2.5.1+cu121, Ultralytics YOLOv8, OpenCV | Segmentación vegetal, clasificación de estrés foliar (MobileNetV3) y análisis espectral ExG. |
| **Aceleración GPU** | NVIDIA GeForce RTX 4050 Laptop GPU, CUDA 12.1 | Inferencia y entrenamiento acelerado localmente por hardware. |
| **Edge Computing** | Raspberry Pi OS, Python 3, V4L2 | Transmisión de fotogramas a tasa nativa del sensor y puente UART con el ESP32. |
| **Firmware** | C++, ESP-IDF, FreeRTOS | Tarea en Núcleo 1, lectura de registros ADC analógicos con filtrado de ruido. |
| **Base de Datos & Cloud**| Supabase (PostgreSQL 15), Supabase Storage | 10 tablas relacionales, buckets `informes-pdf` e `imagenes-cultivo`. |
| **Infraestructura** | Docker, Docker Compose, Nginx, Let's Encrypt | Contenedorización para desarrollo local y despliegue en dominio público con HTTPS. |

---

## 3. Principios Fundamentales del Proyecto

1. **Cero Datos Falsos (Full Producción)**: Ningún componente inventa lecturas de sensores, direcciones MAC ni fotogramas simulados. Si un sensor físico está desconectado, el sistema reporta honestamente `null` o `"Sin datos"`.
2. **Cámara con Autodetección Máxima Nativa**: Se eliminaron límites artificiales de resolución y FPS. El capturador detecta automáticamente el máximo soportado por el sensor (4K, 2K, 1080p a 30/60 FPS) usando compresión `MJPG` de alto rendimiento.
3. **Informes PDF Automáticos y Manuales**:
   * **Automático**: Se dispara de forma autónoma cuando los modelos de IA (YOLO + PyTorch) detectan una planta en mal estado (clorosis, necrosis o estrés hídrico), generando un reporte con encabezado rojo y subiéndolo al bucket `informes-pdf` de Supabase.
   * **Manual**: Accesible con un clic desde el dashboard para generar reportes fitosanitarios regulares.
4. **Seguridad y Acceso**: Contraseña global única del sistema mediante hash `bcrypt`, sesión con cookie `HttpOnly` firmada por HMAC-SHA256 y detección automática de HTTPS (`Secure=True`).

---

## 4. Estructura del Monorepositorio

```
tlalixmati/
├── apps/
│   ├── api/                     # Backend FastAPI (Servicios, endpoints, PDF y streaming)
│   └── web/                     # Frontend Next.js (Dashboard minimalista orgánico)
├── services/
│   ├── firmware/                # Código C++ para ESP32 (ESP-IDF, FreeRTOS, ADC)
│   ├── raspberry/               # Servicio Edge para Raspberry Pi (Cámara y UART)
│   └── vision/                  # Pipeline de IA (PyTorch, YOLOv8, scripts de entrenamiento)
├── deploy/                      # Infraestructura de despliegue (Nginx, plantillas y SSL)
├── database/                    # Esquemas SQL y migraciones para Supabase PostgreSQL
├── docs/                        # Documentación técnica y bitácora de fases
├── tests/                       # Suite de pruebas automatizadas (41 pruebas pytest)
├── docker-compose.yml           # Orquestación de desarrollo local
├── docker-compose.prod.yml      # Orquestación de producción con Proxy Inverso y SSL
├── run.bat                      # Lanzador interactivo para Windows
└── pyproject.toml               # Configuración del entorno Python y pruebas
```

---

## 5. Estado del Roadmap

| Fase | Título | Estado | Detalle |
| :---: | :--- | :---: | :--- |
| **01** | **Fundación del Monorepo** | ✅ Completa | Estructura base, reglas de proyecto y configuración global. |
| **02** | **Backend y API REST** | ✅ Completa | FastAPI con esquemas Pydantic v2 y endpoints modulares. |
| **03** | **Base de Datos y Almacenamiento** | ✅ Completa | Esquema PostgreSQL en Supabase y buckets de almacenamiento. |
| **04** | **Seguridad y Autenticación** | ✅ Completa | Contraseña global única con hash bcrypt y cookies HttpOnly. |
| **05** | **Dashboard Web Agronómico** | ✅ Completa | Next.js 16, diseño orgánico sin datos falsos y streaming en vivo. |
| **06** | **Servicio Edge Raspberry Pi** | ✅ Completa | Enlace serial con ESP32 y cámara con autodetección de resolución/FPS. |
| **07** | **Firmware ESP32 de Producción** | ✅ Completa | Lectura real de ADC oneshot, JSON con nulls e interfaz de locomoción. |
| **08** | **Pipeline de Visión e IA** | ✅ Completa | Detección YOLOv8, clasificación PyTorch en RTX 4050 y alerta PDF. |
| **09** | **Despliegue en Dominio Web** | ✅ Completa | Proxy Nginx con SSL/TLS (HTTPS) y streaming MJPEG optimizado. |
| **10** | **Telemetría, Bitácora y Cultivos** | ✅ Completa | Ingesta real desde ESP32, persistencia en PostgreSQL, bitácora de eventos y gráfica histórica. |
| **11** | **Locomoción Física de Tlahuicole** | ⏳ En espera | Postergado hasta contar con el chasis físico final (motores, drivers y actuadores). |

---

## 6. Instalación y Uso

### Desarrollo Local
1. Clona el repositorio y crea tu archivo de variables `.env`:
   ```bash
   cp .env.example .env
   ```
2. Inicia con Docker Compose:
   ```bash
   docker compose up -d --build
   ```
   O utiliza el lanzador interactivo en Windows:
   ```bash
   run.bat
   ```
3. Accede al Dashboard en `http://localhost:3000` y a la API en `http://localhost:8000/docs`.

### Despliegue en Dominio Público (Producción)
Consulta la guía completa en [`docs/despliegue/dominio.md`](docs/despliegue/dominio.md):
```bash
cp .env.production.example .env
# Configura DOMAIN_NAME=cultivo.tudominio.com en .env
docker compose -f docker-compose.prod.yml up -d --build
```

### Ejecutar Pruebas Automatizadas
```bash
py -3.10 -m pytest -v
```

---

## 7. Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más información.
