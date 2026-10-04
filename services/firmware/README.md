# Firmware ESP32 — Tlalixmati (Tlahuicole)

Este directorio contiene el firmware C++ en FreeRTOS / ESP-IDF para el microcontrolador de campo **ESP32** de la unidad física **Tlahuicole**.

---

## 1. Mapeo de Pines y Conexiones Físicas

| Función | Pin ESP32 | Tipo | Dispositivo de Campo |
|---|---|---|---|
| **Humedad de Suelo** | `GPIO 34` | ADC1_CH6 (Entrada Analógica 0-3.3V) | Sensor Capacitivo de Humedad v1.2 |
| **Radiación / Luz** | `GPIO 35` | ADC1_CH7 (Entrada Analógica 0-3.3V) | Fotocelda LDR o Sensor BH1750 |
| **Tensión de Batería**| `GPIO 36` | ADC1_CH0 / VP (Entrada Analógica) | Divisor de tensión resistivo (100k / 27k) |
| **UART TX (Hacia RPi)**| `GPIO 1` | Salida Serial 115200 baudios | Conexión a RX de Raspberry Pi o cable USB directo |
| **UART RX (Desde RPi)**| `GPIO 3` | Entrada Serial 115200 baudios | Conexión a TX de Raspberry Pi o cable USB directo |

---

## 2. Protocolo de Transmisión Serial
Cada 3 segundos, el ESP32 envía por puerto serie una línea JSON terminada en salto de línea `\n`:
```json
{"mac":"24:6F:28:AA:BB:CC","humedad_suelo":62.5,"temperatura":23.4,"radiacion":780,"bateria":3.95}
```
Esta trama es recibida y validada de forma automática por el servicio de la Raspberry Pi (`services/raspberry/app/hardware/enlace_esp32.py`).

---

## 3. Instrucciones de Compilación y Flasheo (ESP-IDF)

### Requisitos:
* ESP-IDF v5.0 o superior instalado.
* Cable USB conectado al ESP32.

### Comandos:
```bash
# 1. Configurar objetivo para ESP32 estándar
idf.py set-target esp32

# 2. Compilar el proyecto C++
idf.py build

# 3. Flashear al microcontrolador y abrir monitor serial (reemplazar COM3 por tu puerto)
idf.py -p COM3 flash monitor
```

---

## 4. Módulo de Actuadores y Locomoción
El componente `actuadores` define la interfaz abstracta `IControladorLocomocion`. Está preparado para vincularse al controlador de motores en cuanto se defina el chasis físico final (ruedas 4x4, orugas, riel o cabezal móvil pan-tilt).
