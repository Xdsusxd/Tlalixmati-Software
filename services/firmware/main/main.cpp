#include <cstdio>
#include <string>

#ifdef ESP_PLATFORM
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#define TAG_MAIN "TLALIXMATI_ESP32"
#endif

#include "identidad.hpp"
#include "sensores.hpp"
#include "telemetria.hpp"
#include "actuadores.hpp"

using namespace tlalixmati;

// Tarea periódica de FreeRTOS para adquisición y transmisión de telemetría
void tarea_telemetria(void* pvParameters) {
    auto* sensores = static_cast<sensores::GestorSensores*>(pvParameters);
    comunicacion::TransmisorTelemetria transmisor(115200);
    transmisor.inicializar();

    std::string mac = hardware::IdentidadESP32::obtener_mac_fabrica();

#ifdef ESP_PLATFORM
    ESP_LOGI(TAG_MAIN, "Iniciando bucle de telemetria para MAC: %s", mac.c_str());
#else
    std::printf("[ESP32] Tarea de telemetria iniciada para MAC: %s\n", mac.c_str());
#endif

    while (true) {
        // 1. Leer sondas físicas
        sensores::LecturaSensores lectura = sensores->leer_sensores();

        // 2. Construir trama JSON estándar
        std::string trama_json = transmisor.formatear_trama_json(mac, lectura);

        // 3. Transmitir por cable serial hacia la Raspberry Pi
        transmisor.transmitir_trama(trama_json);

#ifdef ESP_PLATFORM
        // Pausa de 3 segundos entre transmisiones (3000 ms)
        vTaskDelay(pdMS_TO_TICKS(3000));
#else
        break; // Una iteración en entorno de prueba
#endif
    }

#ifdef ESP_PLATFORM
    vTaskDelete(NULL);
#endif
}

extern "C" void app_main() {
#ifdef ESP_PLATFORM
    ESP_LOGI(TAG_MAIN, "==================================================");
    ESP_LOGI(TAG_MAIN, "  TLALIXMATI - FIRMWARE ESP32 (TLAHUICOLE)");
    ESP_LOGI(TAG_MAIN, "  Sistema de Adquisicion de Sensores de Campo");
    ESP_LOGI(TAG_MAIN, "==================================================");
#endif

    // 1. Identidad de hardware
    std::string mac = hardware::IdentidadESP32::obtener_mac_fabrica();

    // 2. Inicializar sensores analógicos
    static sensores::GestorSensores sensores;
    sensores.inicializar();

    // 3. Inicializar actuadores en modo modular
    static actuadores::LocomocionPendiente locomocion;
    locomocion.inicializar();

#ifdef ESP_PLATFORM
    // 4. Lanzar tarea de telemetría en Core 1 de FreeRTOS
    xTaskCreatePinnedToCore(
        tarea_telemetria,
        "tarea_telemetria",
        4096,
        &sensores,
        5,
        NULL,
        1
    );
#else
    tarea_telemetria(&sensores);
#endif
}
