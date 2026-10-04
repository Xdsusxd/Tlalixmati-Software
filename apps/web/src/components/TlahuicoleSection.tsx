"use client";

import React from "react";
import { Cpu, Server, Camera, CheckCircle2, CircleDashed } from "lucide-react";
import { TlahuicoleEstado } from "@/lib/api";

interface TlahuicoleSectionProps {
  tlahuicole: TlahuicoleEstado | null;
}

export function TlahuicoleSection({ tlahuicole }: TlahuicoleSectionProps) {
  const esp32 = tlahuicole?.esp32;
  const rpi = tlahuicole?.raspberry;
  const cam = tlahuicole?.camara;

  const esp32Conectado = esp32?.estado === "Conectado";
  const rpiConectada = rpi?.estado === "Conectado";
  const camConectada = cam?.estado === "Conectado";
  const sistemaActivo = tlahuicole?.estado_general === "Conectado";

  const hardwareNodes = [
    {
      icon: <Cpu className="w-4 h-4" />,
      titulo: "Sensores de Suelo y Ambiente",
      nodo: "Módulo Microcontrolador ESP32",
      conectado: esp32Conectado,
      estadoTexto: esp32Conectado ? "Conectado" : "No detectado",
      descripcion: "Adquisición de humedad de tierra, temperatura y radiación lumínica.",
      identificador: esp32?.identificador_hardware,
      tipoId: "MAC",
    },
    {
      icon: <Server className="w-4 h-4" />,
      titulo: "Nodo Edge de Procesamiento",
      nodo: "Unidad Raspberry Pi",
      conectado: rpiConectada,
      estadoTexto: rpiConectada ? "Conectado" : "No detectado",
      descripcion: "Control de captura óptica y retransmisión local hacia la plataforma.",
      identificador: rpi?.identificador_hardware,
      tipoId: "Serial",
    },
    {
      icon: <Camera className="w-4 h-4" />,
      titulo: "Sensor Óptico de Campo",
      nodo: "Cámara de Monitoreo",
      conectado: camConectada,
      estadoTexto: camConectada ? "Transmitiendo" : "En espera",
      descripcion: "Captura de fotogramas periódicos para el pipeline de visión e inferencia.",
      identificador: null,
      tipoId: null,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[rgba(24,24,27,0.07)] p-5 sm:p-6 shadow-xs">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[rgba(24,24,27,0.06)] gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-[#18181b] font-display">
              Topología de Hardware (Tlahuicole)
            </h3>
            <span
              className={`pill-status ${
                sistemaActivo ? "pill-ok" : "pill-neutral"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sistemaActivo ? "bg-[#15803d]" : "bg-[#a1a1aa]"
                }`}
              />
              {sistemaActivo ? "Sistema Operativo" : "Hardware en Espera"}
            </span>
          </div>
          <p className="text-xs text-[#71717a] mt-0.5">
            Estado de enlace e identidad de los componentes físicos desplegados en terreno.
          </p>
        </div>

        <div className="text-[11px] font-mono text-[#a1a1aa] self-start sm:self-auto">
          {tlahuicole?.resumen_operativo || "Protocolo de bus activo"}
        </div>
      </div>

      {/* Lista de Nodos Físicos */}
      <div className="divide-y divide-[rgba(24,24,27,0.06)]">
        {hardwareNodes.map((item, idx) => (
          <div
            key={idx}
            className="py-3.5 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  item.conectado
                    ? "bg-[#18181b] text-white"
                    : "bg-[#f4f4f5] text-[#71717a]"
                }`}
              >
                {item.icon}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-semibold text-[#18181b]">
                    {item.titulo}
                  </h4>
                  <span className="text-[11px] text-[#71717a]">
                    · {item.nodo}
                  </span>
                </div>
                <p className="text-[11px] text-[#71717a] mt-0.5 leading-relaxed">
                  {item.descripcion}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              {item.identificador ? (
                <span className="font-code text-[11px] px-2 py-0.5 rounded bg-[#f4f4f5] border border-[rgba(24,24,27,0.06)] text-[#52525b]">
                  {item.tipoId}: {item.identificador}
                </span>
              ) : null}

              <span
                className={`pill-status ${
                  item.conectado ? "pill-ok" : "pill-neutral"
                }`}
              >
                {item.conectado ? (
                  <CheckCircle2 className="w-3 h-3 text-[#15803d]" />
                ) : (
                  <CircleDashed className="w-3 h-3 text-[#a1a1aa]" />
                )}
                <span>{item.estadoTexto}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
