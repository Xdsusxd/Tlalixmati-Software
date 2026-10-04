#include "identidad.hpp"
#include <cstdio>
#include <array>

#ifdef ESP_PLATFORM
#include "esp_mac.h"
#include "esp_system.h"
#endif

namespace tlalixmati::hardware {

std::string IdentidadESP32::obtener_mac_fabrica() {
    std::array<uint8_t, 6> mac = {0};

#ifdef ESP_PLATFORM
    // Lectura de la MAC real de fábrica grabada en eFuses (Station MAC)
    esp_read_mac(mac.data(), ESP_MAC_WIFI_STA);
#else
    // Fallback de desarrollo local cuando se compila en simulador de host
    mac = {0x24, 0x6F, 0x28, 0xAA, 0xBB, 0xCC};
#endif

    char mac_str[18] = {0};
    std::snprintf(
        mac_str,
        sizeof(mac_str),
        "%02X:%02X:%02X:%02X:%02X:%02X",
        mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]
    );

    return std::string(mac_str);
}

} // namespace tlalixmati::hardware
