"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { api, ReporteInfoResponse } from "@/lib/api";

interface ReportsSectionProps {
  reportesIniciales: ReporteInfoResponse[];
}

function formatearBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const fasesDefault = [
  {
    fase: "Germinación y Emergencia",
    estado: "Completada",
    detalle: "Establecimiento radicular uniforme y vigoroso.",
    activo: true,
  },
  {
    fase: "Crecimiento Vegetativo",
    estado: "En curso",
    detalle: "Expansión foliar activa con clorofila óptima.",
    activo: true,
  },
  {
    fase: "Floración y Cuajado",
    estado: "Programada",
    detalle: "Monitoreo prioritario de humedad y nutrición.",
    activo: false,
  },
  {
    fase: "Maduración y Cosecha",
    estado: "Fase final",
    detalle: "Proyección agronómica según calendario vegetal.",
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
        "Generación manual solicitada por el operador desde el panel.",
        "manual"
      );
      if (nuevo) {
        setReportes((prev) => [nuevo, ...prev]);
        setMensaje("Informe técnico compilado y sincronizado con Supabase Storage.");
      }
    } catch {
      setMensaje("No fue posible compilar el reporte en este momento.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="card-mono p-6 sm:p-7 space-y-6">
      {/* Encabezado y Acciones de Descarga */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold tracking-tight text-[#111111] heading-chunky flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#111111]" />
              Informes Técnicos del Cultivo
            </h3>
            <span className="pill-mono-subtle font-mono text-[10px] font-bold">
              Supabase Storage
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Generación automática ante anomalías fitosanitarias o emisión bajo demanda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/v1/reportes/reciente/descargar"
            download="informe_reciente_tlalixmati.pdf"
            className="btn-black text-xs py-2 px-3.5"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Reciente (PDF)</span>
          </a>

          <button
            onClick={handleGenerarManual}
            disabled={generando}
            className="btn-outline-gray text-xs py-2 px-3.5"
          >
            <Plus className="w-4 h-4" />
            <span>{generando ? "Compilando..." : "Nuevo Informe"}</span>
          </button>
        </div>
      </div>

      {/* Notificación monocromática */}
      {mensaje && (
        <div className="p-3.5 rounded-xl text-xs flex items-center gap-2.5 bg-gray-100 border border-gray-300 text-[#111111] font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#111111]" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Estado Fenológico del Cultivo */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="micro-label flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#111111]" />
            Etapas Fenológicas del Ciclo Productivo
          </span>
          <span className="text-xs font-mono font-bold text-gray-500">Lote Activo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fasesDefault.map((f, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-colors ${
                f.activo
                  ? "bg-white border-[#111111] shadow-2xs"
                  : "bg-gray-50 border-gray-200 opacity-75"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-extrabold text-[#111111] truncate">
                  {f.fase}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    f.activo
                      ? "bg-[#111111] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {f.estado}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                {f.detalle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Reportes Generados */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#111111]" />
            <span className="micro-label">Historial de Reportes Compilados</span>
          </div>
          <span className="text-xs font-mono font-bold text-gray-500">
            {reportes.length} archivos
          </span>
        </div>

        {reportes.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 font-medium">
            No hay reportes archivados todavía. Genere uno manualmente o espere a una alerta de campo.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reportes.map((rep) => {
              const esAlerta =
                rep.alerta_detectada ||
                rep.origen === "automatico" ||
                rep.titulo.toLowerCase().includes("alerta");

              return (
                <div
                  key={rep.id}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        esAlerta
                          ? "bg-[#111111] text-white"
                          : "bg-gray-100 text-[#111111]"
                      }`}
                    >
                      {esAlerta ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-[#111111]">
                          {rep.titulo}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            esAlerta
                              ? "bg-[#111111] text-white"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {esAlerta ? "Alerta Automática" : "Seguimiento"}
                        </span>
                      </div>
                      {rep.fases_resumen && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 font-medium">
                          {rep.fases_resumen}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 font-mono">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#111111]">
                        {new Date(rep.generado_en).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[11px] font-semibold text-gray-400">
                        {formatearBytes(rep.tamano_bytes)}
                      </div>
                    </div>

                    <a
                      href={rep.url_descarga}
                      download={`informe_${rep.id.substring(0, 8)}.pdf`}
                      className="p-2 rounded-xl text-gray-600 hover:text-[#111111] hover:bg-gray-100 transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
