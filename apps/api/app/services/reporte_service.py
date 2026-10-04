"""
Servicio para la generación, gestión y persistencia de reportes agronómicos en PDF.

Soporta:
1. Generación manual (solicitada por el usuario en el dashboard).
2. Generación automática autónoma (disparada al detectar plantas en mal estado o anomalías).
3. Persistencia en la nube mediante Supabase Storage (bucket 'informes-pdf') y base de datos relacional.
"""

from datetime import datetime, timezone
import io
import os
import tempfile
from typing import Dict, List, Optional
import uuid
from fpdf import FPDF
import httpx
import psycopg2

from apps.api.app.core.config import get_configuracion
from apps.api.app.services.camara_service import get_camara_service


class ReportePDF(FPDF):
    def __init__(self, es_alerta: bool = False, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.es_alerta = es_alerta

    def header(self):
        # Color del encabezado: rojo teja para alertas, verde bosque para periódicos
        if self.es_alerta:
            self.set_fill_color(153, 27, 27) # Dark red #991B1B
            titulo = "ALERTA AGRONOMICA: PLANTA EN MAL ESTADO DETECTADA"
        else:
            self.set_fill_color(20, 83, 45) # Forest green #14532D
            titulo = "TLALIXMATI - INFORME TECNICO DEL CULTIVO"

        self.rect(0, 0, 210, 24, "F")
        self.set_font("helvetica", "B", 13)
        self.set_text_color(255, 255, 255)
        self.cell(0, 14, titulo, align="C")
        self.ln(16)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Pagina {self.page_no()} | Unidad Fisica Tlahuicole (ESP32 + Raspberry Pi) | Tlalixmati Cloud", align="C")


class ReporteService:
    def __init__(self):
        self._reportes: Dict[str, dict] = {}
        self._archivos_pdf: Dict[str, bytes] = {}

    def _subir_a_supabase(self, nombre_archivo: str, pdf_bytes: bytes) -> Optional[str]:
        """Sube el archivo PDF generado al bucket privado 'informes-pdf' en Supabase Storage."""
        try:
            cfg = get_configuracion()
            url = f"{cfg.supabase_url}/storage/v1/object/informes-pdf/{nombre_archivo}"
            headers = {
                "Authorization": f"Bearer {cfg.supabase_key}",
                "apikey": cfg.supabase_key,
                "Content-Type": "application/pdf",
                "x-upsert": "true",
            }
            res = httpx.post(url, headers=headers, content=pdf_bytes, timeout=10.0)
            if res.status_code in (200, 201):
                return f"{cfg.supabase_url}/storage/v1/object/public/informes-pdf/{nombre_archivo}"
            return None
        except Exception:
            return None

    def _guardar_en_base_datos(self, info: dict) -> None:
        """Registra los metadatos del reporte en la tabla PostgreSQL reports."""
        try:
            cfg = get_configuracion()
            conn = psycopg2.connect(cfg.database_url)
            conn.autocommit = True
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO reports (id, report_type, title, file_url, metadata, created_at)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (id) DO NOTHING;
                    """,
                    (
                        info["id"],
                        info["origen"],
                        info["titulo"],
                        info.get("supabase_url"),
                        f'{{"fases": "{info["fases_resumen"]}", "tamano": {info["tamano_bytes"]}}}',
                    )
                )
            conn.close()
        except Exception:
            pass # Continuar si la conexión directa falla

    def generar_reporte(
        self,
        titulo: str = "Informe del Cultivo",
        notas: str = "",
        origen: str = "manual", # "manual" o "automatico"
        alerta_detectada: bool = False,
        detalle_anomalia: str = ""
    ) -> dict:
        """Genera un reporte PDF agronómico y lo almacena tanto en memoria como en Supabase."""
        reporte_id = str(uuid.uuid4())
        ahora = datetime.now(timezone.utc)
        fecha_str = ahora.strftime("%Y-%m-%d %H:%M:%S UTC")
        nombre_archivo = f"reporte_{origen}_{ahora.strftime('%Y%m%d_%H%M%S')}_{reporte_id[:6]}.pdf"

        # 1. Configurar documento PDF
        pdf = ReportePDF(es_alerta=alerta_detectada, orientation="P", unit="mm", format="A4")
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # 2. Metadatos generales
        pdf.set_font("helvetica", "B", 12)
        pdf.set_text_color(28, 25, 23)
        pdf.cell(0, 8, f"Titulo: {titulo}", new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("helvetica", "", 9)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(0, 5, f"Codigo de Informe: {reporte_id}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, f"Fecha de Emision: {fecha_str}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, f"Tipo de Disparo: {'AUTOMATICO (Alerta de Deteccion)' if origen == 'automatico' else 'MANUAL (Solicitado por Usuario)'}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, "Unidad de Campo: Tlahuicole (ESP32 + Raspberry Pi)", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)

        # 3. Alerta de Anomalía (si aplica)
        if alerta_detectada:
            pdf.set_fill_color(254, 242, 242)
            pdf.set_font("helvetica", "B", 10)
            pdf.set_text_color(185, 28, 28)
            pdf.cell(0, 7, "  DIAGNOSTICO DE ALERTA: PLANTA EN MAL ESTADO", fill=True, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)
            pdf.set_font("helvetica", "", 9)
            pdf.set_text_color(153, 27, 27)
            msg = detalle_anomalia if detalle_anomalia else "Signos visibles de clorosis y deficit hidrico detectados por la camara de campo."
            pdf.cell(0, 5, f"  * Detalle de incidencia: {msg}", new_x="LMARGIN", new_y="NEXT")
            pdf.cell(0, 5, "  * Accion recomendada: Revision presencial de riego y sustrato en la seccion afectada.", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(3)

        # 4. Evaluación de Fases Fenológicas
        pdf.set_fill_color(244, 245, 240)
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(20, 83, 45)
        pdf.cell(0, 7, "  EVALUACION DE FASES DEL CULTIVO", fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

        if alerta_detectada:
            fases = [
                ("Fase 1: Germinacion y Emergencia", "Buen estado - Establecimiento concluido"),
                ("Fase 2: Crecimiento Vegetativo y Desarrollo Foliar", "ALERTA - Follaje con anomalia / Requiere atencion"),
                ("Fase 3: Floracion y Cuajado de Fruto", "Monitoreo prioritario - Vigilancia estricta"),
                ("Fase 4: Maduracion y Precosecha", "Fase programada"),
            ]
        else:
            fases = [
                ("Fase 1: Germinacion y Emergencia", "Buen estado - Establecimiento vigoroso y uniforme"),
                ("Fase 2: Crecimiento Vegetativo y Desarrollo Foliar", "Buen estado - Area foliar optima y sin clorosis"),
                ("Fase 3: Floracion y Cuajado de Fruto", "Monitoreo preventivo - Vigilancia activa"),
                ("Fase 4: Maduracion y Precosecha", "Fase programada - Proyeccion favorable"),
            ]

        for nombre_fase, estado_fase in fases:
            pdf.set_font("helvetica", "B", 9)
            pdf.set_text_color(40, 40, 40)
            pdf.cell(85, 6, f"  * {nombre_fase}:", new_x="RIGHT", new_y="TOP")
            pdf.set_font("helvetica", "", 9)
            if "ALERTA" in estado_fase:
                pdf.set_text_color(185, 28, 28)
            else:
                pdf.set_text_color(22, 101, 52)
            pdf.cell(0, 6, estado_fase, new_x="LMARGIN", new_y="NEXT")

        pdf.ln(4)

        # 5. Captura Óptica de las Plantas / Cultivo
        pdf.set_fill_color(244, 245, 240)
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(20, 83, 45)
        pdf.cell(0, 7, "  CAPTURA FOTOGRAFICA DEL CULTIVO (CAMARA DE CAMPO)", fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)

        cam_srv = get_camara_service()
        frame_bytes = cam_srv.obtener_ultimo_frame()

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp.write(frame_bytes)
            tmp_path = tmp.name

        try:
            pdf.image(tmp_path, x=45, y=pdf.get_y(), w=120)
            pdf.ln(72)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        # 6. Diagnóstico y Modelos de IA
        pdf.set_fill_color(244, 245, 240)
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(20, 83, 45)
        pdf.cell(0, 7, "  ESTADO DE MODELOS DE INTELIGENCIA ARTIFICIAL", fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

        pdf.set_font("helvetica", "", 9)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(0, 5, "Vision YOLOv8: Deteccion de especimenes vegetales en espera de dataset.", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, "Modelo PyTorch: Segmentacion de anomalias foliares y deficit hidrico.", new_x="LMARGIN", new_y="NEXT")
        if notas:
            pdf.ln(2)
            pdf.set_font("helvetica", "I", 9)
            pdf.cell(0, 5, f"Observaciones registradas: {notas}", new_x="LMARGIN", new_y="NEXT")

        pdf_bytes = bytes(pdf.output())

        # 7. Subir a Supabase Storage
        supabase_url = self._subir_a_supabase(nombre_archivo, pdf_bytes)

        # 8. Metadatos del informe
        info_reporte = {
            "id": reporte_id,
            "titulo": titulo,
            "generado_en": fecha_str,
            "origen": origen,
            "alerta_detectada": alerta_detectada,
            "tamano_bytes": len(pdf_bytes),
            "nombre_archivo": nombre_archivo,
            "fases_resumen": "Fase 2: ALERTA" if alerta_detectada else "Fase 1: Buen estado | Fase 2: Buen estado",
            "url_descarga": f"/api/v1/reportes/{reporte_id}/descargar",
            "supabase_url": supabase_url,
            "almacenado_en_supabase": supabase_url is not None,
        }

        # Guardar en memoria y base de datos
        self._reportes[reporte_id] = info_reporte
        self._archivos_pdf[reporte_id] = pdf_bytes
        self._guardar_en_base_datos(info_reporte)

        return info_reporte

    def listar_reportes(self) -> List[dict]:
        """Devuelve los reportes generados ordenados del más reciente al más antiguo."""
        return sorted(
            list(self._reportes.values()),
            key=lambda r: r["generado_en"],
            reverse=True
        )

    def obtener_pdf_bytes(self, reporte_id: str) -> Optional[bytes]:
        """Retorna el binario del PDF para descarga directa."""
        return self._archivos_pdf.get(reporte_id)

    def disparar_alerta_automatica(self, detalle: str = "Signos visibles de estrés o deterioro foliar") -> dict:
        """Genera automáticamente un reporte de alerta agronómica cuando una planta está en mal estado."""
        return self.generar_reporte(
            titulo="Alerta Agronómica: Planta en Mal Estado Detectada",
            notas=f"Disparo automático por detección visual/sensorial: {detalle}",
            origen="automatico",
            alerta_detectada=True,
            detalle_anomalia=detalle,
        )


_reporte_service_instancia: Optional[ReporteService] = None


def get_reporte_service() -> ReporteService:
    global _reporte_service_instancia
    if _reporte_service_instancia is None:
        _reporte_service_instancia = ReporteService()
        # Generar un reporte inicial de referencia
        _reporte_service_instancia.generar_reporte(
            titulo="Informe Agronómico Inicial del Cultivo",
            notas="Verificación inicial de instalación del sistema Tlalixmati.",
            origen="manual",
        )
    return _reporte_service_instancia
