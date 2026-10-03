"use client";

import React from "react";
import { Cpu, Server, Camera, ShieldAlert, CheckCircle2, Radio } from "lucide-react";
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

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 card-elevation">
      {/* Encabezado de la Unidad Física */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-stone-100 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Tlahuicole</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              Unidad Física de Campo
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Agrupación lógica de hardware real en campo (ESP32 + Raspberry Pi + periféricos).
          </p>
        </div>

        {/* Estado Operativo Global Calculado */}
        <div className="flex items-center space-x-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200">
          <Radio className="h-4 w-4 text-stone-400" />
          <span className="text-xs text-stone-500 font-medium">Estado Global:</span>
          <span
            className={`text-xs font-semibold ${
              tlahuicole?.estado_general === "Conectado"
                ? "text-emerald-700"
                : "text-stone-600"
            }`}
          >
            {tlahuicole?.estado_general || "Componente no conectado"}
          </span>
        </div>
      </div>

      {/* Grid de Componentes Reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        
        {/* Tarjeta ESP32 */}
        <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 smooth-transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-900">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">ESP32</h3>
                  <span className="text-xs text-stone-500">Telemetría / Sensores</span>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  esp32Conectado
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {esp32?.estado || "Componente no conectado"}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span className="text-stone-400">Identificador MAC:</span>
                <span className="font-mono font-medium text-stone-800">
                  {esp32?.identificador_hardware || "Sin hardware registrado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Modelo:</span>
                <span className="font-medium text-stone-800">
                  {esp32Conectado ? "ESP32 Físico" : "No configurado"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/60 text-xs text-stone-500">
            {esp32?.mensaje || "Componente no conectado"}
          </div>
        </div>

        {/* Tarjeta Raspberry Pi */}
        <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 smooth-transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-amber-100/70 text-amber-900">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Raspberry Pi</h3>
                  <span className="text-xs text-stone-500">Edge / Procesamiento</span>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  rpiConectada
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {rpi?.estado || "Componente no conectado"}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span className="text-stone-400">Número de Serie:</span>
                <span className="font-mono font-medium text-stone-800">
                  {rpi?.identificador_hardware || "Sin hardware registrado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Rol:</span>
                <span className="font-medium text-stone-800">
                  Visión e Inferencia Edge
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/60 text-xs text-stone-500">
            {rpi?.mensaje || "Componente no conectado"}
          </div>
        </div>

        {/* Tarjeta Cámara */}
        <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 smooth-transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-stone-200 text-stone-700">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Cámara</h3>
                  <span className="text-xs text-stone-500">Captura Óptica</span>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-stone-200 text-stone-600">
                {cam?.estado || "Cámara no configurada"}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span className="text-stone-400">Canal de Ingesta:</span>
                <span className="font-medium text-stone-800">Raspberry Pi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Carga Manual:</span>
                <span className="font-medium text-stone-500">Deshabilitada (Hardware real)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/60 text-xs text-stone-500">
            {cam?.mensaje || "Cámara no configurada"}
          </div>
        </div>

      </div>

      {/* Resumen Operativo */}
      <div className="mt-5 p-3 rounded-xl bg-stone-100/70 text-xs text-stone-600 flex items-center space-x-2">
        <CheckCircle2 className="h-4 w-4 text-stone-400 shrink-0" />
        <span>
          <strong>Diagnóstico:</strong> {tlahuicole?.resumen_operativo || "Sin componentes físicos conectados. Hardware no detectado en campo."}
        </span>
      </div>
    </section>
  );
}
