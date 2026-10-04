"""
Servicio para la adquisición, persistencia y consulta de telemetría sensorial de campo.

REGLA FUNDAMENTAL:
- Cero datos falsos: si no hay sensores físicos conectados o no transmiten,
  los valores permanecen en None / null y se muestra honestamente 'Sin datos'.
- Cuando el microcontrolador ESP32 envía mediciones reales vía la Raspberry Pi,
  se persisten en la tabla PostgreSQL 'measurements' en Supabase y se actualizan en memoria.
"""

from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Dict, List, Optional
import uuid
import psycopg2

from apps.api.app.core.config import get_configuracion
from apps.api.app.services.evento_service import get_evento_service
from packages.schemas.telemetria import (
    HistorialTelemetriaResponse,
    PuntoHistorialOut,
    TelemetriaActualOut,
    TelemetriaLecturaIn,
)

logger = logging.getLogger("tlalixmati.api.telemetria")


class TelemetriaService:
    def __init__(self):
        self._ultima_lectura: Optional[Dict[str, Any]] = None
        self._ultima_marca: Optional[datetime] = None

    def registrar_lectura(self, lectura: TelemetriaLecturaIn) -> TelemetriaActualOut:
        """
        Recibe una lectura proveniente del microcontrolador ESP32 por enlace Edge.
        Actualiza el estado en memoria y persiste las mediciones reales en Supabase.
        """
        ahora = datetime.now(timezone.utc)
        marca_lectura = lectura.timestamp or ahora

        self._ultima_lectura = {
            "mac": lectura.mac,
            "humedad_suelo": lectura.humedad_suelo,
            "temperatura": lectura.temperatura,
            "radiacion": lectura.radiacion,
            "bateria": lectura.bateria,
            "timestamp": marca_lectura,
        }
        self._ultima_marca = ahora

        # Construir resumen agronómico legible
        partes_resumen = []
        if lectura.humedad_suelo is not None:
            partes_resumen.append(f"Humedad: {lectura.humedad_suelo:.1f}%")
        if lectura.temperatura is not None:
            partes_resumen.append(f"Temp: {lectura.temperatura:.1f}°C")
        if lectura.radiacion is not None:
            partes_resumen.append(f"Luz: {lectura.radiacion:.0f} lx")
        if lectura.bateria is not None:
            partes_resumen.append(f"Bat: {lectura.bateria:.2f}V")

        resumen = " | ".join(partes_resumen) if partes_resumen else "Sin datos de sensores (desconectados)"

        # Notificar eventos de umbral si aplica
        if lectura.bateria is not None and lectura.bateria < 3.3:
            get_evento_service().registrar_evento(
                nivel="aviso",
                origen="ESP32_ALIMENTACION",
                mensaje=f"Nivel bajo de batería de campo: {lectura.bateria:.2f}V",
                detalles={"bateria_v": lectura.bateria, "mac": lectura.mac}
            )

        if lectura.temperatura is not None and lectura.temperatura > 42.0:
            get_evento_service().registrar_evento(
                nivel="aviso",
                origen="SENSORES_CAMPO",
                mensaje=f"Alerta de temperatura crítica en suelo/ambiente: {lectura.temperatura:.1f}°C",
                detalles={"temperatura_c": lectura.temperatura, "mac": lectura.mac}
            )

        # Persistir mediciones individuales en PostgreSQL (tabla measurements)
        self._guardar_mediciones_en_bd(lectura, marca_lectura)

        return self.obtener_actual()

    def _guardar_mediciones_en_bd(self, lectura: TelemetriaLecturaIn, marca: datetime):
        """Inserta cada lectura individual válida en la tabla measurements."""
        try:
            cfg = get_configuracion()
            conn = psycopg2.connect(cfg.database_url, connect_timeout=3)
            with conn.cursor() as cur:
                # Obtener o verificar ID del componente por MAC
                cur.execute(
                    "SELECT id FROM components WHERE identificador_hardware = %s LIMIT 1;",
                    (lectura.mac,)
                )
                fila = cur.fetchone()
                componente_id = fila[0] if fila else None

                # Si no existe, crear registro base del ESP32
                if not componente_id:
                    comp_uuid = str(uuid.uuid4())
                    cur.execute(
                        """
                        INSERT INTO components (id, tipo, identificador_hardware, habilitado, estado, ultima_comunicacion)
                        VALUES (%s, 'esp32', %s, true, 'Conectado', %s)
                        ON CONFLICT (identificador_hardware) DO UPDATE SET ultima_comunicacion = EXCLUDED.ultima_comunicacion
                        RETURNING id;
                        """,
                        (comp_uuid, lectura.mac, marca)
                    )
                    comp_row = cur.fetchone()
                    componente_id = comp_row[0] if comp_row else comp_uuid

                # Insertar mediciones disponibles
                inserts = []
                if lectura.humedad_suelo is not None:
                    inserts.append((str(uuid.uuid4()), componente_id, "humedad_suelo", lectura.humedad_suelo, "porcentaje", marca))
                if lectura.temperatura is not None:
                    inserts.append((str(uuid.uuid4()), componente_id, "temperatura", lectura.temperatura, "celsius", marca))
                if lectura.radiacion is not None:
                    inserts.append((str(uuid.uuid4()), componente_id, "radiacion", lectura.radiacion, "lux", marca))
                if lectura.bateria is not None:
                    inserts.append((str(uuid.uuid4()), componente_id, "bateria", lectura.bateria, "voltios", marca))

                if inserts:
                    cur.executemany(
                        """
                        INSERT INTO measurements (id, componente_id, tipo_sensor, valor, unidad, medido_en)
                        VALUES (%s, %s, %s, %s, %s, %s);
                        """,
                        inserts
                    )
                conn.commit()
            conn.close()
        except Exception as e:
            logger.debug(f"Aviso: no se persistieron mediciones en BD (modo local/offline): {e}")

    def obtener_actual(self) -> TelemetriaActualOut:
        """Retorna el estado sensorial actual con honestidad."""
        ahora = datetime.now(timezone.utc)
        
        # Si no hay lectura previa o pasaron más de 120 segundos sin señal, considerar desconectado
        esta_conectado = False
        if self._ultima_marca and (ahora - self._ultima_marca).total_seconds() < 120:
            esta_conectado = True

        if not self._ultima_lectura or not esta_conectado:
            return TelemetriaActualOut(
                conectado=False,
                mac=None,
                humedad_suelo=None,
                temperatura=None,
                radiacion=None,
                bateria=None,
                ultima_lectura=self._ultima_marca,
                resumen_sensores="Sin datos",
            )

        hum = self._ultima_lectura.get("humedad_suelo")
        temp = self._ultima_lectura.get("temperatura")
        rad = self._ultima_lectura.get("radiacion")
        bat = self._ultima_lectura.get("bateria")

        partes = []
        if hum is not None:
            partes.append(f"Humedad: {hum:.1f}%")
        if temp is not None:
            partes.append(f"Temp: {temp:.1f}°C")
        if rad is not None:
            partes.append(f"Luz: {rad:.0f} lx")
        if bat is not None:
            partes.append(f"Bat: {bat:.2f}V")

        resumen = " | ".join(partes) if partes else "Sin lecturas de sondas"

        return TelemetriaActualOut(
            conectado=True,
            mac=self._ultima_lectura.get("mac"),
            humedad_suelo=hum,
            temperatura=temp,
            radiacion=rad,
            bateria=bat,
            ultima_lectura=self._ultima_marca,
            resumen_sensores=resumen,
        )

    def obtener_historial(self, horas: int = 24) -> HistorialTelemetriaResponse:
        """
        Retorna los puntos históricos reales registrados en la tabla measurements.
        Si no hay lecturas en base de datos, retorna lista vacía sin inventar curvas ficticias.
        """
        puntos: List[PuntoHistorialOut] = []
        try:
            cfg = get_configuracion()
            conn = psycopg2.connect(cfg.database_url, connect_timeout=3)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT 
                        to_char(date_trunc('hour', medido_en), 'HH24:00') as hora,
                        AVG(CASE WHEN tipo_sensor = 'humedad_suelo' THEN valor ELSE NULL END) as hum,
                        AVG(CASE WHEN tipo_sensor = 'temperatura' THEN valor ELSE NULL END) as temp,
                        AVG(CASE WHEN tipo_sensor = 'radiacion' THEN valor ELSE NULL END) as rad,
                        AVG(CASE WHEN tipo_sensor = 'bateria' THEN valor ELSE NULL END) as bat
                    FROM measurements
                    WHERE medido_en >= NOW() - (%s || ' hours')::interval
                    GROUP BY date_trunc('hour', medido_en)
                    ORDER BY date_trunc('hour', medido_en) ASC
                    LIMIT 48;
                    """,
                    (horas,)
                )
                filas = cur.fetchall()
                for f in filas:
                    hora_txt, hum_val, temp_val, rad_val, bat_val = f
                    puntos.append(PuntoHistorialOut(
                        fecha_hora=str(hora_txt),
                        humedad_suelo=float(round(hum_val, 1)) if hum_val is not None else None,
                        temperatura=float(round(temp_val, 1)) if temp_val is not None else None,
                        radiacion=float(round(rad_val, 0)) if rad_val is not None else None,
                        bateria=float(round(bat_val, 2)) if bat_val is not None else None,
                    ))
            conn.close()
        except Exception as e:
            logger.debug(f"Aviso: no se pudo consultar historial en BD: {e}")

        return HistorialTelemetriaResponse(
            total_puntos=len(puntos),
            puntos=puntos
        )


_telemetria_service_instancia: Optional[TelemetriaService] = None


def get_telemetria_service() -> TelemetriaService:
    global _telemetria_service_instancia
    if _telemetria_service_instancia is None:
        _telemetria_service_instancia = TelemetriaService()
    return _telemetria_service_instancia
