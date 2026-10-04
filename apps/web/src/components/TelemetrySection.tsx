"use client";

import React from "react";
import { Droplets, Thermometer, Sun, BatteryMedium, AlertCircle, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TelemetriaActual, PuntoHistorial } from "@/lib/api";

interface TelemetrySectionProps {
  sensoresTexto?: string;
  telemetria?: TelemetriaActual | null;
  historial?: PuntoHistorial[];
  compacto?: boolean;
}

export function TelemetrySection({
  sensoresTexto,
  telemetria,
  historial = [],
  compacto = false,
}: TelemetrySectionProps) {
  const tieneDatos = historial && historial.length > 0;

  const datosGrafica = tieneDatos
    ? historial.map((p) => ({
        hora: p.fecha_hora,
        humedad: p.humedad_suelo,
        temperatura: p.temperatura,
      }))
    : [
        { hora: "00:00", humedad: null, temperatura: null },
        { hora: "06:00", humedad: null, temperatura: null },
        { hora: "12:00", humedad: null, temperatura: null },
        { hora: "18:00", humedad: null, temperatura: null },
      ];

  const humActual = telemetria?.humedad_suelo;
  const tempActual = telemetria?.temperatura;
  const radActual = telemetria?.radiacion;
  const batActual = telemetria?.bateria;

  const hasHum = humActual !== undefined && humActual !== null;
  const hasTemp = tempActual !== undefined && tempActual !== null;
  const hasRad = radActual !== undefined && radActual !== null;
  const hasBat = batActual !== undefined && batActual !== null;

  return (
    <div className="space-y-6">
      {/* ── Franja de KPIs Tipográficos Gruesos y Amigables (Blanco, Negro y Gris) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-2">
        
        {/* Métrica 1: Humedad de Suelo */}
        <div className="card-mono p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">Humedad Suelo</span>
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[#111111]">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-numeral-bold text-[#111111]">
              {hasHum ? humActual!.toFixed(1) : "--"}
            </span>
            <span className="text-sm font-bold text-gray-400">%</span>
          </div>
          <span className="text-xs font-semibold text-gray-500 mt-2">
            {hasHum ? "Sonda de suelo activa" : "Sin lectura de sonda"}
          </span>
        </div>

        {/* Métrica 2: Temperatura */}
        <div className="card-mono p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">Temperatura</span>
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[#111111]">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-numeral-bold text-[#111111]">
              {hasTemp ? tempActual!.toFixed(1) : "--"}
            </span>
            <span className="text-sm font-bold text-gray-400">°C</span>
          </div>
          <span className="text-xs font-semibold text-gray-500 mt-2">
            {hasTemp ? "Termómetro de campo" : "Sin lectura térmica"}
          </span>
        </div>

        {/* Métrica 3: Radiación / Sol */}
        <div className="card-mono p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">Radiación Solar</span>
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[#111111]">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-numeral-bold text-[#111111]">
              {hasRad ? radActual!.toFixed(0) : "--"}
            </span>
            <span className="text-xs font-bold text-gray-400">W/m²</span>
          </div>
          <span className="text-xs font-semibold text-gray-500 mt-2">
            {hasRad ? "Fotocelda en servicio" : "Sin medición solar"}
          </span>
        </div>

        {/* Métrica 4: Batería */}
        <div className="card-mono p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">Batería Nodo</span>
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[#111111]">
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-numeral-bold text-[#111111]">
              {hasBat ? batActual!.toFixed(2) : "--"}
            </span>
            <span className="text-sm font-bold text-gray-400">V</span>
          </div>
          <span className="text-xs font-semibold text-gray-500 mt-2">
            {hasBat ? (batActual! > 3.6 ? "Carga nominal" : "Aviso de recarga") : "Sin monitoreo"}
          </span>
        </div>
      </div>

      {/* ── Gráfica de Tendencia Monocromática (Recharts) ── */}
      <div className="card-mono p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 gap-2 mb-4">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-[#111111] heading-chunky flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#111111]" />
              Evolución de Suelo y Clima (24h)
            </h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              Curvas continuas de humedad de tierra y temperatura registradas por el microcontrolador.
            </p>
          </div>
          
          <div className="text-xs font-bold font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 self-start sm:self-auto">
            {telemetria?.resumen_sensores || sensoresTexto || "En espera de lecturas periódicas"}
          </div>
        </div>

        <div className={`${compacto ? "h-52" : "h-64"} w-full relative pt-2`}>
          {!tieneDatos && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl z-10 text-xs bg-white/85 backdrop-blur-2xs">
              <AlertCircle className="w-6 h-6 text-gray-400 mb-1.5" />
              <p className="font-extrabold text-[#111111]">Sin lecturas históricas</p>
              <p className="text-xs font-medium text-gray-500">
                La curva se generará al registrar lecturas continuas del ESP32.
              </p>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
              <XAxis
                dataKey="hora"
                stroke="#a1a1aa"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#a1a1aa"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111111",
                  borderColor: "#111111",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#ffffff",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  padding: "8px 14px",
                  fontWeight: 600,
                }}
                labelStyle={{ fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", fontWeight: 700, paddingTop: "12px", color: "#111111" }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="humedad"
                name="Humedad Suelo (%)"
                stroke="#111111"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#111111" }}
              />
              <Line
                type="monotone"
                dataKey="temperatura"
                name="Temperatura (°C)"
                stroke="#71717a"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                activeDot={{ r: 5, fill: "#71717a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
