"use client";

import React from "react";
import { Thermometer, Droplets, Sun, BatteryMedium, AlertCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TelemetrySectionProps {
  sensoresTexto: string;
}

export function TelemetrySection({ sensoresTexto }: TelemetrySectionProps) {
  // Datos reales en espera: Cero simulación de datos inventados
  const datosGrafica = [
    { hora: "00:00", valor: null },
    { hora: "04:00", valor: null },
    { hora: "08:00", valor: null },
    { hora: "12:00", valor: null },
    { hora: "16:00", valor: null },
    { hora: "20:00", valor: null },
  ];

  return (
    <section className="neo-box p-6 sm:p-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b-2 border-stone-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              Telemetría y Sensores Físicos
            </h2>
            <span className="neo-badge text-xs px-3 py-1 bg-stone-100 text-stone-900">
              ESP32 Link
            </span>
          </div>
          <p className="text-sm font-medium text-stone-600 mt-1.5">
            Lecturas físicas de suelo y ambiente transmitidas en tiempo real.
          </p>
        </div>

        <span className="neo-badge text-xs px-3 py-1 bg-stone-100 text-stone-800 font-extrabold self-start sm:self-auto uppercase">
          {sensoresTexto || "Sin datos"}
        </span>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        
        {/* Humedad de Suelo */}
        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-stone-700">
            <div className="p-2 rounded-xl bg-emerald-200 border border-stone-900 text-emerald-950">
              <Droplets className="h-4 w-4" />
            </div>
            <span className="text-xs font-black uppercase">Humedad Suelo</span>
          </div>
          <div className="mt-3 text-2xl font-black text-stone-900">-- %</div>
          <span className="text-[11px] font-bold text-stone-400 mt-1">Sin datos</span>
        </div>

        {/* Temperatura Ambiente */}
        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-stone-700">
            <div className="p-2 rounded-xl bg-amber-200 border border-stone-900 text-amber-950">
              <Thermometer className="h-4 w-4" />
            </div>
            <span className="text-xs font-black uppercase">Temperatura</span>
          </div>
          <div className="mt-3 text-2xl font-black text-stone-900">-- °C</div>
          <span className="text-[11px] font-bold text-stone-400 mt-1">Sin datos</span>
        </div>

        {/* Radiación Solar */}
        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-stone-700">
            <div className="p-2 rounded-xl bg-yellow-200 border border-stone-900 text-yellow-950">
              <Sun className="h-4 w-4" />
            </div>
            <span className="text-xs font-black uppercase">Radiación</span>
          </div>
          <div className="mt-3 text-2xl font-black text-stone-900">-- lux</div>
          <span className="text-[11px] font-bold text-stone-400 mt-1">Sin datos</span>
        </div>

        {/* Alimentación */}
        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-stone-700">
            <div className="p-2 rounded-xl bg-stone-200 border border-stone-900 text-stone-900">
              <BatteryMedium className="h-4 w-4" />
            </div>
            <span className="text-xs font-black uppercase">Voltaje VCC</span>
          </div>
          <div className="mt-3 text-2xl font-black text-stone-900">-- V</div>
          <span className="text-[11px] font-bold text-stone-400 mt-1">Sin datos</span>
        </div>

      </div>

      {/* Gráfica Recharts enmarcada */}
      <div className="mt-6 p-5 rounded-2xl border-2 border-stone-800 bg-stone-50/70 relative shadow-[3px_3px_0px_0px_#1C1917]">
        <div className="text-xs font-black text-stone-800 uppercase mb-3">Historial de Telemetría (24 Horas)</div>
        
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="2 2" stroke="#CBD5E1" vertical={false} />
              <XAxis dataKey="hora" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#15803D" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          {/* Mensaje de espera de datos reales */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-xl border border-stone-300">
            <AlertCircle className="h-6 w-6 text-stone-600 mb-1" />
            <span className="text-xs font-black text-stone-800 uppercase">Sin mediciones de hardware disponibles</span>
            <span className="text-[11px] font-medium text-stone-500 mt-0.5">El gráfico trazará datos tan pronto el ESP32 reporte lecturas físicas</span>
          </div>
        </div>
      </div>
    </section>
  );
}
