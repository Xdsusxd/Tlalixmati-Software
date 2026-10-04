"""
Servicio de agregación lógica para Tlahuicole.

PRINCIPIO FUNDAMENTAL:
- Tlahuicole NO es una entidad de dispositivo independiente.
- NO tiene un device_id propio ni almacena identidad duplicada.
- Su estado se deriva dinámicamente de sus componentes físicos reales (ESP32 + Raspberry Pi + periféricos).
- Respeta la regla de NO INVENTAR DATOS: 'Sin datos', 'Sin resultados', 'Componente no conectado'.
"""

from apps.api.app.services.componente_service import get_componente_service
from packages.schemas.componente import EstadoConexion, TipoComponente
from packages.schemas.tlahuicole import TlahuicoleEstado


class TlahuicoleService:
    """
    Calcula y provee la vista unificada del sistema físico de campo Tlahuicole.
    """

    @staticmethod
    def obtener_estado_agregado() -> TlahuicoleEstado:
        """
        Deriva el estado de Tlahuicole evaluando la presencia y comunicación
        de sus partes constitutivas reales.
        """
        srv = get_componente_service()
        
        esp32_estado = srv.obtener_estado_componente(TipoComponente.ESP32)
        rpi_estado = srv.obtener_estado_componente(TipoComponente.RASPBERRY)
        camara_estado = srv.obtener_estado_componente(TipoComponente.CAMARA)

        # Lógica de derivación del estado general de la unidad física
        esp32_ok = (esp32_estado.estado == EstadoConexion.CONECTADO)
        rpi_ok = (rpi_estado.estado == EstadoConexion.CONECTADO)

        if esp32_ok and rpi_ok:
            estado_general = EstadoConexion.CONECTADO
            resumen = "Unidad física Tlahuicole operativa: ESP32 y Raspberry Pi comunicando activamente."
        elif esp32_ok and not rpi_ok:
            estado_general = EstadoConexion.ERROR
            resumen = "Comunicación parcial: ESP32 conectado, pero Raspberry Pi no conectada."
        elif not esp32_ok and rpi_ok:
            estado_general = EstadoConexion.ERROR
            resumen = "Comunicación parcial: Raspberry Pi conectada, pero ESP32 no conectado."
        else:
            estado_general = EstadoConexion.NO_CONECTADO
            resumen = "Sin componentes físicos conectados. Hardware no detectado en campo."

        # Obtener telemetría de sensores si hay comunicación activa
        from apps.api.app.services.telemetria_service import get_telemetria_service
        telem = get_telemetria_service().obtener_actual()
        sensores_resumen = telem.resumen_sensores if telem.conectado else "Sin datos"

        return TlahuicoleEstado(
            nombre="Tlahuicole",
            naturaleza="Agrupación lógica de componentes de campo (ESP32 + Raspberry Pi)",
            estado_general=estado_general,
            esp32=esp32_estado,
            raspberry=rpi_estado,
            camara=camara_estado,
            sensores=sensores_resumen,
            analisis="Sin resultados",
            perifericos_adicionales=[],
            resumen_operativo=resumen
        )
