#pragma once

namespace tlalixmati::actuadores {

/**
 * Interfaz de abstracción para la locomoción de Tlahuicole.
 * Permite mantener el código desacoplado hasta que se defina el chasis físico
 * (robot de ruedas, orugas, riel suspendido o estación con cabezal móvil).
 */
class IControladorLocomocion {
public:
    virtual ~IControladorLocomocion() = default;
    virtual bool inicializar() = 0;
    virtual void mover(float velocidad_x, float velocidad_y) = 0;
    virtual void detener() = 0;
    virtual const char* obtener_tipo_chasis() const = 0;
};

/**
 * Implementación modular de espera: se reemplazará al configurar el hardware mecánico al final.
 */
class LocomocionPendiente : public IControladorLocomocion {
public:
    bool inicializar() override;
    void mover(float velocidad_x, float velocidad_y) override;
    void detener() override;
    const char* obtener_tipo_chasis() const override;
};

} // namespace tlalixmati::actuadores
