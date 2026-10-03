"""
Servicio para la gestión y seguimiento de componentes físicos reales.

REGLAS ESENCIALES:
- No existen dispositivos simulados.
- Se rechazan identificadores inventados o nombres como 'tlahuicole-01'.
- La identidad proviene del hardware real (dirección MAC o número de serie).
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from apps.api.app.core.config import get_configuracion
from apps.api.app.core.exceptions import ComponenteNoEncontradoException, IdentificadorInvalidoException
from packages.schemas.componente import (
    ComponenteEstado,
    ComponenteIdentidad,
    ComponenteRegistro,
    EstadoConexion,
    TipoComponente,
)

# Nombres prohibidos según las reglas del proyecto
IDENTIFICADORES_PROHIBIDOS = {
    "tlahuicole",
    "tlahuicole-01",
    "tlahuicole_01",
    "dummy",
    "fake",
    "mock",
    "simulador",
    "test_device",
}


class ComponenteService:
    """
    Gestiona el ciclo de vida e identificación en memoria de los componentes físicos reales
    (en Fase 03 estos registros se sincronizan con Supabase / PostgreSQL).
    """

    def __init__(self):
        # Almacenamiento en memoria de componentes identificados por (tipo, id_hardware)
        self._registros: Dict[TipoComponente, ComponenteRegistro] = {}
        self._ultimos_estados: Dict[TipoComponente, ComponenteEstado] = {}

    def _validar_identificador_hardware(self, identificador: str) -> None:
        """Verifica que el identificador no sea un nombre ficticio prohibido."""
        limpio = identificador.strip().lower()
        if limpio in IDENTIFICADORES_PROHIBIDOS:
            raise IdentificadorInvalidoException(
                identificador=identificador,
                motivo="No está permitido usar nombres genéricos o inventados como identidad física. "
                       "Debe usarse el identificador único real del hardware (e.g. MAC address o número de serie)."
            )
        if len(limpio) < 4:
            raise IdentificadorInvalidoException(
                identificador=identificador,
                motivo="El identificador de hardware es demasiado corto para constituir una identidad física válida."
            )

    def registrar_latido(self, registro: ComponenteRegistro) -> ComponenteEstado:
        """
        Registra la presencia física o latido de un componente con su identidad real.
        """
        self._validar_identificador_hardware(registro.identidad.identificador_hardware)
        
        cfg = get_configuracion()
        tipo = registro.identidad.tipo
        ahora = datetime.now(timezone.utc)
        
        # Determinar si en system.yaml está habilitado
        habilitado = False
        if tipo == TipoComponente.ESP32:
            habilitado = cfg.esp32.habilitado
        elif tipo == TipoComponente.RASPBERRY:
            habilitado = cfg.raspberry.habilitado
        elif tipo == TipoComponente.CAMARA:
            habilitado = cfg.camara.habilitado

        self._registros[tipo] = registro
        
        nuevo_estado = ComponenteEstado(
            tipo=tipo,
            identificador_hardware=registro.identidad.identificador_hardware,
            habilitado=habilitado,
            estado=EstadoConexion.CONECTADO,
            ultima_comunicacion=ahora,
            mensaje=f"Componente conectado y verificado. Modelo: {registro.identidad.modelo or 'No especificado'}."
        )
        self._ultimos_estados[tipo] = nuevo_estado
        return nuevo_estado

    def obtener_estado_componente(self, tipo: TipoComponente) -> ComponenteEstado:
        """
        Devuelve el estado de un componente específico.
        Si no hay hardware conectado, responde con el estado textual 'Componente no conectado'.
        """
        if tipo in self._ultimos_estados:
            return self._ultimos_estados[tipo]

        cfg = get_configuracion()
        
        if tipo == TipoComponente.ESP32:
            return ComponenteEstado(
                tipo=TipoComponente.ESP32,
                identificador_hardware=None,
                habilitado=cfg.esp32.habilitado,
                estado=EstadoConexion.NO_CONECTADO,
                ultima_comunicacion=None,
                mensaje="Componente no conectado"
            )
        elif tipo == TipoComponente.RASPBERRY:
            return ComponenteEstado(
                tipo=TipoComponente.RASPBERRY,
                identificador_hardware=None,
                habilitado=cfg.raspberry.habilitado,
                estado=EstadoConexion.NO_CONECTADO,
                ultima_comunicacion=None,
                mensaje="Componente no conectado"
            )
        elif tipo == TipoComponente.CAMARA:
            return ComponenteEstado(
                tipo=TipoComponente.CAMARA,
                identificador_hardware=None,
                habilitado=cfg.camara.habilitado,
                estado=EstadoConexion.NO_CONFIGURADO,
                ultima_comunicacion=None,
                mensaje="Cámara no configurada"
            )
        else:
            return ComponenteEstado(
                tipo=tipo,
                identificador_hardware=None,
                habilitado=False,
                estado=EstadoConexion.NO_CONECTADO,
                ultima_comunicacion=None,
                mensaje="Componente no conectado"
            )

    def listar_todos_los_componentes(self) -> List[ComponenteEstado]:
        """Lista el estado de todos los componentes base del sistema."""
        return [
            self.obtener_estado_componente(TipoComponente.ESP32),
            self.obtener_estado_componente(TipoComponente.RASPBERRY),
            self.obtener_estado_componente(TipoComponente.CAMARA),
        ]

    def contar_componentes_activos(self) -> int:
        """Devuelve la cantidad de componentes que actualmente reportan estado CONECTADO."""
        return sum(
            1 for c in self.listar_todos_los_componentes()
            if c.estado == EstadoConexion.CONECTADO
        )


# Instancia singleton para el servicio de componentes
_componente_service_instancia: Optional[ComponenteService] = None


def get_componente_service() -> ComponenteService:
    global _componente_service_instancia
    if _componente_service_instancia is None:
        _componente_service_instancia = ComponenteService()
    return _componente_service_instancia
