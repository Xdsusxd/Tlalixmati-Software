#pragma once

#include <string>

namespace tlalixmati::hardware {

/**
 * Obtiene la dirección MAC física de fábrica grabada en los eFuses del ESP32.
 * Cumple la regla de identidad basada en hardware real sin identificadores inventados.
 */
class IdentidadESP32 {
public:
    static std::string obtener_mac_fabrica();
};

} // namespace tlalixmati::hardware
