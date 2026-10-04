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
      {/* ── Franja de KPIs — Números Grandes (Space Grotesk) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 py-2">

        {/* Métrica 1: Humedad de Suelo */}
        <div className="card-mono p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">Humedad Suelo</span>
            <div className="w-8 h-8 rounded-xl bg-[#101012] border border-[#252528] flex items-center justify-center text-[#94a3b8]">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-numeral-bold">
              {hasHum ? humActual!.toFixed(1) : "--"}
            </span>
            <span className="text-sm font-semibold text-[#64748b]">%</span>
          </div>
          <span className="font-data text-[0.65rem] font-semibold text-[#64748b] mt-2">
            {hasHum ? "Sonda de suelo activa" : "Sin lectura de sonda"}
          </span>
        </div>

        {/* Métrica 2: Temperatura */}
        <div className="card-mono p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">Temperatura</span>
            <div className="w-8 h-8 rounded-xl bg-[#101012] border border-[#252528] flex items-center justify-center text-[#94a3b8]">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-numeral-bold">
              {hasTemp ? tempActual!.toFixed(1) : "--"}
            </span>
            <span className="text-sm font-semibold text-[#64748b]">°C</span>
          </div>
          <span className="font-data text-[0.65rem] font-semibold text-[#64748b] mt-2">
            {hasTemp ? "Termómetro ambiental" : "Sin lectura térmica"}
          </span>
        </div>

        {/* Métrica 3: Radiación Solar */}
        <div className="card-mono p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">Radiación Solar</span>
            <div className="w-8 h-8 rounded-xl bg-[#101012] border border-[#252528] flex items-center justify-center text-[#94a3b8]">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-numeral-bold">
              {hasRad ? radActual!.toFixed(0) : "--"}
            </span>
            <span className="text-xs font-semibold text-[#64748b]">W/m²</span>
          </div>
          <span className="font-data text-[0.65rem] font-semibold text-[#64748b] mt-2">
            {hasRad ? "Fotocelda operativa" : "Sin medición solar"}
          </span>
        </div>

        {/* Métrica 4: Batería */}
        <div className="card-mono p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">Batería Nodo</span>
            <div className="w-8 h-8 rounded-xl bg-[#101012] border border-[#252528] flex items-center justify-center text-[#94a3b8]">
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-numeral-bold">
              {hasBat ? batActual!.toFixed(2) : "--"}
            </span>
            <span className="text-sm font-semibold text-[#64748b]">V</span>
          </div>
          <span className="font-data text-[0.65rem] font-semibold text-[#64748b] mt-2">
            {hasBat ? (batActual! > 3.6 ? "Carga nominal" : "Aviso de recarga") : "Sin monitoreo"}
          </span>
        </div>
      </div>

      {/* ── Gráfica de Tendencia (Recharts) ── */}
      <div className="card-mono p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#252528] gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold tracking-[-0.03em] heading-chunky text-[#e2e8f0] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#94a3b8]" />
              Evolución de Suelo y Clima (24h)
            </h3>
            <p className="text-xs font-medium text-[#64748b] mt-0.5">
              Curvas continuas de humedad de tierra y temperatura registradas por el microcontrolador.
            </p>
          </div>

          <div className="font-data text-[0.65rem] font-semibold text-[#64748b] bg-[#101012] px-3 py-1.5 rounded-full border border-[#252528] self-start sm:self-auto">
            {telemetria?.resumen_sensores || sensoresTexto || "En espera de lecturas periódicas"}
          </div>
        </div>

        <div className={`${compacto ? "h-52" : "h-64"} w-full relative pt-2`}>
          {!tieneDatos && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl z-10 text-xs bg-[#161618]/90 backdrop-blur-sm">
              <AlertCircle className="w-6 h-6 text-[#475569] mb-1.5" />
              <p className="font-bold text-[#e2e8f0] heading-chunky">Sin lecturas históricas</p>
              <p className="text-xs font-medium text-[#64748b]">
                La curva se generará al registrar lecturas continuas del ESP32.
              </p>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252528" vertical={false} />
              <XAxis
                dataKey="hora"
                stroke="#475569"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d0d0f",
                  borderColor: "#32323a",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
                  padding: "8px 14px",
                  fontWeight: 600,
                }}
                labelStyle={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "4px" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", fontWeight: 600, paddingTop: "12px", color: "#94a3b8" }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="humedad"
                name="Humedad Suelo (%)"
                stroke="#cbd5e1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#cbd5e1" }}
              />
              <Line
                type="monotone"
                dataKey="temperatura"
                name="Temperatura (°C)"
                stroke="#475569"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                activeDot={{ r: 5, fill: "#64748b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
