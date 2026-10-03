"use client";

import React, { useState } from "react";
import { FileText, Download, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";
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
      color: "bg-emerald-100 text-emerald-950 border-emerald-800",
    },
    {
      fase: "Fase 2: Crecimiento Vegetativo y Desarrollo Foliar",
      estado: "Buen estado",
      detalle: "Área foliar óptima sin presencia visible de clorosis.",
      color: "bg-emerald-100 text-emerald-950 border-emerald-800",
    },
    {
      fase: "Fase 3: Floración y Cuajado de Fruto",
      estado: "Monitoreo preventivo",
      detalle: "Vigilancia constante de humedad y balance nutricional.",
      color: "bg-amber-100 text-amber-950 border-amber-800",
    },
    {
      fase: "Fase 4: Maduración y Precosecha",
      estado: "Fase programada",
      detalle: "Proyección favorable según cronograma biológico.",
      color: "bg-stone-200 text-stone-800 border-stone-800",
    },
  ];

  const handleGenerarReporte = async () => {
    setGenerando(true);
    setMensaje(null);
    try {
      const nuevo = await api.generarReporte(
        "Informe Agronómico de Seguimiento",
        "Evaluación técnica generada desde el panel de control Tlalixmati."
      );
      if (nuevo) {
        setReportes((prev) => [nuevo, ...prev]);
        setMensaje("Reporte generado exitosamente con captura óptica y fases incluidas.");
      }
    } catch {
      setMensaje("Error al generar el reporte en PDF.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <section className="neo-box p-6 sm:p-8">
      {/* Encabezado y Acción de Generación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b-2 border-stone-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              Informes y Reportes Agronómicos
            </h2>
            <span className="neo-badge text-xs px-3 py-1 bg-stone-100 text-stone-900">
              Formato PDF
            </span>
          </div>
          <p className="text-sm font-medium text-stone-600 mt-1.5">
            Generación y descarga de informes técnicos que integran imágenes de campo y evaluación por fases.
          </p>
        </div>

        <button
          onClick={handleGenerarReporte}
          disabled={generando}
          className="neo-button flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs uppercase shadow-[3px_3px_0px_0px_#1C1917] disabled:opacity-50"
        >
          <Plus className="h-4 w-4 text-emerald-200" />
          <span>{generando ? "Compilando PDF..." : "Generar Reporte PDF"}</span>
        </button>
      </div>

      {/* Notificación de Éxito */}
      {mensaje && (
        <div className="mt-4 p-3.5 rounded-2xl border-2 border-stone-800 bg-emerald-50 text-xs font-bold text-emerald-950 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Cuadrícula de Fases por Defecto */}
      <div className="mt-6">
        <h3 className="text-sm font-black text-stone-900 uppercase mb-3">
          Evaluación de Fases Fenológicas (Configuración por Defecto)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fasesDefault.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border-2 border-stone-800 bg-white shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-extrabold text-stone-500 uppercase block mb-1">
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
                <span className="text-[10px] font-bold text-stone-400 uppercase">Estado:</span>
                <span className={`neo-badge text-[10px] px-2 py-0.5 ${item.color}`}>
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
            <Clock className="h-4 w-4 text-stone-700" />
            <h3 className="text-sm font-black text-stone-900 uppercase">
              Historial de Reportes Anteriores Disponibles
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-500">
            {reportes.length} informe{reportes.length === 1 ? "" : "s"} registrado{reportes.length === 1 ? "" : "s"}
          </span>
        </div>

        {reportes.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-stone-300 rounded-2xl text-xs font-bold text-stone-500">
            No hay reportes previos generados aún.
          </div>
        ) : (
          <div className="space-y-3">
            {reportes.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 hover:bg-white shadow-[2px_2px_0px_0px_#1C1917] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-950 border border-stone-900">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900 uppercase">
                      {rep.titulo}
                    </h4>
                    <div className="flex items-center space-x-3 text-[11px] text-stone-500 font-medium mt-0.5">
                      <span>{rep.generado_en}</span>
                      <span>•</span>
                      <span className="font-mono">{(rep.tamano_bytes / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span className="text-emerald-800 font-semibold">{rep.fases_resumen}</span>
                    </div>
                  </div>
                </div>

                {/* Enlace directo de descarga en PDF */}
                <a
                  href={`/api/v1/reportes/${rep.id}/descargar`}
                  download={rep.nombre_archivo}
                  className="neo-button inline-flex items-center justify-center space-x-2 px-4 py-2 bg-stone-900 text-white hover:bg-emerald-900 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1C1917] self-start sm:self-auto"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-300" />
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
