"use client";

import React from "react";
import { Cpu, Server, Camera, Radio, CheckCircle2 } from "lucide-react";
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
    <section className="neo-box p-6 sm:p-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b-2 border-stone-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Tlahuicole</h2>
            <span className="neo-badge text-xs px-3 py-1 bg-amber-200 text-stone-900 border-stone-900">
              Unidad Física de Campo
            </span>
          </div>
          <p className="text-sm font-medium text-stone-600 mt-1.5">
            Agrupación lógica de hardware real en campo (ESP32 + Raspberry Pi + periféricos).
          </p>
        </div>

        {/* Estado Operativo Global */}
        <div className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl border-2 border-stone-900 bg-stone-100 shadow-[3px_3px_0px_0px_#1C1917]">
          <Radio className="h-4 w-4 text-emerald-800 animate-pulse" />
          <span className="text-xs font-bold text-stone-600 uppercase">Estado:</span>
          <span
            className={`text-xs font-extrabold uppercase ${
              tlahuicole?.estado_general === "Conectado"
                ? "text-emerald-700"
                : "text-stone-800"
            }`}
          >
            {tlahuicole?.estado_general || "Componente no conectado"}
          </span>
        </div>
      </div>

      {/* Grid de Componentes Reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* Tarjeta ESP32 */}
        <div className="p-5 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-200 text-emerald-950 border border-stone-900">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase">ESP32</h3>
                  <span className="text-xs font-medium text-stone-500">Telemetría / Sensores</span>
                </div>
              </div>
              <span
                className={`neo-badge text-[11px] px-2.5 py-0.5 ${
                  esp32Conectado
                    ? "bg-emerald-300 text-emerald-950"
                    : "bg-stone-200 text-stone-700"
                }`}
              >
                {esp32?.estado || "Componente no conectado"}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">MAC Address:</span>
                <span className="font-mono font-bold text-stone-900">
                  {esp32?.identificador_hardware || "Sin hardware registrado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">Modelo:</span>
                <span className="font-bold text-stone-900">
                  {esp32Conectado ? "ESP32 Físico" : "No configurado"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t-2 border-stone-200 text-xs font-semibold text-stone-600">
            {esp32?.mensaje || "Componente no conectado"}
          </div>
        </div>

        {/* Tarjeta Raspberry Pi */}
        <div className="p-5 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-200 text-amber-950 border border-stone-900">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase">Raspberry Pi</h3>
                  <span className="text-xs font-medium text-stone-500">Edge / IA / Ingesta</span>
                </div>
              </div>
              <span
                className={`neo-badge text-[11px] px-2.5 py-0.5 ${
                  rpiConectada
                    ? "bg-emerald-300 text-emerald-950"
                    : "bg-stone-200 text-stone-700"
                }`}
              >
                {rpi?.estado || "Componente no conectado"}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">Serial CPU:</span>
                <span className="font-mono font-bold text-stone-900">
                  {rpi?.identificador_hardware || "Sin hardware registrado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">Rol:</span>
                <span className="font-bold text-stone-900">
                  Procesamiento de Video Edge
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t-2 border-stone-200 text-xs font-semibold text-stone-600">
            {rpi?.mensaje || "Componente no conectado"}
          </div>
        </div>

        {/* Tarjeta Cámara */}
        <div className="p-5 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-stone-200 text-stone-800 border border-stone-900">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase">Cámara</h3>
                  <span className="text-xs font-medium text-stone-500">Captura Óptica</span>
                </div>
              </div>
              <span className="neo-badge text-[11px] px-2.5 py-0.5 bg-stone-200 text-stone-700">
                {cam?.estado || "Cámara no configurada"}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">Transmisión:</span>
                <span className="font-bold text-stone-900">MJPEG en Tiempo Real</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">Carga Manual:</span>
                <span className="font-bold text-red-700">Deshabilitada</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t-2 border-stone-200 text-xs font-semibold text-stone-600">
            {cam?.mensaje || "Cámara no configurada"}
          </div>
        </div>

      </div>

      {/* Resumen Operativo */}
      <div className="mt-6 p-4 rounded-2xl border-2 border-stone-800 bg-stone-100 flex items-center space-x-3 shadow-[2px_2px_0px_0px_#1C1917]">
        <CheckCircle2 className="h-5 w-5 text-emerald-800 shrink-0" />
        <span className="text-xs font-bold text-stone-800">
          DIAGNÓSTICO: {tlahuicole?.resumen_operativo || "Sin componentes físicos conectados. Hardware no detectado en campo."}
        </span>
      </div>
    </section>
  );
}
