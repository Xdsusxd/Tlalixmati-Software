"use client";

import React, { useState } from "react";
import { Camera, Radio, RefreshCw, Eye, Scan, Sparkles, ShieldAlert } from "lucide-react";
import { api, CamaraEstadoResponse } from "@/lib/api";

interface LiveCameraSectionProps {
  analisisTexto: string;
}

export function LiveCameraSection({ analisisTexto }: LiveCameraSectionProps) {
  const [streamKey, setStreamKey] = useState<number>(Date.now());
  const [tabActiva, setTabActiva] = useState<"video" | "ia">("video");

  const recargarStream = () => {
    setStreamKey(Date.now());
  };

  const streamUrl = `${api.getStreamUrl()}?t=${streamKey}`;

  return (
    <section className="neo-box p-6 sm:p-8">
      {/* Encabezado con selector de vista */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b-2 border-stone-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              Cámara en Tiempo Real
            </h2>
            <div className="flex items-center space-x-1.5 px-3 py-0.5 rounded-full border-2 border-stone-900 bg-red-100 shadow-[2px_2px_0px_0px_#1C1917]">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span className="text-[11px] font-black text-red-900 uppercase">En Vivo</span>
            </div>
          </div>
          <p className="text-sm font-medium text-stone-600 mt-1.5">
            Transmisión directa de video MJPEG capturado por la cámara física en campo.
          </p>
        </div>

        {/* Pestañas de Control */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setTabActiva("video")}
            className={`neo-button px-4 py-1.5 text-xs font-black uppercase ${
              tabActiva === "video" ? "bg-emerald-800 text-white" : "bg-white text-stone-800"
            }`}
          >
            Video Stream
          </button>
          <button
            onClick={() => setTabActiva("ia")}
            className={`neo-button px-4 py-1.5 text-xs font-black uppercase ${
              tabActiva === "ia" ? "bg-emerald-800 text-white" : "bg-white text-stone-800"
            }`}
          >
            Inferencia IA
          </button>
          <button
            onClick={recargarStream}
            className="neo-button p-2 bg-stone-100 hover:bg-stone-200 text-stone-800"
            title="Refrescar transmisión"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {tabActiva === "video" ? (
        /* Visor de Video en Vivo */
        <div className="mt-6">
          <div className="relative rounded-3xl overflow-hidden border-2 border-stone-900 bg-stone-950 shadow-[4px_4px_0px_0px_#1C1917] aspect-video max-h-[480px] w-full flex items-center justify-center">
            {/* Elemento de video stream nativo MJPEG */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={streamKey}
              src={streamUrl}
              alt="Transmisión en vivo de Tlahuicole"
              className="w-full h-full object-contain"
            />

            {/* Overlay técnico de HUD */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1 rounded-xl bg-stone-950/80 border border-stone-700 text-white text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CANAL: CAM_STREAM_01</span>
            </div>

            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-stone-950/80 border border-stone-700 text-stone-300 text-xs font-mono">
              RESOLUCIÓN: 640x360 | 10 FPS
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-600 gap-2">
            <span className="font-semibold text-stone-700">
              * El stream se actualiza segundo a segundo directamente desde la Raspberry Pi.
            </span>
            <span className="font-bold px-3 py-1 rounded-lg bg-stone-200/80 border border-stone-800 text-stone-800">
              Carga manual bloqueada: solo hardware real
            </span>
          </div>
        </div>
      ) : (
        /* Panel de Inferencia IA */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-5 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917]">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-200 border border-stone-900 text-emerald-950">
                <Scan className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900 uppercase">Ultralytics YOLOv8</h4>
                <span className="text-xs text-stone-500 font-medium">Detección y Conteo</span>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Mapeo de plantas, detección de espécimen y segmentación de follaje.
            </p>
            <div className="mt-4 inline-block neo-badge px-3 py-1 bg-stone-200 text-stone-800 text-xs">
              Modelo no configurado
            </div>
          </div>

          <div className="p-5 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917]">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-200 border border-stone-900 text-amber-950">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900 uppercase">PyTorch (Custom)</h4>
                <span className="text-xs text-stone-500 font-medium">Análisis de Anomalías y Estrés</span>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Clasificación especializada de patologías y detección de estrés hídrico o nutricional.
            </p>
            <div className="mt-4 inline-block neo-badge px-3 py-1 bg-stone-200 text-stone-800 text-xs">
              Modelo no entrenado
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
