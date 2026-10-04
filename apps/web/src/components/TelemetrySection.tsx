"use client";

import React from "react";
import { Thermometer, Droplets, Sun, BatteryMedium, AlertCircle, Activity } from "lucide-react";
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
}

const BLUE = "#0069e9";
const BLUE_DARK = "#055bd3";
const BLUE_LIGHT = "rgba(0, 105, 233, 0.08)";
const BLUE_BORDER = "rgba(0, 105, 233, 0.22)";

function MetricCard({
  icon,
  label,
  value,
  sub,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  active: boolean;
}) {
  return (
    <div
      className="p-4 rounded-xl flex flex-col justify-between gap-2 border bg-white transition-colors"
      style={{
        borderColor: active ? BLUE_BORDER : "#e5e7eb",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="p-2 rounded-lg"
          style={{
            background: active ? BLUE_LIGHT : "#f3f4f6",
            border: `1px solid ${active ? BLUE_BORDER : "#e5e7eb"}`,
            color: active ? BLUE : "#6b7280",
          }}
        >
          {icon}
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: active ? BLUE_DARK : "#6b7280" }}
        >
          {label}
        </span>
      </div>

      <div className="text-2xl font-bold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>
        {value}
      </div>

      <span className="text-[11px] font-medium text-gray-400">
        {sub}
      </span>
    </div>
  );
}

export function TelemetrySection({
  sensoresTexto,
  telemetria,
  historial = [],
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

  const hasHum  = humActual  !== undefined && humActual  !== null;
  const hasTemp = tempActual !== undefined && tempActual !== null;
  const hasRad  = radActual  !== undefined && radActual  !== null;
  const hasBat  = batActual  !== undefined && batActual  !== null;

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
              Condiciones del Terreno y Clima
            </h2>
            <span className="badge-blue">
              <Activity className="h-3 w-3" />
              Sondas de Campo
            </span>
          </div>
          <p className="text-xs mt-1 text-gray-500">
            Parámetros ambientales leídos directamente por las sondas de suelo y microcontrolador ESP32.
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full font-medium self-start sm:self-auto border border-gray-200 bg-gray-50 text-gray-600">
          {telemetria?.resumen_sensores || sensoresTexto || "Sin datos de sensores"}
        </span>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Droplets className="h-4 w-4" />}
          label="Humedad de Suelo"
          value={hasHum ? `${humActual!.toFixed(1)} %` : "-- %"}
          sub={hasHum ? "Sonda de suelo activa" : "Sin datos de sonda"}
          active={hasHum}
        />
        <MetricCard
          icon={<Thermometer className="h-4 w-4" />}
          label="Temperatura"
          value={hasTemp ? `${tempActual!.toFixed(1)} °C` : "-- °C"}
          sub={hasTemp ? "Termómetro ambiental activo" : "Sin datos térmicos"}
          active={hasTemp}
        />
        <MetricCard
          icon={<Sun className="h-4 w-4" />}
          label="Luminosidad / Sol"
          value={hasRad ? `${radActual!.toFixed(0)} W/m²` : "-- W/m²"}
          sub={hasRad ? "Fotocelda operativa" : "Sin lectura lumínica"}
          active={hasRad}
        />
        <MetricCard
          icon={<BatteryMedium className="h-4 w-4" />}
          label="Batería de Campo"
          value={hasBat ? `${batActual!.toFixed(2)} V` : "-- V"}
          sub={
            hasBat
              ? batActual! > 3.6
                ? "Nivel de carga óptimo"
                : "Aviso de recarga"
              : "Sin monitoreo de voltaje"
          }
          active={hasBat}
        />
      </div>

      {/* Gráfica de Tendencia */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Evolución de Humedad de Suelo y Temperatura
          </h3>
          <span className="text-[11px] text-gray-400">
            {tieneDatos ? "Registro de últimas 24 horas" : "Aguardando lecturas periódicas"}
          </span>
        </div>

        <div className="h-56 w-full rounded-xl p-3 pt-5 relative bg-gray-50 border border-gray-200">
          {!tieneDatos && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10 text-xs space-y-1 bg-white/80 backdrop-blur-2xs">
              <AlertCircle className="h-5 w-5 text-gray-400" />
              <p className="font-semibold text-gray-700">Sin historial registrado</p>
              <p className="text-[11px] text-gray-400">
                Las curvas se generarán en cuanto el ESP32 envíe lecturas continuas.
              </p>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="hora" stroke="#9ca3af" fontSize={10} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  color: "#111827",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px", color: "#6b7280" }} />
              <Line
                type="monotone"
                dataKey="humedad"
                name="Humedad Suelo (%)"
                stroke={BLUE}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: BLUE }}
              />
              <Line
                type="monotone"
                dataKey="temperatura"
                name="Temperatura (°C)"
                stroke="#64748b"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 4, fill: "#64748b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
