"use client";

import React, { useState } from "react";
import { Camera, Radio, RefreshCw, Scan, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface LiveCameraSectionProps {
  analisisTexto: string;
}

export function LiveCameraSection({ analisisTexto }: LiveCameraSectionProps) {
  const [streamKey, setStreamKey] = useState<number>(Date.now());

  const recargarStream = () => {
    setStreamKey(Date.now());
  };

  const streamUrl = `${api.getStreamUrl()}?t=${streamKey}`;

  return (
    <section className="neo-box p-6 sm:p-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b-2 border-stone-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              Cámara en Tiempo Real
            </h2>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border-2 border-stone-900 bg-red-100 shadow-[2px_2px_0px_0px_#1C1917]">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-black text-red-900 uppercase">En Vivo</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-stone-600 mt-1.5">
            Transmisión directa de video capturado por la cámara física en campo.
          </p>
        </div>

        <button
          onClick={recargarStream}
          className="neo-button flex items-center space-x-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-black uppercase self-start sm:self-auto"
          title="Reconectar o refrescar transmisión"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refrescar Stream</span>
        </button>
      </div>

      {/* Visor de Video en Vivo Permanente */}
      <div className="mt-6">
        <div className="relative rounded-3xl overflow-hidden border-2 border-stone-900 bg-stone-950 shadow-[4px_4px_0px_0px_#1C1917] aspect-video max-h-[500px] w-full flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={streamKey}
            src={streamUrl}
            alt="Transmisión en vivo de Tlahuicole"
            className="w-full h-full object-contain"
          />

          {/* HUD de Telemetría de Cámara */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-stone-950/85 border border-stone-700 text-white text-xs font-mono font-bold shadow-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STREAM: ACTIVO</span>
          </div>

          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-stone-950/85 border border-stone-700 text-stone-200 text-xs font-mono font-bold shadow-md">
            RESOLUCIÓN: 640x360 | 10 FPS
          </div>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-600 gap-2">
          <span className="font-semibold text-stone-700">
            * Transmisión MJPEG directa desde el hardware de captura.
          </span>
          <span className="neo-badge text-[10px] px-2.5 py-0.5 bg-stone-200 text-stone-800">
            Carga manual deshabilitada (Solo hardware real)
          </span>
        </div>
      </div>

      {/* Estado de lo que se Entrena (IA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-stone-800">
        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 flex items-center justify-between shadow-[2px_2px_0px_0px_#1C1917]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-200 border border-stone-900 text-emerald-950">
              <Scan className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900 uppercase">YOLOv8 (Detección)</h4>
              <p className="text-[11px] text-stone-500 font-medium">Detección de plantas y hojas</p>
            </div>
          </div>
          <span className="neo-badge text-[10px] px-2 py-0.5 bg-stone-200 text-stone-800">
            Sin dataset
          </span>
        </div>

        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 flex items-center justify-between shadow-[2px_2px_0px_0px_#1C1917]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-200 border border-stone-900 text-amber-950">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900 uppercase">PyTorch (Anomalías)</h4>
              <p className="text-[11px] text-stone-500 font-medium">Detección de patologías y estrés</p>
            </div>
          </div>
          <span className="neo-badge text-[10px] px-2 py-0.5 bg-stone-200 text-stone-800">
            Sin entrenar
          </span>
        </div>
      </div>
    </section>
  );
}
