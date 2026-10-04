# FASE 07 — FIRMWARE ESP32 EN C++ / ESP-IDF (TLAHUICOLE)

## 1. Resumen
Se implementó el firmware modular en C++ y FreeRTOS para el microcontrolador de campo **ESP32** en [`services/firmware/`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/):
- **Rol en el sistema**: Adquisición física directa de sensores de suelo y ambiente, empaquetado en tramas JSON estándar y transmisión periódica por puerto serial UART hacia la Raspberry Pi.
- **Identidad de Hardware Real**: Lee la dirección MAC física de fábrica grabada en los eFuses (`ESP_MAC_WIFI_STA`), cumpliendo la regla de **cero identificadores inventados**.
- **Mapeo de Pines y ADC**:
  - `GPIO 34` (ADC1_CH6): Sensor capacitivo de humedad de suelo v1.2.
  - `GPIO 35` (ADC1_CH7): Sensor de radiación / fotocelda LDR.
  - `GPIO 36` (ADC1_CH0): Divisor de tensión de alimentación/batería.
  - `GPIO 1` / `GPIO 3`: Transmisor/Receptor UART0 hacia la Raspberry Pi a 115200 baudios.
- **Locomoción y Actuadores Modulares**: Capa abstracta `IControladorLocomocion` desacoplada y lista para conectarse a motores en cuanto se defina el chasis físico al final (ruedas, orugas, riel o cabezal móvil).

---

## 2. Componentes Creados

1. [`services/firmware/CMakeLists.txt`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/CMakeLists.txt): Configuración raíz para compilación con ESP-IDF / CMake.
2. [`services/firmware/sdkconfig.defaults`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/sdkconfig.defaults): Opciones optimizadas de FreeRTOS, stack y UART.
3. [`services/firmware/components/identidad/`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/components/identidad/): Lectura de la MAC física real de fábrica.
4. [`services/firmware/components/sensores/`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/components/sensores/): Lectura y filtrado de canales analógicos ADC1.
5. [`services/firmware/components/telemetria/`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/components/telemetria/): Formateo de tramas JSON y envío UART por cable serie.
6. [`services/firmware/components/actuadores/`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/components/actuadores/): Interfaz de locomoción modular.
7. [`services/firmware/main/main.cpp`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/main/main.cpp): Inicialización y tarea periódica de FreeRTOS (`tarea_telemetria`) en Core 1 cada 3000 ms.
8. [`services/firmware/README.md`](file:///c:/PROYECTS/proyecto/tlalixmati/services/firmware/README.md): Guía de conexiones físicas, compilación y flasheo (`idf.py build`, `idf.py flash`).
9. [`tests/test_firmware_protocolo.py`](file:///c:/PROYECTS/proyecto/tlalixmati/tests/test_firmware_protocolo.py): Pruebas de compatibilidad del protocolo serial con el receptor de la Raspberry Pi.

---

## 3. Verificación
- Suite de pruebas de pytest: **36/36 pruebas aprobadas al 100%**.
- Protocolo probado: Las tramas JSON del ESP32 son decodificadas y validadas por el servicio de la Raspberry Pi sin errores.
- Próximo paso: **FASE 08: Pipeline de Visión por Computadora e Inteligencia Artificial (PyTorch / YOLOv8)**.
