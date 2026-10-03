# ESP32 en Tlahuicole

## Rol del ESP32
El ESP32 actuará como el microcontrolador principal dentro del sistema físico Tlahuicole, encargado de interactuar directamente con los componentes de bajo nivel.

## Identificación
La identidad física del dispositivo en el sistema Tlalixmati se basará puramente en identificadores de hardware reales (por ejemplo, la dirección MAC o el ID de chip del ESP32). No habrá asignación de IDs manuales ni lógicos. Tlahuicole representa una agrupación lógica de estos dispositivos físicos.

## Módulos Futuros
- **Sensores**: Para la recopilación de datos del entorno físico.
- **Actuadores**: Para la ejecución de acciones físicas basadas en las instrucciones de la Raspberry Pi o la nube.
- **Comunicación**: Manejo de la transmisión de datos (SPI, I2C, UART) hacia y desde la Raspberry Pi.
- **Diagnóstico**: Monitoreo del estado y la salud del hardware y los periféricos.

## Elementos Aún No Definidos
- No se han asignado pines específicos (GPIOs).
- No se han seleccionado sensores específicos.
- No se han elegido motores ni drivers.

## Incorporación de Hardware Real
Una vez que el hardware sea adquirido y seleccionado, se documentarán los componentes específicos, sus conexiones y el firmware ESP-IDF/C++ necesario para su operación.

---
**Estado:** Hardware no configurado
