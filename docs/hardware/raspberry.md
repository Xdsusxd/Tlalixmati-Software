# Raspberry Pi en Tlahuicole

## Rol de la Raspberry Pi
La Raspberry Pi funcionará como el dispositivo de edge computing principal del sistema Tlahuicole. Se encargará de las tareas de visión por computadora, procesamiento intermedio y servirá como puente de comunicación principal entre el microcontrolador (ESP32) y el backend de Tlalixmati (FastAPI).

## Identificación Automática
Al igual que con el ESP32, la identidad de la Raspberry Pi en la plataforma se derivará de sus identificadores de hardware nativos (por ejemplo, número de serie de la CPU o dirección MAC).

## Interfaces Abstractas
El software se diseñará utilizando interfaces abstractas para permitir flexibilidad futura:
- `Camera`: Una abstracción para la captura de imágenes, independientemente del modelo de cámara específico.
- `DeviceTransport`: Una abstracción para la comunicación con el ESP32, permitiendo protocolos como I2C, SPI o Serial sin acoplamiento fuerte en la lógica de negocio.

## Elementos Aún No Definidos
- No se ha determinado el modelo exacto de Raspberry Pi.
- Faltan por definir los detalles concretos de implementación de las interfaces abstractas (conexiones físicas).

---
**Estado:** Hardware no configurado
