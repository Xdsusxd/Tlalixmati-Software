cmake_minimum_required(VERSION 3.16)

# Proyecto principal de firmware para el microcontrolador ESP32 de Tlahuicole
include($ENV{IDF_PATH}/tools/cmake/project.cmake OPTIONAL RESULT_VARIABLE IDF_FOUND)

if(IDF_FOUND)
    project(tlalixmati-firmware)
else()
    # Soporte para validación de compilación sintáctica en entornos sin toolchain ESP-IDF completo
    project(tlalixmati-firmware C CXX)
    message(STATUS "ESP-IDF no detectado en entorno local; configurado para validación genérica de C++")
endif()
