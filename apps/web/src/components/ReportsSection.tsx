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
  CloudCheck,
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
    <div className="bg-white rounded-2xl border border-[rgba(24,24,27,0.07)] p-5 sm:p-6 shadow-xs space-y-6">
      {/* Encabezado y Acciones de Descarga */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[rgba(24,24,27,0.06)] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-[#18181b] font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#71717a]" />
              Informes Técnicos Agronómicos
            </h3>
            <span className="pill-status pill-neutral font-mono text-[10px]">
              Supabase Storage
            </span>
          </div>
          <p className="text-xs text-[#71717a] mt-0.5">
            Generación automática ante anomalías fitosanitarias o emisión bajo demanda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/v1/reportes/reciente/descargar"
            download="informe_reciente_tlalixmati.pdf"
            className="btn-graphite text-xs py-1.5 px-3"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Reciente</span>
          </a>

          <button
            onClick={handleGenerarManual}
            disabled={generando}
            className="btn-quiet text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{generando ? "Compilando..." : "Nuevo Informe"}</span>
          </button>
        </div>
      </div>

      {/* Notificación de compilación exitosa */}
      {mensaje && (
        <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-[rgba(21,128,61,0.06)] border border-[rgba(21,128,61,0.18)] text-[#15803d]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Estado Fenológico del Cultivo (Horizontal Apple Step Progress) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="micro-label flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#71717a]" />
            Etapas Fenológicas del Ciclo Productivo
          </span>
          <span className="text-[11px] font-mono text-[#a1a1aa]">Lote Activo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fasesDefault.map((f, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-colors ${
                f.activo
                  ? "bg-[#fafafa] border-[rgba(24,24,27,0.14)]"
                  : "bg-[#ffffff] border-[rgba(24,24,27,0.06)] opacity-70"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-[#18181b] truncate">
                  {f.fase}
                </span>
                <span
                  className={`pill-status text-[10px] py-0 px-1.5 ${
                    f.activo ? "pill-ok" : "pill-neutral"
                  }`}
                >
                  {f.estado}
                </span>
              </div>
              <p className="text-[11px] text-[#71717a] leading-relaxed">
                {f.detalle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger de Archivos Compilados */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#71717a]" />
            <span className="micro-label">Historial de Reportes Generados</span>
          </div>
          <span className="text-[11px] font-mono text-[#a1a1aa]">
            {reportes.length} archivos
          </span>
        </div>

        {reportes.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#fbfbfb] border border-[rgba(24,24,27,0.06)] text-xs text-[#71717a]">
            No hay reportes archivados todavía. Genere uno manualmente o espere a una alerta de campo.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(24,24,27,0.06)]">
            {reportes.map((rep) => {
              const esAlerta =
                rep.alerta_detectada ||
                rep.origen === "automatico" ||
                rep.titulo.toLowerCase().includes("alerta");

              return (
                <div
                  key={rep.id}
                  className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        esAlerta
                          ? "bg-[rgba(185,28,28,0.08)] text-[#b91c1c]"
                          : "bg-[#f4f4f5] text-[#71717a]"
                      }`}
                    >
                      {esAlerta ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[#18181b]">
                          {rep.titulo}
                        </span>
                        <span
                          className={`pill-status text-[10px] py-0 px-1.5 ${
                            esAlerta ? "pill-crit" : "pill-neutral"
                          }`}
                        >
                          {esAlerta ? "Alerta Automática" : "Seguimiento"}
                        </span>
                      </div>
                      {rep.fases_resumen && (
                        <p className="text-[11px] text-[#71717a] mt-0.5 line-clamp-1">
                          {rep.fases_resumen}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 font-mono">
                    <div className="text-right">
                      <div className="text-xs font-medium text-[#52525b]">
                        {new Date(rep.generado_en).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[10px] text-[#a1a1aa]">
                        {formatearBytes(rep.tamano_bytes)}
                      </div>
                    </div>

                    <a
                      href={rep.url_descarga}
                      download={`informe_${rep.id.substring(0, 8)}.pdf`}
                      className="p-1.5 rounded-lg text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-colors"
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
