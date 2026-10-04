"use client";

import React from "react";
import { Cpu, Server, Camera } from "lucide-react";
import { TlahuicoleEstado } from "@/lib/api";

interface TlahuicoleSectionProps {
  tlahuicole: TlahuicoleEstado | null;
}

const BLUE = "#0069e9";
const BLUE_DARK = "#055bd3";
const BLUE_LIGHT = "rgba(0, 105, 233, 0.08)";
const BLUE_BORDER = "rgba(0, 105, 233, 0.22)";

function ComponentCard({
  icon,
  titulo,
  subtitulo,
  estado,
  conectado,
  descripcion,
  footerIzq,
  footerDer,
}: {
  icon: React.ReactNode;
  titulo: string;
  subtitulo: string;
  estado: string;
  conectado: boolean;
  descripcion: string;
  footerIzq: string;
  footerDer?: React.ReactNode;
}) {
  return (
    <div
      className="p-4 rounded-xl flex flex-col justify-between gap-3 border transition-colors bg-white"
      style={{
        borderColor: conectado ? BLUE_BORDER : "#e5e7eb",
      }}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-lg"
              style={{
                background: conectado ? BLUE_LIGHT : "#f3f4f6",
                border: `1px solid ${conectado ? BLUE_BORDER : "#e5e7eb"}`,
                color: conectado ? BLUE : "#6b7280",
              }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{titulo}</h3>
              <span
                className="text-[11px] font-medium"
                style={{ color: conectado ? BLUE_DARK : "#6b7280" }}
              >
                {subtitulo}
              </span>
            </div>
          </div>

          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              background: conectado ? BLUE_LIGHT : "#f3f4f6",
              color: conectado ? BLUE_DARK : "#6b7280",
              borderColor: conectado ? BLUE_BORDER : "#e5e7eb",
            }}
          >
            {estado}
          </span>
        </div>

        <p className="text-xs mt-3 leading-relaxed text-gray-600">
          {descripcion}
        </p>
      </div>

      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-medium text-gray-500">
        <span>{footerIzq}</span>
        {footerDer}
      </div>
    </div>
  );
}

export function TlahuicoleSection({ tlahuicole }: TlahuicoleSectionProps) {
  const esp32 = tlahuicole?.esp32;
  const rpi = tlahuicole?.raspberry;
  const cam = tlahuicole?.camara;

  const esp32Conectado = esp32?.estado === "Conectado";
  const rpiConectada = rpi?.estado === "Conectado";
  const camConectada = cam?.estado === "Conectado";
  const sistemaActivo = tlahuicole?.estado_general === "Conectado";

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
              Equipo de Campo (Tlahuicole)
            </h2>
            <span className="badge-blue">Instalación Agronómica</span>
          </div>
          <p className="text-xs mt-1 text-gray-500">
            Supervisión del equipamiento físico encargado de medir el terreno y transmitir imágenes.
          </p>
        </div>

        {/* Estado General */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto border"
          style={{
            background: sistemaActivo ? BLUE_LIGHT : "#f3f4f6",
            borderColor: sistemaActivo ? BLUE_BORDER : "#e5e7eb",
            color: sistemaActivo ? BLUE_DARK : "#6b7280",
          }}
        >
          <span
            className={`h-2 w-2 rounded-full ${sistemaActivo ? "animate-pulse" : ""}`}
            style={{ background: sistemaActivo ? BLUE : "#9ca3af" }}
          />
          <span>{sistemaActivo ? "Operativo" : "En espera de hardware"}</span>
        </div>
      </div>

      {/* Grid de Equipamiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard
          icon={<Cpu className="h-4 w-4" />}
          titulo="Sensores de Suelo"
          subtitulo="Módulo ESP32"
          estado={esp32Conectado ? "Conectado" : "No detectado"}
          conectado={esp32Conectado}
          descripcion="Registra humedad de tierra, temperatura ambiental y luminosidad en el cultivo."
          footerIzq={esp32Conectado ? "Transmitiendo lecturas" : "Esperando conexión del microcontrolador"}
          footerDer={
            esp32?.identificador_hardware ? (
              <span className="mono-data" title="MAC de hardware real">
                MAC: {esp32.identificador_hardware}
              </span>
            ) : undefined
          }
        />

        <ComponentCard
          icon={<Server className="h-4 w-4" />}
          titulo="Módulo Edge"
          subtitulo="Raspberry Pi"
          estado={rpiConectada ? "Conectado" : "No detectado"}
          conectado={rpiConectada}
          descripcion="Administra la cámara física y reenvía los datos del cultivo a la plataforma."
          footerIzq={rpiConectada ? "Servicio Edge activo" : "Esperando enlace de la unidad edge"}
          footerDer={
            rpi?.identificador_hardware ? (
              <span className="mono-data" title="Serial de hardware real">
                Serial: {rpi.identificador_hardware}
              </span>
            ) : undefined
          }
        />

        <ComponentCard
          icon={<Camera className="h-4 w-4" />}
          titulo="Cámara de Monitoreo"
          subtitulo="Óptica de Campo"
          estado={camConectada ? "Transmitiendo" : "En espera"}
          conectado={camConectada}
          descripcion="Captura fotos y video en directo para seguimiento visual y detección de anomalías."
          footerIzq={camConectada ? "Óptica activa" : "Sin hardware conectado"}
          footerDer={
            <span className="text-gray-400 text-[10px]">Captura física</span>
          }
        />
      </div>
    </section>
  );
}
