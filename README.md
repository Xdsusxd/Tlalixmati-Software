# Tlalixmati

## Plataforma Inteligente de Monitoreo Agrícola

**Tlalixmati** es una plataforma integral diseñada para la observación, análisis y gestión de sistemas agrícolas mediante tecnología de vanguardia. Combina hardware de campo, visión artificial e inteligencia artificial para proporcionar información en tiempo real sobre el estado de los cultivos y el entorno.

La plataforma abarca desde los dispositivos físicos ubicados en el campo, conocidos lógicamente como Tlahuicole, hasta una infraestructura en la nube y un panel de control avanzado que permite la visualización y análisis de los datos recolectados y las imágenes procesadas.

El objetivo de Tlalixmati es fusionar la ciencia de datos, el aprendizaje automático y la ingeniería electrónica para optimizar las decisiones agrícolas basadas en información precisa, medible y constante, eliminando suposiciones y maximizando la eficiencia.

---

## ¿Qué es Tlalixmati?

Tlalixmati representa la totalidad del sistema. Es el ecosistema completo compuesto por:
*   **Hardware de campo:** Sensores, actuadores, microcontroladores y computadoras de placa reducida.
*   **Software de borde (Edge):** Procesamiento local de imágenes y lectura de datos.
*   **Backend y API:** Servicios para la recepción, enrutamiento y almacenamiento de la información.
*   **Infraestructura Cloud:** Bases de datos, almacenamiento de imágenes y servicios alojados en Supabase.
*   **Dashboard / Panel de control:** Interfaz de usuario para monitoreo y gestión.
*   **Inteligencia Artificial:** Modelos de visión artificial para el análisis avanzado de cultivos.

---

## ¿Qué es Tlahuicole?

**Tlahuicole** no es un dispositivo independiente, sino la agrupación lógica de los componentes físicos desplegados en el campo. Su identidad no proviene de un nombre asignado, sino que se deriva directamente del hardware que lo compone.

Consiste principalmente en un sistema compuesto por microcontroladores (como el ESP32) para la lectura de sensores y control de actuadores, y computadoras de placa reducida (como la Raspberry Pi) para la captura de imágenes, procesamiento intensivo y ejecución de modelos de IA en el borde.

```text
              TLALIXMATI
                  │
              TLAHUÍCOLE
          ┌───────┴────────┐
          │                │
        ESP32          Raspberry Pi
          │                │
      sensores          cámara/IA
      actuadores        procesamiento
          │                │
          └───────┬────────┘
                  │
                datos
                  │
               Tlalixmati
```

---

## Arquitectura

El proyecto Tlalixmati utiliza una estructura de monorepositorio para centralizar todo el código fuente, facilitando el desarrollo, pruebas y despliegue coordinado.

### Flujo de Comunicación
El flujo de datos sigue este camino:
`ESP32` ↔ `Raspberry Pi` ↔ `FastAPI` (Backend) ↔ `Supabase` (Base de datos y Storage).

### Estructura del Monorepo (Árbol de Directorios)

```text
tlalixmati/
├── api/             # Backend FastAPI
├── dashboard/       # Frontend Next.js
├── firmware/        # Código C++ para ESP32
├── edge/            # Código Python para Raspberry Pi
├── ai/              # Entrenamiento y modelos (PyTorch, YOLO)
├── config/          # Archivos de configuración globales
├── docker-compose.yml
└── README.md
```

---

## Stack Tecnológico

| Componente | Tecnologías |
| :--- | :--- |
| **Firmware (Hardware)** | C++, ESP-IDF, CMake |
| **Raspberry / Edge** | Python 3, OpenCV, NumPy, PyTorch, Ultralytics YOLO |
| **Inteligencia Artificial** | PyTorch, Ultralytics YOLO, OpenCV, NumPy |
| **Backend / API** | Python, FastAPI, Pydantic |
| **Cloud / Base de Datos** | Supabase, PostgreSQL, Supabase Storage |
| **Frontend (Dashboard)** | Next.js, TypeScript, Tailwind CSS, Recharts, GSAP |
| **Infraestructura** | Git, GitHub, Docker, Docker Compose |

---

## Instalación

Sigue estos pasos para desplegar la plataforma localmente utilizando Docker:

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd tlalixmati
    ```
2.  **Configurar variables de entorno:**
    Copia el archivo de ejemplo y configúralo con tus credenciales.
    ```bash
    cp .env.example .env
    ```
3.  **Configurar Supabase:**
    Asegúrate de llenar las credenciales de Supabase en el archivo `.env` (`SUPABASE_URL`, `SUPABASE_KEY`).
4.  **Iniciar los servicios:**
    Usa Docker Compose para levantar el entorno completo.
    ```bash
    docker-compose up -d
    ```
5.  **Acceder al Dashboard:**
    Abre tu navegador web y navega a `http://localhost:3000`.

---

## Configuración

La configuración del sistema se gestiona a través de dos mecanismos principales:
*   **`system.yaml`**: Archivo centralizado que define parámetros estáticos y configuraciones estructurales del proyecto (rutas, constantes de hardware, definiciones de umbrales predeterminados).
*   **Variables de Entorno (`.env`)**: Gestiona secretos, credenciales de conexión y parámetros específicos del entorno de ejecución (desarrollo, producción).
*   **Docker Services**: Cada componente (API, Dashboard) cuenta con su propio `Dockerfile` y configuración dentro de `docker-compose.yml`.

---

## Variables de Entorno

| Variable | Descripción | Requerido | Formato | Origen |
| :--- | :--- | :--- | :--- | :--- |
| `GLOBAL_PASSWORD` | Contraseña única para acceder al sistema | Sí | String | Usuario |
| `SUPABASE_URL` | URL del proyecto Supabase | Sí | URL | Supabase |
| `SUPABASE_KEY` | Clave anónima o de servicio de Supabase | Sí | String | Supabase |
| `API_PORT` | Puerto donde se expone el backend FastAPI | No | Entero (ej. 8000) | Sistema |
| `DASHBOARD_PORT` | Puerto donde se expone el frontend Next.js | No | Entero (ej. 3000) | Sistema |

---

## Acceso y Seguridad

El sistema está diseñado para uso privado y unificado.
*   **Contraseña Global:** El acceso al Dashboard está protegido por una contraseña única y global (`GLOBAL_PASSWORD`).
*   **Sin Gestión de Usuarios:** No se utiliza autenticación de Supabase (Supabase Auth), no hay registro (OAuth) ni roles de múltiples usuarios.
*   **Sesión Segura:** La sesión se maneja mediante cookies seguras, configuradas como `HttpOnly` y `SameSite` para prevenir ataques XSS y CSRF.

---

## Imágenes y Flujo Visual

La plataforma maneja el procesamiento de imágenes siguiendo reglas estrictas:
*   Las imágenes provienen **ÚNICAMENTE** de hardware de cámara real (Raspberry Pi/Tlahuicole).
*   **NUNCA** se permite la carga manual de imágenes a través del Dashboard o la API.
*   **Pipeline Visual:** Hardware de Cámara → Raspberry Pi → API FastAPI → Supabase Storage → Análisis de IA.

---

## IA y Computer Vision

El núcleo analítico se basa en visión artificial.
*   **Tecnologías:** PyTorch y modelos basados en la arquitectura YOLO.
*   **Hardware de Entrenamiento:** GPU NVIDIA RTX 4050.
*   **Prioridad:** El objetivo principal es detectar cambios visibles, anomalías, crecimiento y salud general en los cultivos.
*   **Estado:** A la fecha, aún no se han entrenado modelos ni se han recopilado conjuntos de datos (datasets). Estos se crearán cuando el hardware real esté operativo.

---

## Identidad de Hardware

La identificación de los dispositivos en el sistema está automatizada para evitar errores humanos.
*   **ESP32:** La identificación se obtiene automáticamente a partir del hardware físico (ej. dirección MAC).
*   **Raspberry Pi:** La identificación se lee automáticamente a nivel de sistema.
*   **Sin IDs Manuales:** No se permiten nombres o IDs asignados manualmente (como `tlahuicole-01`).
*   La estrategia definitiva de emparejamiento (pairing) se diseñará una vez que el hardware físico esté disponible e implementado.

---

## Diseño Visual

El Dashboard sigue lineamientos de diseño específicos:
*   **Estilo:** Minimalista, fluido y profesional, apoyado por animaciones suaves con GSAP.
*   **Paleta de Colores:** Tonos orgánicos y técnicos. Negro, blanco, gris, verde natural, verde oscuro, marrón, tonos tierra y beige sutil.
*   **Sensación:** El diseño debe transmitir "tierra", "ciencia", "agricultura" y "tecnología".

---

## Roadmap (Fases de Desarrollo)

El desarrollo del proyecto está estructurado en 16 fases:

1.  **FASE 01: Fundación** - Estructura inicial, monorepo, documentación. (ACTUAL)
2.  **FASE 02: Backend** - Pendiente.
3.  **FASE 03: Base de Datos** - Pendiente.
4.  **FASE 04: Dashboard Base** - Pendiente.
5.  **FASE 05: Seguridad y Acceso** - Pendiente.
6.  **FASE 06: Hardware Edge** - Pendiente.
7.  **FASE 07: Firmware Microcontrolador** - Pendiente.
8.  **FASE 08: Integración Hardware-Backend** - Pendiente.
9.  **FASE 09: Pipeline de Imágenes** - Pendiente.
10. **FASE 10: Infraestructura IA** - Pendiente.
11. **FASE 11: Entrenamiento de Modelos** - Pendiente.
12. **FASE 12: Inferencia Edge/Cloud** - Pendiente.
13. **FASE 13: Dashboard Avanzado (Analítica)** - Pendiente.
14. **FASE 14: Sistema de Alertas** - Pendiente.
15. **FASE 15: Pruebas de Campo** - Pendiente.
16. **FASE 16: Optimización y Despliegue** - Pendiente.

---

## Estado Actual

Actualmente el proyecto se encuentra en la **FASE 01**.

*   ✅ Estructura base del monorepositorio.
*   ✅ Documentación principal (README).
*   ✅ Definición de configuraciones y arquitectura.
*   ❌ Backend (FASE 02).
*   ❌ Base de datos (FASE 03).
*   ❌ Y fases subsiguientes...

Aún no se cuenta con hardware físico ni datos generados por sensores.

---

## Licencia

Este proyecto está licenciado bajo la licencia **MIT**.
