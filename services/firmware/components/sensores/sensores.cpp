#include "sensores.hpp"
#include <cmath>

#ifdef ESP_PLATFORM
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#define TAG_SENSORES "SENSORES_ESP32"

static adc_oneshot_unit_handle_t s_adc1_handle = nullptr;
#endif

namespace tlalixmati::sensores {

GestorSensores::GestorSensores()
    : _pin_humedad_adc(34),
      _pin_luz_adc(35),
      _pin_bateria_adc(36),
      _inicializado(false) {}

bool GestorSensores::inicializar() {
#ifdef ESP_PLATFORM
    // Configuración de unidad ADC1 para lectura directa de registros en ESP32
    adc_oneshot_unit_init_cfg_t init_config = {
        .unit_id = ADC_UNIT_1,
        .ulp_mode = ADC_ULP_MODE_DISABLE,
    };
    if (adc_oneshot_new_unit(&init_config, &s_adc1_handle) == ESP_OK) {
        adc_oneshot_chan_cfg_t canal_cfg = {
            .atten = ADC_ATTEN_DB_12,
            .bitwidth = ADC_BITWIDTH_DEFAULT,
        };
        // GPIO 34: Sonda capacitiva de humedad de suelo
        adc_oneshot_config_channel(s_adc1_handle, ADC_CHANNEL_6, &canal_cfg);
        // GPIO 35: Sensor analógico de luminosidad / LDR
        adc_oneshot_config_channel(s_adc1_handle, ADC_CHANNEL_7, &canal_cfg);
        // GPIO 36: Divisor de tensión de batería de alimentación
        adc_oneshot_config_channel(s_adc1_handle, ADC_CHANNEL_0, &canal_cfg);
        ESP_LOGI(TAG_SENSORES, "Unidad ADC1 configurada en GPIO 34, 35 y 36.");
    }
#endif
    _inicializado = true;
    return true;
}

LecturaSensores GestorSensores::leer_sensores() {
    LecturaSensores lectura = {0};

#ifdef ESP_PLATFORM
    if (s_adc1_handle != nullptr) {
        int raw_humedad = 0;
        int raw_luz = 0;
        int raw_bateria = 0;

        // Lectura de canal 6 (GPIO 34 - Humedad de Suelo)
        if (adc_oneshot_read(s_adc1_handle, ADC_CHANNEL_6, &raw_humedad) == ESP_OK) {
            // Un sensor analógico conectado entrega lecturas dentro del rango de tensión válido
            // Si el pin está flotante o desconectado, raw suele leer cerca de 0 o saturación
            if (raw_humedad >= 300 && raw_humedad <= 3900) {
                lectura.sensor_humedad_conectado = true;
                // Calibración estándar de sonda capacitiva: 3100 (seco = 0%) a 1300 (saturado = 100%)
                float pct = 100.0f * (3100.0f - static_cast<float>(raw_humedad)) / (3100.0f - 1300.0f);
                if (pct < 0.0f) pct = 0.0f;
                if (pct > 100.0f) pct = 100.0f;
                lectura.humedad_suelo_pct = pct;
            } else {
                lectura.sensor_humedad_conectado = false;
                lectura.humedad_suelo_pct = 0.0f;
            }
        }

        // Lectura de canal 7 (GPIO 35 - Radiación / Luz)
        if (adc_oneshot_read(s_adc1_handle, ADC_CHANNEL_7, &raw_luz) == ESP_OK) {
            if (raw_luz > 40) {
                lectura.radiacion_lux = (static_cast<float>(raw_luz) / 4095.0f) * 2000.0f;
            } else {
                lectura.radiacion_lux = 0.0f;
            }
        }

        // Lectura de canal 0 (GPIO 36 - Tensión de Batería con divisor resistivo 1:2)
        if (adc_oneshot_read(s_adc1_handle, ADC_CHANNEL_0, &raw_bateria) == ESP_OK) {
            if (raw_bateria > 200) {
                float v_pin = (static_cast<float>(raw_bateria) / 4095.0f) * 3.3f;
                lectura.voltaje_bateria = v_pin * 2.0f;
            } else {
                lectura.voltaje_bateria = 0.0f;
            }
        }
    }
#else
    // Entorno de simulación sin microcontrolador físico conectado:
    // Cero datos inventados; reporta honestamente hardware no conectado
    lectura.sensor_humedad_conectado = false;
    lectura.humedad_suelo_pct = 0.0f;
    lectura.sensor_temperatura_conectado = false;
    lectura.temperatura_celsius = 0.0f;
    lectura.radiacion_lux = 0.0f;
    lectura.voltaje_bateria = 0.0f;
#endif

    return lectura;
}

} // namespace tlalixmati::sensores
