#pragma once

#include <string>
#include "sensores.hpp"

namespace tlalixmati::comunicacion {

/**
 * Gestiona el formateo de tramas JSON y su transmisión por UART hacia la Raspberry Pi.
 */
class TransmisorTelemetria {
public:
    TransmisorTelemetria(int baudrate = 115200);
    bool inicializar();

    // Construye la trama JSON estándar esperada por el servicio Edge de Raspberry Pi
    std::string formatear_trama_json(
        const std::string& mac_dispositivo,
        const tlalixmati::sensores::LecturaSensores& lectura
    );

    // Envía la cadena terminada en salto de línea por el puerto UART
    bool transmitir_trama(const std::string& trama);

private:
    int _baudrate;
    int _puerto_uart_num;
    bool _inicializado;
};

} // namespace tlalixmati::comunicacion
