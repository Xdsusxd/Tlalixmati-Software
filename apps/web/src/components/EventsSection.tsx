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
          pillClass: "pill-crit",
          icon: <ShieldAlert className="w-3 h-3 text-[#b91c1c]" />,
          label: "Crítico",
        };
      case "aviso":
        return {
          pillClass: "pill-warn",
          icon: <AlertTriangle className="w-3 h-3 text-[#b45309]" />,
          label: "Aviso",
        };
      case "error":
        return {
          pillClass: "pill-crit",
          icon: <AlertCircle className="w-3 h-3 text-[#b91c1c]" />,
          label: "Error",
        };
      default:
        return {
          pillClass: "pill-neutral",
          icon: <Info className="w-3 h-3 text-[#71717a]" />,
          label: "Info",
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(24,24,27,0.07)] p-5 sm:p-6 shadow-xs">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[rgba(24,24,27,0.06)] gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-[#18181b] font-display flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#71717a]" />
              Bitácora de Eventos y Detecciones
            </h3>
            <span className="text-xs font-mono text-[#a1a1aa]">({eventos.length})</span>
          </div>
          <p className="text-xs text-[#71717a] mt-0.5">
            Registro cronológico inmutable de inferencias en GPU, hardware y alertas fitosanitarias.
          </p>
        </div>

        {/* Filtros tipo Apple Segmented */}
        <div className="segmented-track self-start sm:self-auto">
          {[
            { id: "todos", label: "Todos" },
            { id: "critico", label: "Alertas" },
            { id: "aviso", label: "Avisos" },
            { id: "info", label: "Info" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltroNivel(item.id)}
              className={`segmented-item text-xs py-1 px-2.5 ${
                filtroNivel === item.id ? "active" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {eventosFiltrados.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#fbfbfb] border border-[rgba(24,24,27,0.06)]">
            <Clock className="w-5 h-5 mx-auto mb-2 text-[#a1a1aa]" />
            <p className="text-xs font-semibold text-[#18181b]">Sin eventos en este criterio</p>
            <p className="text-[11px] text-[#71717a] mt-0.5">
              Los sucesos de campo y diagnósticos de visión aparecerán automáticamente.
            </p>
          </div>
        ) : (
          eventosFiltrados.map((ev) => {
            const nivelInfo = getPillNivel(ev.nivel);
            return (
              <div
                key={ev.id}
                className="p-3 rounded-xl border border-[rgba(24,24,27,0.06)] bg-[#ffffff] hover:border-[rgba(24,24,27,0.12)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{nivelInfo.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-[#18181b]">
                        {ev.mensaje}
                      </span>
                      <span className="font-code text-[10px] uppercase px-1.5 py-0.2 rounded bg-[#f4f4f5] text-[#71717a] border border-[rgba(24,24,27,0.06)]">
                        {ev.origen}
                      </span>
                    </div>
                    {ev.detalles && Object.keys(ev.detalles).length > 0 && (
                      <p className="text-[11px] text-[#71717a] mt-0.5 font-mono line-clamp-1">
                        {JSON.stringify(ev.detalles).replace(/[{}"]/g, " ").trim()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto shrink-0 font-mono">
                  <div className="text-xs font-medium text-[#52525b]">
                    {formatearFechaHora(ev.creado_en)}
                  </div>
                  <div className="text-[10px] text-[#a1a1aa]">
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
