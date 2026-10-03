"use client";

import React from "react";
import { Thermometer, Droplets, Sun, BatteryMedium, AlertCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TelemetrySectionProps {
  sensoresTexto: string;
}

export function TelemetrySection({ sensoresTexto }: TelemetrySectionProps) {
  // Datos vacíos intencionales: NO INVENTAR MEDICIONES
  const datosGrafica: Array<{ hora: string; valor: number | null }> = [
    { hora: "00:00", valor: null },
    { hora: "04:00", valor: null },
    { hora: "08:00", valor: null },
    { hora: "12:00", valor: null },
    { hora: "16:00", valor: null },
    { hora: "20:00", valor: null },
  ];

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 card-elevation">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">Telemetría y Sensores de Campo</h2>
          <p className="text-xs text-stone-500">Lecturas físicas transmitidas por el ESP32 en tiempo real.</p>
        </div>
        <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium border border-stone-200">
          {sensoresTexto || "Sin datos"}
        </span>
      </div>

      {/* Tarjetas de Métricas Sensoriales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        
        {/* Humedad de Suelo */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-center space-x-2 text-stone-500">
            <Droplets className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium">Humedad Suelo</span>
          </div>
          <div className="mt-2 text-xl font-bold text-stone-800">-- %</div>
          <span className="text-[11px] text-stone-400 font-medium">Sin datos</span>
        </div>

        {/* Temperatura Ambiente */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-center space-x-2 text-stone-500">
            <Thermometer className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium">Temperatura</span>
          </div>
          <div className="mt-2 text-xl font-bold text-stone-800">-- °C</div>
          <span className="text-[11px] text-stone-400 font-medium">Sin datos</span>
        </div>

        {/* Radiación Solar */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-center space-x-2 text-stone-500">
            <Sun className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-medium">Radiación Solar</span>
          </div>
          <div className="mt-2 text-xl font-bold text-stone-800">-- lux</div>
          <span className="text-[11px] text-stone-400 font-medium">Sin datos</span>
        </div>

        {/* Batería / Alimentación */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-center space-x-2 text-stone-500">
            <BatteryMedium className="h-4 w-4 text-stone-600" />
            <span className="text-xs font-medium">Alimentación</span>
          </div>
          <div className="mt-2 text-xl font-bold text-stone-800">-- V</div>
          <span className="text-[11px] text-stone-400 font-medium">Sin datos</span>
        </div>

      </div>

      {/* Gráfica Recharts con Estado Vacío Explícito */}
      <div className="mt-6 p-4 rounded-xl border border-stone-200/80 bg-stone-50/40 relative">
        <div className="text-xs font-semibold text-stone-700 mb-3">Historial de Telemetría (Últimas 24 horas)</div>
        
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="hora" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#16A34A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          {/* Mensaje de Estado Vacío */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-lg">
            <AlertCircle className="h-6 w-6 text-stone-400 mb-1" />
            <span className="text-xs font-medium text-stone-600">Sin mediciones de hardware disponibles</span>
            <span className="text-[11px] text-stone-400 mt-0.5">El gráfico trazará datos tan pronto el ESP32 transmita lecturas reales</span>
          </div>
        </div>
      </div>
    </section>
  );
}
