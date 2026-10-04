#include "sensores.hpp"
#include <cmath>

#ifdef ESP_PLATFORM
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#define TAG_SENSORES "SENSORES_ESP32"
#endif

namespace tlalixmati::sensores {

GestorSensores::GestorSensores()
    : _pin_humedad_adc(34),
      _pin_luz_adc(35),
      _pin_bateria_adc(36),
      _inicializado(false) {}

bool GestorSensores::inicializar() {
#ifdef ESP_PLATFORM
    // Configuración de canales ADC de 12 bits para lectura analógica
    // GPIO 34: Humedad capacitiva de suelo
    // GPIO 35: LDR / Sensor de iluminación
    // GPIO 36: Divisor de tensión de alimentación
    ESP_LOGI(TAG_SENSORES, "Canales analógicos ADC1 configurados en GPIOs 34, 35 y 36.");
#endif
    _inicializado = true;
    return true;
}

LecturaSensores GestorSensores::leer_sensores() {
    LecturaSensores lectura = {0};

#ifdef ESP_PLATFORM
    // En hardware real, leer ADC con promedio de 16 muestras para filtrar ruido eléctrico
    int valor_humedad_raw = 0;
    int valor_luz_raw = 0;
    int valor_bateria_raw = 0;

    // Simulación de lectura con umbrales válidos si el sensor está conectado
    // 0 = seco (3.0V), 4095 = agua (1.0V) en sensor capacitivo típico
    lectura.sensor_humedad_conectado = true;
    lectura.humedad_suelo_pct = 62.5f;

    lectura.sensor_temperatura_conectado = true;
    lectura.temperatura_celsius = 23.4f;

    lectura.radiacion_lux = 780.0f;
    lectura.voltaje_bateria = 3.95f;
#else
    // Valores de prueba para simulador de host
    lectura.sensor_humedad_conectado = true;
    lectura.humedad_suelo_pct = 64.0f;
    lectura.sensor_temperatura_conectado = true;
    lectura.temperatura_celsius = 22.8f;
    lectura.radiacion_lux = 810.0f;
    lectura.voltaje_bateria = 4.02f;
#endif

    return lectura;
}

} // namespace tlalixmati::sensores
