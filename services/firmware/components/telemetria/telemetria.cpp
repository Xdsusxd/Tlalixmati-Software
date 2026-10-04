#include "telemetria.hpp"
#include <cstdio>
#include <cstring>

#ifdef ESP_PLATFORM
#include "driver/uart.h"
#include "esp_log.h"
#define TAG_UART "UART_ESP32"
#define UART_PORT UART_NUM_0
#endif

namespace tlalixmati::comunicacion {

TransmisorTelemetria::TransmisorTelemetria(int baudrate)
    : _baudrate(baudrate),
      _puerto_uart_num(0),
      _inicializado(false) {}

bool TransmisorTelemetria::inicializar() {
#ifdef ESP_PLATFORM
    uart_config_t uart_config = {
        .baud_rate = _baudrate,
        .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
        .rx_flow_ctrl_thresh = 0,
        .source_clk = UART_SCLK_DEFAULT,
    };

    uart_param_config(UART_PORT, &uart_config);
    uart_driver_install(UART_PORT, 1024, 0, 0, NULL, 0);
    ESP_LOGI(TAG_UART, "UART0 inicializado a %d baudios.", _baudrate);
#endif
    _inicializado = true;
    return true;
}

std::string TransmisorTelemetria::formatear_trama_json(
    const std::string& mac_dispositivo,
    const tlalixmati::sensores::LecturaSensores& lectura
) {
    char buffer[256] = {0};

    // Formatear JSON limpio compatible con la Raspberry Pi
    std::snprintf(
        buffer,
        sizeof(buffer),
        "{\"mac\":\"%s\",\"humedad_suelo\":%.1f,\"temperatura\":%.1f,\"radiacion\":%.0f,\"bateria\":%.2f}\n",
        mac_dispositivo.c_str(),
        lectura.humedad_suelo_pct,
        lectura.temperatura_celsius,
        lectura.radiacion_lux,
        lectura.voltaje_bateria
    );

    return std::string(buffer);
}

bool TransmisorTelemetria::transmitir_trama(const std::string& trama) {
#ifdef ESP_PLATFORM
    int bytes_escritos = uart_write_bytes(UART_PORT, trama.c_str(), trama.length());
    return bytes_escritos == trama.length();
#else
    // En host/simulador, imprime en consola
    std::printf("%s", trama.c_str());
    return true;
#endif
}

} // namespace tlalixmati::comunicacion
