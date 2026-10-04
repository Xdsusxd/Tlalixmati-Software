"use client";

import React, { useState } from "react";
import { AlertTriangle, AlertCircle, Info, ShieldAlert, Clock, ScrollText } from "lucide-react";
import { EventoItem } from "@/lib/api";

interface EventsSectionProps {
  eventos: EventoItem[];
}

const BLUE = "#0069e9";
const BLUE_DARK = "#055bd3";
const BLUE_LIGHT = "rgba(0, 105, 233, 0.08)";
const BLUE_BORDER = "rgba(0, 105, 233, 0.22)";

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

  const badgePorNivel = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case "critico":
        return {
          icono: <ShieldAlert className="h-3.5 w-3.5 text-red-600" />,
          bg: "#fef2f2",
          border: "#fecaca",
          color: "#991b1b",
          label: "Alerta Crítica",
        };
      case "aviso":
        return {
          icono: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
          bg: "#fffbeb",
          border: "#fde68a",
          color: "#92400e",
          label: "Aviso",
        };
      case "error":
        return {
          icono: <AlertCircle className="h-3.5 w-3.5 text-red-600" />,
          bg: "#fef2f2",
          border: "#fecaca",
          color: "#991b1b",
          label: "Error",
        };
      default:
        return {
          icono: <Info className="h-3.5 w-3.5 text-[#0069e9]" />,
          bg: BLUE_LIGHT,
          border: BLUE_BORDER,
          color: BLUE_DARK,
          label: "Info",
        };
    }
  };

  type FilterBtnProps = {
    label: string;
    value: string;
  };

  function FilterBtn({ label, value }: FilterBtnProps) {
    const isActive = filtroNivel === value;
    return (
      <button
        onClick={() => setFiltroNivel(value)}
        className="px-2.5 py-1 rounded-md text-xs font-semibold transition-colors"
        style={{
          background: isActive ? BLUE : "transparent",
          color: isActive ? "#ffffff" : "#6b7280",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <section className="dash-card p-6 sm:p-7">
      {/* Encabezado */}
      <div className="section-header sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              className="text-xl font-bold tracking-tight text-gray-900"
              style={{ letterSpacing: "-0.02em" }}
            >
              Bitácora de Eventos y Detecciones
            </h2>
            <span className="badge-blue">
              <ScrollText className="h-3 w-3" />
              Auditoría
            </span>
          </div>
          <p className="text-xs mt-1 text-gray-500">
            Registro cronológico de inferencias de visión artificial, reportes automáticos y conectividad de hardware.
          </p>
        </div>

        {/* Filtros de severidad */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 border border-gray-200 self-start sm:self-auto">
          <FilterBtn label={`Todos (${eventos.length})`} value="todos" />
          <FilterBtn label="Alertas" value="critico" />
          <FilterBtn label="Avisos" value="aviso" />
          <FilterBtn label="Info" value="info" />
        </div>
      </div>

      {/* Lista de Sucesos */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {eventosFiltrados.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-gray-200 bg-gray-50">
            <Clock className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p className="text-xs font-semibold text-gray-600">
              Sin eventos en la bitácora
            </p>
            <p className="text-[11px] mt-0.5 text-gray-400">
              Los sucesos fitosanitarios y cambios de estado de campo se reflejarán aquí en tiempo real.
            </p>
          </div>
        ) : (
          eventosFiltrados.map((ev) => {
            const badge = badgePorNivel(ev.nivel);
            return (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-1.5 rounded-lg border mt-0.5 sm:mt-0"
                    style={{ background: badge.bg, borderColor: badge.border }}
                  >
                    {badge.icono}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-900">
                        {ev.mensaje}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500">
                        {ev.origen}
                      </span>
                    </div>
                    {ev.detalles && Object.keys(ev.detalles).length > 0 && (
                      <p className="text-[11px] mt-0.5 text-gray-500 line-clamp-1">
                        {JSON.stringify(ev.detalles).replace(/[{}"]/g, " ").trim()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto shrink-0">
                  <div className="text-xs font-mono font-medium text-gray-600">
                    {formatearFechaHora(ev.creado_en)}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {formatearFechaDia(ev.creado_en)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
