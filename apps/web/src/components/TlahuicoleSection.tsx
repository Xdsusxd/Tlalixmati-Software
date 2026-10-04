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
      icon: <Cpu className="w-5 h-5" />,
      titulo: "Sensores de Suelo y Ambiente",
      nodo: "Módulo Microcontrolador ESP32",
      conectado: esp32Conectado,
      estadoTexto: esp32Conectado ? "Conectado" : "No detectado",
      descripcion: "Adquisición de humedad de tierra, temperatura y radiación lumínica.",
      identificador: esp32?.identificador_hardware,
      tipoId: "MAC",
    },
    {
      icon: <Server className="w-5 h-5" />,
      titulo: "Nodo Edge de Procesamiento",
      nodo: "Unidad Raspberry Pi",
      conectado: rpiConectada,
      estadoTexto: rpiConectada ? "Conectado" : "No detectado",
      descripcion: "Control de captura óptica y retransmisión local hacia la plataforma.",
      identificador: rpi?.identificador_hardware,
      tipoId: "Serial",
    },
    {
      icon: <Camera className="w-5 h-5" />,
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
    <div className="card-mono p-6 sm:p-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#27272a] gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold tracking-tight text-white heading-chunky">
              Equipo de Campo (Tlahuicole)
            </h3>
            <span
              className={sistemaActivo ? "pill-mono-active" : "pill-mono-subtle"}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sistemaActivo ? "bg-white animate-pulse" : "bg-gray-600"
                }`}
              />
              {sistemaActivo ? "Sistema Operativo" : "Hardware en Espera"}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Supervisión física de los nodos de campo encargados de adquirir datos y transmitir video.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-gray-400 bg-[#121215] px-3 py-1 rounded-full border border-[#27272a] self-start sm:self-auto">
          {tlahuicole?.resumen_operativo || "Protocolo de bus activo"}
        </div>
      </div>

      {/* Lista de Nodos Físicos */}
      <div className="divide-y divide-[#27272a]">
        {hardwareNodes.map((item, idx) => (
          <div
            key={idx}
            className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                  item.conectado
                    ? "bg-[#000000] border-[#2e2e33] text-white shadow-xs"
                    : "bg-[#121215] border-[#27272a] text-gray-500"
                }`}
              >
                {item.icon}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-white">
                    {item.titulo}
                  </h4>
                  <span className="text-xs font-semibold text-gray-400">
                    · {item.nodo}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed font-medium">
                  {item.descripcion}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              {item.identificador ? (
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#121215] border border-[#27272a] text-white">
                  {item.tipoId}: {item.identificador}
                </span>
              ) : null}

              <span
                className={item.conectado ? "pill-mono-active" : "pill-mono-subtle"}
              >
                {item.conectado ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <CircleDashed className="w-3.5 h-3.5 text-gray-500" />
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
