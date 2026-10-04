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
      {/* ── Franja Tipográfica de Métricas Clave (Editorial KPI Row) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-2">
        
        {/* Métrica 1: Humedad de Suelo */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets className="w-3.5 h-3.5 text-[#71717a]" />
            <span className="micro-label">Humedad Suelo</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-numeral text-[#18181b]">
              {hasHum ? humActual!.toFixed(1) : "--"}
            </span>
            <span className="text-xs font-mono text-[#a1a1aa]">%</span>
          </div>
          <span className="text-[11px] text-[#71717a] mt-1 font-medium">
            {hasHum ? "Sonda capacitiva activa" : "Sin señal de sensor"}
          </span>
        </div>

        {/* Métrica 2: Temperatura */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-[#71717a]" />
            <span className="micro-label">Temperatura</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-numeral text-[#18181b]">
              {hasTemp ? tempActual!.toFixed(1) : "--"}
            </span>
            <span className="text-xs font-mono text-[#a1a1aa]">°C</span>
          </div>
          <span className="text-[11px] text-[#71717a] mt-1 font-medium">
            {hasTemp ? "Termometría ambiental" : "Sin lectura térmica"}
          </span>
        </div>

        {/* Métrica 3: Radiación / Luz */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <Sun className="w-3.5 h-3.5 text-[#71717a]" />
            <span className="micro-label">Radiación Solar</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-numeral text-[#18181b]">
              {hasRad ? radActual!.toFixed(0) : "--"}
            </span>
            <span className="text-xs font-mono text-[#a1a1aa]">W/m²</span>
          </div>
          <span className="text-[11px] text-[#71717a] mt-1 font-medium">
            {hasRad ? "Fotocelda en servicio" : "Sin medición lumínica"}
          </span>
        </div>

        {/* Métrica 4: Batería */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <BatteryMedium className="w-3.5 h-3.5 text-[#71717a]" />
            <span className="micro-label">Batería de Campo</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-numeral text-[#18181b]">
              {hasBat ? batActual!.toFixed(2) : "--"}
            </span>
            <span className="text-xs font-mono text-[#a1a1aa]">V</span>
          </div>
          <span className="text-[11px] text-[#71717a] mt-1 font-medium">
            {hasBat ? (batActual! > 3.6 ? "Carga nominal" : "Nivel bajo") : "Sin monitoreo"}
          </span>
        </div>
      </div>

      {/* ── Gráfica de Tendencia Temporal (Recharts minimalista) ── */}
      <div className="bg-white rounded-2xl border border-[rgba(24,24,27,0.07)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[rgba(24,24,27,0.06)] gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#18181b] font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#71717a]" />
              Evolución de Suelo y Microclima (24h)
            </h3>
            <p className="text-xs text-[#71717a] mt-0.5">
              Curvas continuas de humedad relativa en sustrato y temperatura ambiental.
            </p>
          </div>
          
          <div className="text-[11px] font-mono text-[#a1a1aa] self-start sm:self-auto">
            {telemetria?.resumen_sensores || sensoresTexto || "En espera de telemetría periódica"}
          </div>
        </div>

        <div className={`${compacto ? "h-48" : "h-64"} w-full relative pt-2`}>
          {!tieneDatos && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10 text-xs bg-white/80 backdrop-blur-2xs">
              <AlertCircle className="w-5 h-5 text-[#a1a1aa] mb-1.5" />
              <p className="font-semibold text-[#18181b]">Sin lecturas históricas</p>
              <p className="text-[11px] text-[#71717a]">
                La curva se generará al registrar lecturas continuas del microcontrolador ESP32.
              </p>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#f0f0f2" vertical={false} />
              <XAxis
                dataKey="hora"
                stroke="#a1a1aa"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#a1a1aa"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "rgba(24,24,27,0.08)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#18181b",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  padding: "8px 12px",
                }}
                labelStyle={{ fontWeight: 600, color: "#18181b", marginBottom: "4px" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px", color: "#71717a" }}
                iconType="circle"
                iconSize={7}
              />
              <Line
                type="monotone"
                dataKey="humedad"
                name="Humedad Suelo (%)"
                stroke="#18181b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#18181b" }}
              />
              <Line
                type="monotone"
                dataKey="temperatura"
                name="Temperatura (°C)"
                stroke="#71717a"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 4, fill: "#71717a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
