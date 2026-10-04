"use client";

import React, { useState } from "react";
import { AlertTriangle, AlertCircle, Info, ShieldAlert, Clock, Filter, ScrollText } from "lucide-react";
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

  const badgePorNivel = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case "critico":
        return {
          icono: <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />,
          clase: "bg-rose-50 text-rose-700 border-rose-200/80",
          texto: "Alerta Crítica",
        };
      case "aviso":
        return {
          icono: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
          clase: "bg-amber-50 text-amber-700 border-amber-200/80",
          texto: "Aviso",
        };
      case "error":
        return {
          icono: <AlertCircle className="h-3.5 w-3.5 text-red-600" />,
          clase: "bg-red-50 text-red-700 border-red-200/80",
          texto: "Error",
        };
      default:
        return {
          icono: <Info className="h-3.5 w-3.5 text-emerald-600" />,
          clase: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          texto: "Info",
        };
    }
  };

  return (
    <section className="organic-card p-6 sm:p-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Bitácora de Eventos y Detecciones
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium flex items-center gap-1.5">
              <ScrollText className="h-3 w-3 text-stone-600" />
              Auditoría
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Registro cronológico de inferencias de visión artificial, reportes automáticos y conectividad de hardware.
          </p>
        </div>

        {/* Filtros de severidad */}
        <div className="flex items-center space-x-1.5 bg-stone-100/80 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setFiltroNivel("todos")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filtroNivel === "todos"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Todos ({eventos.length})
          </button>
          <button
            onClick={() => setFiltroNivel("critico")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filtroNivel === "critico"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            Alertas
          </button>
          <button
            onClick={() => setFiltroNivel("aviso")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filtroNivel === "aviso"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            Avisos
          </button>
          <button
            onClick={() => setFiltroNivel("info")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filtroNivel === "info"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Lista de Sucesos */}
      <div className="mt-5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {eventosFiltrados.length === 0 ? (
          <div className="p-8 text-center bg-stone-50/70 border border-stone-100 rounded-2xl">
            <Clock className="h-6 w-6 text-stone-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-stone-700">Sin eventos en la bitácora</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Los sucesos fitosanitarios y cambios de estado de campo se reflejarán aquí en tiempo real.
            </p>
          </div>
        ) : (
          eventosFiltrados.map((ev) => {
            const badge = badgePorNivel(ev.nivel);
            return (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-white border border-stone-200/70 hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-xl border mt-0.5 sm:mt-0 ${badge.clase}`}>
                    {badge.icono}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-900">{ev.mensaje}</span>
                      <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                        {ev.origen}
                      </span>
                    </div>
                    {ev.detalles && Object.keys(ev.detalles).length > 0 && (
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {JSON.stringify(ev.detalles).replace(/[{}\"]/g, " ").trim()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto shrink-0">
                  <div className="text-xs font-mono font-medium text-stone-600">
                    {formatearFechaHora(ev.creado_en)}
                  </div>
                  <div className="text-[10px] text-stone-400">
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
