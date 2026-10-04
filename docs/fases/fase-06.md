# FASE 06 — MÓDULO EDGE EN RASPBERRY PI (TLAHUICOLE)

## 1. Resumen
Se implementó el servicio autónomo en Python para la **Raspberry Pi** en [`services/raspberry/`](file:///c:/PROYECTS/proyecto/tlalixmati/services/raspberry/):
- **Rol en el sistema**: Puente de cómputo en campo entre el microcontrolador físico (ESP32), la cámara y la plataforma central (FastAPI + Supabase).
- **Identidad física real**: Obtiene el identificador de la CPU directamente de `/proc/cpuinfo` (o identificador de nodo del sistema operativo en pruebas), respetando la regla de **cero identificadores inventados**.
- **Ingesta de video**: Captura de fotogramas ópticos a `640x360` a 10 FPS y transmisión continua por HTTP a `POST /api/v1/camara/frame` para alimentar el streaming del dashboard.
- **Enlace serial con ESP32**: Conexión por puerto serie UART/USB (`/dev/ttyUSB0`) con recepción y parseo seguro de tramas JSON de sensores.
- **Servicio Systemd**: Archivo de configuración `tlalixmati-edge.service` para arranque automático al encender la Raspberry Pi.

---

## 2. Componentes Creados

1. [`services/raspberry/app/core/config.py`](file:///c:/PROYECTS/proyecto/tlalixmati/services/raspberry/app/core/config.py): Configuración de variables de red, puertos seriales y parámetros de cámara.
2. [`services/raspberry/app/hardware/identidad.py`](file:///c:/PROYECTS/proyecto/tlalixmati/services/raspberry/app/hardware/identidad.py): Lectura del número de serie real de la CPU.
3. [`services/raspberry/app/hardware/camara.py`](file:///c:/PROYECTS/proyecto/tlalixmati/services/raspberry/app/hardware/camara.py): Captura de fotogramas físicos y codificación JPEG.
4. [`services/raspberry/app/hardware/enlace_esp32.py`](file:///c:/PROYECTS/proyecto/tlalixmati/services/raspberry/app/hardware/enlace_esp32.py): Comunicación serial robusta con reconexión automática ante desconexiones de cable.
5. [`services/raspberry/app/servicio_edge.py`](file:///c:/PROYECTS/proyecto/tlalixmati/services/raspberry/app/servicio_edge.py): Orquestador del bucle principal de campo.
6. [`services/raspberry/app/main.py`](file:///c:/PROYECTS/proyecto/tlalixmati/services/raspberry/app/main.py): CLI con soporte para `--once` (diagnóstico único) o ejecución continua.
7. [`services/raspberry/README.md`](file:///c:/PROYECTS/proyecto/tlalixmati/services/raspberry/README.md): Guía de instalación y configuración de systemd.
8. [`tests/test_service_raspberry.py`](file:///c:/PROYECTS/proyecto/tlalixmati/tests/test_service_raspberry.py): Pruebas unitarias de captura, serial e identidad.

---

## 3. Verificación
- Suite de pruebas de pytest: **34/34 pruebas aprobadas al 100%**.
- Próximo paso: **FASE 07: Firmware ESP32 (C++ / ESP-IDF)**.
