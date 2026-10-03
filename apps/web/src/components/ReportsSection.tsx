"use client";

import React, { useState } from "react";
import { FileText, Download, Plus, CheckCircle, Clock } from "lucide-react";
import { api, ReporteInfoResponse } from "@/lib/api";

interface ReportsSectionProps {
  reportesIniciales: ReporteInfoResponse[];
}

export function ReportsSection({ reportesIniciales }: ReportsSectionProps) {
  const [reportes, setReportes] = useState<ReporteInfoResponse[]>(reportesIniciales);
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const fasesDefault = [
    {
      fase: "Fase 1: Germinación y Emergencia",
      estado: "Buen estado",
      detalle: "Establecimiento vigoroso y uniforme del cultivo.",
      color: "bg-emerald-200 text-emerald-950 border-stone-900",
    },
    {
      fase: "Fase 2: Crecimiento Vegetativo y Desarrollo Foliar",
      estado: "Buen estado",
      detalle: "Área foliar óptima sin presencia visible de clorosis.",
      color: "bg-emerald-200 text-emerald-950 border-stone-900",
    },
    {
      fase: "Fase 3: Floración y Cuajado de Fruto",
      estado: "Monitoreo preventivo",
      detalle: "Vigilancia constante de humedad y balance nutricional.",
      color: "bg-amber-200 text-amber-950 border-stone-900",
    },
    {
      fase: "Fase 4: Maduración y Precosecha",
      estado: "Fase programada",
      detalle: "Proyección favorable según cronograma biológico.",
      color: "bg-stone-200 text-stone-800 border-stone-900",
    },
  ];

  const handleGenerarReporte = async () => {
    setGenerando(true);
    setMensaje(null);
    try {
      const nuevo = await api.generarReporte(
        "Informe Agronómico Periódico",
        "Generado automáticamente desde el panel de control Tlalixmati."
      );
      if (nuevo) {
        setReportes((prev) => [nuevo, ...prev]);
        setMensaje("Reporte PDF generado exitosamente con fotos de plantas y estado de fases.");
      }
    } catch {
      setMensaje("Error al generar el reporte en PDF.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <section className="neo-box p-6 sm:p-8">
      {/* Encabezado Principal y Acciones de Descarga */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-6 border-b-2 border-stone-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              Informes y Reportes Agronómicos
            </h2>
            <span className="neo-badge text-xs px-3 py-1 bg-stone-100 text-stone-900">
              Formato PDF
            </span>
          </div>
          <p className="text-sm font-semibold text-stone-600 mt-1.5">
            Descarga de informes técnicos con capturas de plantas, estado de fases y modelos de IA.
          </p>
        </div>

        {/* Botones de Acción Inmediata: Descargar Reciente y Generar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Botón Descargar PDF Reciente */}
          <a
            href="/api/v1/reportes/reciente/descargar"
            download="reporte_reciente_tlalixmati.pdf"
            className="neo-button inline-flex items-center space-x-2 px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs uppercase shadow-[3px_3px_0px_0px_#1C1917]"
          >
            <Download className="h-4 w-4 text-emerald-300" />
            <span>Descargar PDF Reciente</span>
          </a>

          {/* Botón Generar Nuevo Reporte */}
          <button
            onClick={handleGenerarReporte}
            disabled={generando}
            className="neo-button inline-flex items-center space-x-2 px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs uppercase shadow-[3px_3px_0px_0px_#1C1917] disabled:opacity-50"
          >
            <Plus className="h-4 w-4 text-emerald-200" />
            <span>{generando ? "Compilando PDF..." : "Generar Nuevo PDF"}</span>
          </button>
        </div>
      </div>

      {/* Notificación de generación */}
      {mensaje && (
        <div className="mt-4 p-3.5 rounded-2xl border-2 border-stone-800 bg-emerald-50 text-xs font-bold text-emerald-950 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Fases del Cultivo por Defecto */}
      <div className="mt-6">
        <h3 className="text-sm font-black text-stone-900 uppercase mb-3">
          Estado Actual por Fases del Cultivo (Incluido en los PDFs)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fasesDefault.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border-2 border-stone-800 bg-white shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-black text-stone-400 uppercase block mb-1">
                  Paso 0{idx + 1}
                </span>
                <h4 className="text-xs font-black text-stone-900 leading-tight">
                  {item.fase}
                </h4>
                <p className="text-[11px] text-stone-600 font-medium mt-2 leading-snug">
                  {item.detalle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-stone-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-stone-400 uppercase">Estado:</span>
                <span className={`neo-badge text-[10px] px-2.5 py-0.5 ${item.color}`}>
                  {item.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Reportes Anteriores para Descarga */}
      <div className="mt-8 pt-6 border-t-2 border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-stone-800" />
            <h3 className="text-sm font-black text-stone-900 uppercase">
              Descargar Reportes Anteriores (Historial)
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-500">
            {reportes.length} archivo{reportes.length === 1 ? "" : "s"} disponible{reportes.length === 1 ? "" : "s"}
          </span>
        </div>

        {reportes.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-stone-300 rounded-2xl text-xs font-bold text-stone-500">
            No hay reportes anteriores registrados todavía.
          </div>
        ) : (
          <div className="space-y-3">
            {reportes.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 hover:bg-white shadow-[2px_2px_0px_0px_#1C1917] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-200 text-emerald-950 border-2 border-stone-900 shadow-[1px_1px_0px_0px_#1C1917]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900 uppercase">
                      {rep.titulo}
                    </h4>
                    <div className="flex items-center space-x-3 text-[11px] text-stone-600 font-medium mt-0.5">
                      <span>{rep.generado_en}</span>
                      <span>•</span>
                      <span className="font-mono font-bold">{(rep.tamano_bytes / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span className="text-emerald-800 font-bold">{rep.fases_resumen}</span>
                    </div>
                  </div>
                </div>

                {/* Botón de Descarga del Archivo Anterior */}
                <a
                  href={`/api/v1/reportes/${rep.id}/descargar`}
                  download={rep.nombre_archivo}
                  className="neo-button inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1C1917] self-start sm:self-auto"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-200" />
                  <span>Descargar PDF</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
