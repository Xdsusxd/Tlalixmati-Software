"use client";

import React, { useState } from "react";
import { ScrollText, Clock, ShieldAlert, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { EventoItem } from "@/lib/api";

interface EventsSectionProps {
  eventos: EventoItem[];
}

export function EventsSection({ eventos = [] }: EventsSectionProps) {
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");

  const eventosFiltrados = eventos.filter((ev) => {
    if (filtroNivel === "todos") return true;
    return ev.nivel.toLowerCase() === filtroNivel.toLowerCase();
  });

  const formatearFechaHora = (fechaIso: string) => {
    try {
      const d = new Date(fechaIso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return fechaIso;
    }
  };

  const formatearFechaDia = (fechaIso: string) => {
    try {
      const d = new Date(fechaIso);
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const getPillNivel = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case "critico":
        return {
          pillClass: "pill-mono-active",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-white" />,
          label: "Alerta Crítica",
        };
      case "aviso":
        return {
          pillClass: "pill-mono-subtle border-gray-600 text-white font-bold",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-gray-300" />,
          label: "Aviso",
        };
      case "error":
        return {
          pillClass: "pill-mono-active",
          icon: <AlertCircle className="w-3.5 h-3.5 text-white" />,
          label: "Error",
        };
      default:
        return {
          pillClass: "pill-mono-subtle",
          icon: <Info className="w-3.5 h-3.5 text-gray-400" />,
          label: "Info",
        };
    }
  };

  return (
    <div className="card-mono p-6 sm:p-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#252528] gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold tracking-[-0.03em] heading-chunky text-[#e2e8f0] flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#94a3b8]" />
              Bitácora de Eventos y Detecciones
            </h3>
            <span className="font-data text-[0.65rem] font-semibold text-[#64748b] bg-[#101012] px-2 py-0.5 rounded-full border border-[#252528]">
              {eventos.length}
            </span>
          </div>
          <p className="text-xs font-medium text-[#64748b] mt-1">
            Registro cronológico de inferencias de visión artificial y conectividad de hardware.
          </p>
        </div>

        {/* Filtros en Blanco, Negro y Gris */}
        <div className="segmented-track-mono self-start sm:self-auto">
          {[
            { id: "todos", label: "Todos" },
            { id: "critico", label: "Alertas" },
            { id: "aviso", label: "Avisos" },
            { id: "info", label: "Info" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltroNivel(item.id)}
              className={`segmented-item-mono text-xs py-1.5 px-3 ${
                filtroNivel === item.id ? "active" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Registros Monocromáticos */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {eventosFiltrados.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#121215] border border-[#27272a]">
            <Clock className="w-6 h-6 mx-auto mb-2 text-gray-500" />
            <p className="text-xs font-extrabold text-white">Sin eventos en este criterio</p>
            <p className="text-xs font-medium text-gray-400 mt-0.5">
              Los sucesos de campo y diagnósticos de visión aparecerán automáticamente.
            </p>
          </div>
        ) : (
          eventosFiltrados.map((ev) => {
            const nivelInfo = getPillNivel(ev.nivel);
            return (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl border border-[#27272a] bg-[#121215] hover:border-gray-500 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className={`${nivelInfo.pillClass} shrink-0 mt-0.5`}>
                    {nivelInfo.icon}
                    <span>{nivelInfo.label}</span>
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">
                        {ev.mensaje}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#18181b] text-gray-400 border border-[#27272a]">
                        {ev.origen}
                      </span>
                    </div>
                    {ev.detalles && Object.keys(ev.detalles).length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 font-mono line-clamp-1 font-medium">
                        {JSON.stringify(ev.detalles).replace(/[{}"]/g, " ").trim()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto shrink-0 font-mono">
                  <div className="text-xs font-bold text-gray-200">
                    {formatearFechaHora(ev.creado_en)}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-500">
                    {formatearFechaDia(ev.creado_en)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
