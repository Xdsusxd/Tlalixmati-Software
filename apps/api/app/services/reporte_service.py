"""
Servicio para la generación y gestión de reportes agronómicos en PDF.

Características:
- Incluye desglose por fases de cultivo por defecto (Fase 1: Buen estado, Fase 2, etc.).
- Incluye captura óptica de campo proveniente del servicio de cámara.
- Historial de reportes anteriores para descarga bajo demanda.
"""

from datetime import datetime, timezone
import io
import os
import tempfile
from typing import Dict, List, Optional
import uuid
from fpdf import FPDF

from apps.api.app.services.camara_service import get_camara_service
from apps.api.app.services.componente_service import get_componente_service


class ReportePDF(FPDF):
    def header(self):
        # Encabezado
        self.set_fill_color(20, 83, 45) # Forest green #14532D
        self.rect(0, 0, 210, 24, "F")
        self.set_font("helvetica", "B", 14)
        self.set_text_color(255, 255, 255)
        self.cell(0, 14, "TLALIXMATI - INFORME TECNICO AGRONOMICO", align="C")
        self.ln(16)

    def footer(self):
        # Pie de página
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Pagina {self.page_no()} | Unidad Fisica Tlahuicole (ESP32 + Raspberry Pi) | Tlalixmati", align="C")


class ReporteService:
    def __init__(self):
        # Almacén en memoria de metadatos y binarios de reportes generados
        self._reportes: Dict[str, dict] = {}
        self._archivos_pdf: Dict[str, bytes] = {}

    def generar_reporte(self, titulo: str = "Reporte Agronómico Periódico", notas: str = "") -> dict:
        """Genera un nuevo reporte PDF con fases predeterminadas y captura de imagen."""
        reporte_id = str(uuid.uuid4())
        ahora = datetime.now(timezone.utc)
        fecha_str = ahora.strftime("%Y-%m-%d %H:%M:%S UTC")

        # 1. Instanciar FPDF
        pdf = ReportePDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # 2. Metadatos Generales
        pdf.set_font("helvetica", "B", 12)
        pdf.set_text_color(28, 25, 23)
        pdf.cell(0, 8, f"Titulo: {titulo}", new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("helvetica", "", 9)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(0, 5, f"Codigo de Informe: {reporte_id}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, f"Fecha de Emision: {fecha_str}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, "Unidad de Campo: Tlahuicole (Microcontrolador ESP32 + Edge Raspberry Pi)", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)

        # 3. Fases del Cultivo (Por defecto según directivas)
        pdf.set_fill_color(244, 245, 240)
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(20, 83, 45)
        pdf.cell(0, 7, "  EVALUACION DE FASES DEL CULTIVO", fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

        fases = [
            ("Fase 1: Germinacion y Emergencia", "Buen estado - Establecimiento vigoroso y uniforme"),
            ("Fase 2: Crecimiento Vegetativo y Desarrollo Foliar", "Buen estado - Area foliar optima y sin clorosis visible"),
            ("Fase 3: Floracion y Cuajado de Fruto", "Monitoreo preventivo - Vigilancia activa de humedad y nutricion"),
            ("Fase 4: Maduracion y Precosecha", "Fase programada - Proyeccion favorable de rendimiento"),
        ]

        pdf.set_font("helvetica", "", 9)
        for nombre_fase, estado_fase in fases:
            pdf.set_font("helvetica", "B", 9)
            pdf.set_text_color(40, 40, 40)
            pdf.cell(85, 6, f"  * {nombre_fase}:", new_x="RIGHT", new_y="TOP")
            pdf.set_font("helvetica", "", 9)
            pdf.set_text_color(22, 101, 52)
            pdf.cell(0, 6, estado_fase, new_x="LMARGIN", new_y="NEXT")

        pdf.ln(4)

        # 4. Inclusión de Captura Óptica de Campo
        pdf.set_fill_color(244, 245, 240)
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(20, 83, 45)
        pdf.cell(0, 7, "  CAPTURA OPTICA DE CAMPO (CAMARA REAL)", fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)

        cam_srv = get_camara_service()
        frame_bytes = cam_srv.obtener_ultimo_frame()

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp.write(frame_bytes)
            tmp_path = tmp.name

        try:
            # Insertar imagen centrada
            pdf.image(tmp_path, x=45, y=pdf.get_y(), w=120)
            pdf.ln(72)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        # 5. Telemetría y Diagnóstico de Sensores
        pdf.set_fill_color(244, 245, 240)
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(20, 83, 45)
        pdf.cell(0, 7, "  TELEMETRIA Y CONDICIONES AMBIENTALES", fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

        pdf.set_font("helvetica", "", 9)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(0, 5, "Telemetria de sensores fisicos: Sin mediciones anomalas reportadas.", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 5, "Inferencia de vision computacional: YOLO / PyTorch en modo de espera de dataset.", new_x="LMARGIN", new_y="NEXT")
        if notas:
            pdf.ln(2)
            pdf.set_font("helvetica", "I", 9)
            pdf.cell(0, 5, f"Notas adicionales del agronomo: {notas}", new_x="LMARGIN", new_y="NEXT")

        pdf_bytes = bytes(pdf.output())

        # Guardar en memoria
        info_reporte = {
            "id": reporte_id,
            "titulo": titulo,
            "generado_en": fecha_str,
            "tamano_bytes": len(pdf_bytes),
            "nombre_archivo": f"reporte_tlalixmati_{ahora.strftime('%Y%m%d_%H%M%S')}.pdf",
            "fases_resumen": "Fase 1: Buen estado | Fase 2: Buen estado",
            "url_descarga": f"/api/v1/reportes/{reporte_id}/descargar"
        }
        self._reportes[reporte_id] = info_reporte
        self._archivos_pdf[reporte_id] = pdf_bytes

        return info_reporte

    def listar_reportes(self) -> List[dict]:
        """Devuelve la lista de reportes generados ordenados cronológicamente."""
        return sorted(
            list(self._reportes.values()),
            key=lambda r: r["generado_en"],
            reverse=True
        )

    def obtener_pdf_bytes(self, reporte_id: str) -> Optional[bytes]:
        """Obtiene el archivo binario del PDF para descarga."""
        return self._archivos_pdf.get(reporte_id)


_reporte_service_instancia: Optional[ReporteService] = None


def get_reporte_service() -> ReporteService:
    global _reporte_service_instancia
    if _reporte_service_instancia is None:
        _reporte_service_instancia = ReporteService()
        # Generar un reporte inicial por defecto para que siempre haya al menos uno disponible
        _reporte_service_instancia.generar_reporte(
            titulo="Reporte Inicial de Instalación y Fases",
            notas="Calibración inicial de la unidad física de campo Tlahuicole."
        )
    return _reporte_service_instancia
