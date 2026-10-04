#pragma once

#include <cstdint>

namespace tlalixmati::sensores {

struct LecturaSensores {
    float humedad_suelo_pct;      // Porcentaje de humedad en tierra (0.0 a 100.0)
    float temperatura_celsius;    // Temperatura ambiental en grados Celsius
    float radiacion_lux;          // Nivel de iluminación solar
    float voltaje_bateria;        // Nivel de tensión de alimentación en voltios
    bool sensor_humedad_conectado;
    bool sensor_temperatura_conectado;
};

class GestorSensores {
public:
    GestorSensores();
    bool inicializar();
    LecturaSensores leer_sensores();

private:
    int _pin_humedad_adc;
    int _pin_luz_adc;
    int _pin_bateria_adc;
    bool _inicializado;
};

} // namespace tlalixmati::sensores
