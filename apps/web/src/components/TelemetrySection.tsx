"use client";

import React from "react";
import { Thermometer, Droplets, Sun, BatteryMedium, AlertCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TelemetrySectionProps {
  sensoresTexto: string;
}

export function TelemetrySection({ sensoresTexto }: TelemetrySectionProps) {
  const datosGrafica = [
    { hora: "00:00", valor: null },
    { hora: "04:00", valor: null },
    { hora: "08:00", valor: null },
    { hora: "12:00", valor: null },
    { hora: "16:00", valor: null },
    { hora: "20:00", valor: null },
  ];

  return (
    <section className="organic-card p-6 sm:p-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Condiciones del Terreno y Clima
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
              Sensores de Campo
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Parámetros ambientales registrados directamente por las sondas de suelo y ambiente.
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-600 font-medium self-start sm:self-auto border border-stone-200">
          {sensoresTexto || "Sin datos de sensores"}
        </span>
      </div>

      {/* Grid de Métricas Limpias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        
        {/* Humedad de Suelo */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-stone-600">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
              <Droplets className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-stone-700">Humedad de Suelo</span>
          </div>
          <div className="mt-3 text-2xl font-bold text-stone-800">-- %</div>
          <span className="text-[11px] text-stone-400 font-medium mt-1">Sin datos de sonda</span>
        </div>

        {/* Temperatura Ambiente */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-stone-600">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Thermometer className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-stone-700">Temperatura</span>
          </div>
          <div className="mt-3 text-2xl font-bold text-stone-800">-- °C</div>
          <span className="text-[11px] text-stone-400 font-medium mt-1">Sin datos térmicos</span>
        </div>

        {/* Radiación Solar */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-stone-600">
            <div className="p-2 rounded-xl bg-yellow-100 text-yellow-900">
              <Sun className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-stone-700">Radiación Solar</span>
          </div>
          <div className="mt-3 text-2xl font-bold text-stone-800">-- lux</div>
          <span className="text-[11px] text-stone-400 font-medium mt-1">Sin datos de luz</span>
        </div>

        {/* Alimentación */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-stone-600">
            <div className="p-2 rounded-xl bg-stone-200 text-stone-800">
              <BatteryMedium className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-stone-700">Batería de Campo</span>
          </div>
          <div className="mt-3 text-2xl font-bold text-stone-800">-- V</div>
          <span className="text-[11px] text-stone-400 font-medium mt-1">Sin datos de voltaje</span>
        </div>

      </div>

      {/* Gráfica Recharts Sutil y Elegante */}
      <div className="mt-5 p-4 rounded-2xl border border-stone-200/70 bg-stone-50/50 relative">
        <div className="text-xs font-semibold text-stone-700 mb-3">Historial de Humedad y Temperatura (Últimas 24 Horas)</div>
        
        <div className="h-44 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="hora" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#15803D" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          {/* Estado vacío claro y sin engaños */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[1px] rounded-xl border border-stone-100">
            <AlertCircle className="h-5 w-5 text-stone-400 mb-1" />
            <span className="text-xs font-medium text-stone-700">Sin lecturas de hardware disponibles</span>
            <span className="text-[11px] text-stone-400 mt-0.5">El gráfico trazará curvas cuando las sondas transmitan datos reales</span>
          </div>
        </div>
      </div>
    </section>
  );
}
