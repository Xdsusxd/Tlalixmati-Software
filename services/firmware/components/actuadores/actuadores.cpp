#include "actuadores.hpp"

#ifdef ESP_PLATFORM
#include "esp_log.h"
#define TAG_ACTUADORES "ACTUADORES_ESP32"
#endif

namespace tlalixmati::actuadores {

bool LocomocionPendiente::inicializar() {
#ifdef ESP_PLATFORM
    ESP_LOGI(TAG_ACTUADORES, "Módulo de locomoción en modo modular de espera (chasis pendiente de selección final).");
#endif
    return true;
}

void LocomocionPendiente::mover(float velocidad_x, float velocidad_y) {
    // Operación segura sin hardware asignado
}

void LocomocionPendiente::detener() {
    // Operación segura sin hardware asignado
}

const char* LocomocionPendiente::obtener_tipo_chasis() const {
    return "Pendiente de seleccion final (Ruedas/Riel/Orugas)";
}

} // namespace tlalixmati::actuadores
