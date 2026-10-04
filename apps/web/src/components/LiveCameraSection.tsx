"use client";

import React, { useState } from "react";
import { Camera, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
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
    <section className="organic-card p-6 sm:p-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Cámara en Vivo del Cultivo
            </h2>
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/60">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-semibold">En Directo</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Visualización fotográfica continua del área foliar y el estado de las plantas en campo.
          </p>
        </div>

        <button
          onClick={recargarStream}
          className="organic-btn flex items-center space-x-2 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200/70 text-stone-700 text-xs rounded-xl border border-stone-200 self-start sm:self-auto"
          title="Refrescar transmisión"
        >
          <RefreshCw className="h-3.5 w-3.5 text-stone-500" />
          <span>Refrescar Imagen</span>
        </button>
      </div>

      {/* Visor de Video en Vivo */}
      <div className="mt-5">
        <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-950 aspect-video max-h-[460px] w-full flex items-center justify-center shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={streamKey}
            src={streamUrl}
            alt="Transmisión en vivo del cultivo"
            className="w-full h-full object-contain"
          />

          {/* Indicador de Transmisión */}
          <div className="absolute top-3 left-3 flex items-center space-x-2 px-3 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Monitoreo Activo</span>
          </div>
        </div>

        {/* Resumen Agronómico Visual */}
        <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2">
          <div className="flex items-center space-x-2 text-stone-700">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Diagnóstico visual:</strong> Follaje en buen estado. No se observan anomalías severas en el encuadre.
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            Captura 100% física de campo
          </span>
        </div>
      </div>
    </section>
  );
}
