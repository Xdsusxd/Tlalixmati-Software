"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Plus,
  CheckCircle,
  Clock,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { api, ReporteInfoResponse } from "@/lib/api";

interface ReportsSectionProps {
  reportesIniciales: ReporteInfoResponse[];
}

const BLUE = "#0069e9";
const BLUE_DARK = "#055bd3";
const BLUE_LIGHT = "rgba(0, 105, 233, 0.08)";
const BLUE_BORDER = "rgba(0, 105, 233, 0.22)";

/** Convierte bytes a string legible */
function formatearBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const fasesDefault = [
  {
    fase: "Germinación y Emergencia",
    estado: "Buen estado",
    detalle: "Establecimiento vigoroso y uniforme del cultivo.",
    activo: true,
  },
  {
    fase: "Crecimiento Vegetativo",
    estado: "Buen estado",
    detalle: "Área foliar óptima sin signos de clorosis.",
    activo: true,
  },
  {
    fase: "Floración y Cuajado",
    estado: "Monitoreo activo",
    detalle: "Vigilancia constante de humedad y nutrición.",
    activo: false,
  },
  {
    fase: "Maduración y Cosecha",
    estado: "Fase programada",
    detalle: "Proyección favorable según calendario vegetal.",
    activo: false,
  },
];

export function ReportsSection({ reportesIniciales }: ReportsSectionProps) {
  const [reportes, setReportes] = useState<ReporteInfoResponse[]>(reportesIniciales);
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

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
        setMensaje("Informe PDF compilado y guardado en Supabase Storage.");
      }
    } catch {
      setMensaje("No se pudo compilar el reporte.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <section className="dash-card p-6 sm:p-7">
      {/* Encabezado Principal y Acciones */}
      <div className="section-header lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              className="text-xl font-bold tracking-tight text-gray-900"
              style={{ letterSpacing: "-0.02em" }}
            >
              Informes y Reportes del Cultivo
            </h2>
            <span className="badge-blue">Supabase Cloud</span>
          </div>
          <p className="text-xs mt-1 text-gray-500">
            Generación automática por detección de anomalías o manual bajo demanda. Incluye evaluación de fases.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/v1/reportes/reciente/descargar"
            download="informe_reciente_tlalixmati.pdf"
            className="btn-primary"
          >
            <Download className="h-4 w-4" />
            <span>Descargar Reciente (PDF)</span>
          </a>

          <button
            onClick={handleGenerarManual}
            disabled={generando}
            className="btn-secondary"
            title="Generar nuevo reporte técnico en PDF"
          >
            <Plus className="h-4 w-4" />
            <span>{generando ? "Generando..." : "Generar Manual"}</span>
          </button>
        </div>
      </div>

      {/* Aviso Temporal */}
      {mensaje && (
        <div
          className="mb-5 p-3 rounded-xl text-xs flex items-center gap-2 border"
          style={{
            background: BLUE_LIGHT,
            borderColor: BLUE_BORDER,
            color: BLUE_DARK,
          }}
        >
          <CheckCircle className="h-4 w-4 shrink-0 text-[#0069e9]" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* 4 Fases Fenológicas del Cultivo */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-gray-500">
          <Layers className="h-3.5 w-3.5 text-[#0069e9]" />
          Estado Fisiológico y Fenológico del Cultivo
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fasesDefault.map((f, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl flex flex-col justify-between gap-2 border bg-white transition-colors"
              style={{
                borderColor: f.activo ? BLUE_BORDER : "#e5e7eb",
              }}
            >
              <div>
                <span className={`text-xs font-bold line-clamp-1 ${f.activo ? "text-gray-900" : "text-gray-600"}`}>
                  {f.fase}
                </span>
                <p className="text-[11px] mt-1 leading-snug text-gray-500">
                  {f.detalle}
                </p>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border self-start"
                style={{
                  background: f.activo ? BLUE_LIGHT : "#f3f4f6",
                  borderColor: f.activo ? BLUE_BORDER : "#e5e7eb",
                  color: f.activo ? BLUE_DARK : "#6b7280",
                }}
              >
                {f.estado}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Reportes Almacenados */}
      <div className="pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#0069e9]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Historial de Informes Fitosanitarios
            </h3>
          </div>
          <span className="text-[11px] font-medium text-gray-400">
            {reportes.length} informes archivados
          </span>
        </div>

        {reportes.length === 0 ? (
          <div className="p-6 text-center rounded-xl text-xs border border-gray-200 bg-gray-50 text-gray-500">
            No hay reportes archivados todavía. Genere uno manualmente o espere a una alerta de campo.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {reportes.map((rep) => {
              const esAlerta =
                rep.alerta_detectada ||
                rep.origen === "automatico" ||
                rep.titulo.toLowerCase().includes("alerta");

              return (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg border mt-0.5 sm:mt-0"
                      style={{
                        background: esAlerta ? "#fef2f2" : BLUE_LIGHT,
                        borderColor: esAlerta ? "#fecaca" : BLUE_BORDER,
                        color: esAlerta ? "#dc2626" : BLUE,
                      }}
                    >
                      {esAlerta ? (
                        <ShieldAlert className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-900">
                          {rep.titulo}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                          style={{
                            background: esAlerta ? "#fef2f2" : BLUE_LIGHT,
                            borderColor: esAlerta ? "#fecaca" : BLUE_BORDER,
                            color: esAlerta ? "#991b1b" : BLUE_DARK,
                          }}
                        >
                          {esAlerta ? "Alerta Automática" : "Seguimiento"}
                        </span>
                      </div>
                      {rep.fases_resumen && (
                        <p className="text-[11px] mt-0.5 text-gray-500 line-clamp-1">
                          {rep.fases_resumen}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-gray-600">
                        {new Date(rep.generado_en).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">
                        {formatearBytes(rep.tamano_bytes)}
                      </div>
                    </div>

                    <a
                      href={rep.url_descarga}
                      download={`informe_${rep.id.substring(0, 8)}.pdf`}
                      className="btn-secondary p-2"
                      title="Descargar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
