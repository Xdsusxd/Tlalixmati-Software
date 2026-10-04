"use client";

import React, { useState } from "react";
import { FileText, Download, Plus, CheckCircle, Clock, Cloud, AlertCircle, ShieldAlert } from "lucide-react";
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
      color: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
    },
    {
      fase: "Fase 2: Crecimiento Vegetativo y Hojas",
      estado: "Buen estado",
      detalle: "Área foliar óptima sin signos de clorosis.",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
    },
    {
      fase: "Fase 3: Floración y Cuajado de Fruto",
      estado: "Monitoreo preventivo",
      detalle: "Vigilancia constante de humedad y nutrición.",
      color: "bg-amber-50 text-amber-800 border-amber-200/70",
    },
    {
      fase: "Fase 4: Maduración y Cosecha",
      estado: "Fase programada",
      detalle: "Proyección favorable según calendario vegetal.",
      color: "bg-stone-100 text-stone-700 border-stone-200/70",
    },
  ];

  // Generación Manual
  const handleGenerarManual = async () => {
    setGenerando(true);
    setMensaje(null);
    try {
      const nuevo = await api.generarReporte(
        "Informe Técnico Agronómico de Seguimiento",
        "Generación manual solicitada por el usuario desde el panel.",
        "manual"
      );
      if (nuevo) {
        setReportes((prev) => [nuevo, ...prev]);
        setMensaje("Informe PDF generado manualmente y guardado en Supabase Cloud.");
      }
    } catch {
      setMensaje("No se pudo compilar el reporte.");
    } finally {
      setGenerando(false);
    }
  };

  // Simulación de Disparo Automático por Planta en Mal Estado
  const handleDisparoAutomatico = async () => {
    setGenerando(true);
    setMensaje(null);
    try {
      const alerta = await api.dispararAlertaAutomatica(
        "Detección óptica: Hojas basales con pérdida de turgencia y signos de estrés hídrico."
      );
      if (alerta) {
        setReportes((prev) => [alerta, ...prev]);
        setMensaje("¡Alerta automática generada! Planta en mal estado detectada. Informe PDF guardado en Supabase.");
      }
    } catch {
      setMensaje("Error al procesar la alerta automática.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <section className="organic-card p-6 sm:p-7">
      {/* Encabezado Principal y Acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-5 border-b border-stone-100 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Informes y Reportes del Cultivo
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">
              Almacenado en Supabase
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Generación automática por detección de anomalías o manual bajo demanda. Incluye fotos reales y evaluación de fases.
          </p>
        </div>

        {/* Botones de Descarga y Generación */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón Principal: Descargar PDF Reciente */}
          <a
            href="/api/v1/reportes/reciente/descargar"
            download="informe_reciente_tlalixmati.pdf"
            className="organic-btn inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-300" />
            <span>Descargar Informe Reciente (PDF)</span>
          </a>

          {/* Botón Generar Manual */}
          <button
            onClick={handleGenerarManual}
            disabled={generando}
            className="organic-btn inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium rounded-xl border border-stone-300 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5 text-stone-500" />
            <span>{generando ? "Procesando..." : "Generar Manual"}</span>
          </button>

          {/* Botón Probar Disparo Automático de Alerta */}
          <button
            onClick={handleDisparoAutomatico}
            disabled={generando}
            className="organic-btn inline-flex items-center space-x-1.5 px-3 py-2.5 bg-red-50 hover:bg-red-100/70 text-red-800 text-xs font-medium rounded-xl border border-red-200/70 disabled:opacity-50"
            title="Simula la detección automática de una planta enferma o con estrés"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
            <span>Simular Alerta de Planta</span>
          </button>
        </div>
      </div>

      {/* Mensaje Informativo */}
      {mensaje && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs font-medium text-emerald-900 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Fases del Cultivo */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
          Fases Fenológicas Evaluadas en los Informes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fasesDefault.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/70 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-1">
                  Etapa 0{idx + 1}
                </span>
                <h4 className="text-xs font-bold text-stone-800">
                  {item.fase}
                </h4>
                <p className="text-[11px] text-stone-500 mt-1.5 leading-snug">
                  {item.detalle}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">Estado:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${item.color}`}>
                  {item.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Descargas de Reportes Anteriores */}
      <div className="mt-6 pt-5 border-t border-stone-100">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2 text-stone-700">
            <Clock className="h-4 w-4 text-stone-500" />
            <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Descargar Informes Anteriores (Historial)
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">
            {reportes.length} archivo{reportes.length === 1 ? "" : "s"} guardado{reportes.length === 1 ? "" : "s"}
          </span>
        </div>

        {reportes.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl text-xs text-stone-500">
            No hay reportes previos registrados.
          </div>
        ) : (
          <div className="space-y-2.5">
            {reportes.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl bg-stone-50/50 hover:bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    rep.alerta_detectada
                      ? "bg-red-100 text-red-800"
                      : "bg-emerald-100 text-emerald-900"
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-semibold text-stone-900">
                        {rep.titulo}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        rep.origen === "automatico"
                          ? "bg-red-100 text-red-800"
                          : "bg-stone-100 text-stone-700"
                      }`}>
                        {rep.origen === "automatico" ? "Automático por Alerta" : "Manual"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-stone-500 mt-0.5">
                      <span>{rep.generado_en}</span>
                      <span>•</span>
                      <span className="font-mono">{(rep.tamano_bytes / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-emerald-700">
                        <Cloud className="h-3 w-3" />
                        <span>Supabase</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón de Descarga Individual */}
                <a
                  href={`/api/v1/reportes/${rep.id}/descargar`}
                  download={rep.nombre_archivo}
                  className="organic-btn inline-flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg border border-stone-200 self-start sm:self-auto"
                >
                  <Download className="h-3.5 w-3.5 text-stone-600" />
                  <span>Descargar</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
