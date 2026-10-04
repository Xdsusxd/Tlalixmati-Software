"use client";

import React from "react";
import { Cpu, Server, Camera, ShieldCheck, CheckCircle2 } from "lucide-react";
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

  return (
    <section className="organic-card p-6 sm:p-7">
      {/* Encabezado sin jerga de ingeniería */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Equipo de Campo (Tlahuicole)</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">
              Instalación Agronómica
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Supervisión del equipamiento físico encargado de medir el terreno y transmitir imágenes.
          </p>
        </div>

        {/* Estado Operativo Simple */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-xs self-start sm:self-auto">
          <span
            className={`h-2 w-2 rounded-full ${
              tlahuicole?.estado_general === "Conectado"
                ? "bg-emerald-500"
                : "bg-amber-400"
            }`}
          />
          <span className="text-stone-600 font-medium">Estado General:</span>
          <span className="font-semibold text-stone-900">
            {tlahuicole?.estado_general === "Conectado" ? "Operativo" : "En espera de hardware"}
          </span>
        </div>
      </div>

      {/* Grid de Equipamiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        
        {/* Sensores de Terreno (ESP32) */}
        <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-900">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Sensores de Suelo</h3>
                  <span className="text-[11px] text-stone-500">Módulo ESP32</span>
                </div>
              </div>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                  esp32Conectado
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-200/80 text-stone-600"
                }`}
              >
                {esp32Conectado ? "Conectado" : "No detectado"}
              </span>
            </div>

            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Registra humedad de tierra, temperatura ambiental y luminosidad en el cultivo.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>{esp32Conectado ? "Transmitiendo lecturas" : "Esperando conexión del microcontrolador"}</span>
            {esp32?.identificador_hardware && (
              <span className="font-mono text-[10px] bg-stone-200/70 px-1.5 py-0.5 rounded text-stone-700" title="MAC de hardware real">
                MAC: {esp32.identificador_hardware}
              </span>
            )}
          </div>
        </div>

        {/* Procesamiento y Enlace (Raspberry Pi) */}
        <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-100/80 text-amber-900">
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Módulo de Procesamiento</h3>
                  <span className="text-[11px] text-stone-500">Raspberry Pi</span>
                </div>
              </div>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                  rpiConectada
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-200/80 text-stone-600"
                }`}
              >
                {rpiConectada ? "Conectado" : "No detectado"}
              </span>
            </div>

            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Administra la cámara física y reenvía los datos del cultivo a la plataforma.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>{rpiConectada ? "Servicio Edge activo" : "Esperando enlace de la unidad edge"}</span>
            {rpi?.identificador_hardware && (
              <span className="font-mono text-[10px] bg-stone-200/70 px-1.5 py-0.5 rounded text-stone-700" title="Serial de hardware real">
                Serial: {rpi.identificador_hardware}
              </span>
            )}
          </div>
        </div>

        {/* Cámara Óptica */}
        <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-stone-200/80 text-stone-700">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Cámara de Monitoreo</h3>
                  <span className="text-[11px] text-stone-500">Óptica de Campo</span>
                </div>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${cam?.estado === "Conectado" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200/80 text-stone-600"}`}>
                {cam?.estado === "Conectado" ? "Transmitiendo" : "En espera"}
              </span>
            </div>

            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Captura fotos y video en directo para seguimiento visual y detección de anomalías.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>{cam?.estado === "Conectado" ? "Óptica activa" : "Sin hardware conectado"}</span>
            <span className="text-[10px] text-stone-400">Captura física</span>
          </div>
        </div>

      </div>
    </section>
  );
}
