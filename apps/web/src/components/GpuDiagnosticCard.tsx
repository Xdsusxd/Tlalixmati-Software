"use client";

import React from "react";
import { Zap, Cpu, Terminal } from "lucide-react";
import { GPUInfo } from "@/lib/api";

interface GpuDiagnosticCardProps {
  gpu: GPUInfo | null;
}

export function GpuDiagnosticCard({ gpu }: GpuDiagnosticCardProps) {
  const tieneGpu = gpu?.detectada && gpu?.cuda_disponible;

  return (
    <section className="neo-box p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b-2 border-stone-800 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-emerald-200 border-2 border-stone-900 text-emerald-950 shadow-[2px_2px_0px_0px_#1C1917]">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              Aceleración por Hardware (GPU / IA)
            </h2>
            <p className="text-sm font-medium text-stone-600 mt-1">
              Plataforma de cómputo local para entrenamiento e inferencia de PyTorch y YOLO.
            </p>
          </div>
        </div>

        <span
          className={`neo-badge text-xs px-3.5 py-1 uppercase ${
            tieneGpu ? "bg-emerald-300 text-emerald-950" : "bg-stone-200 text-stone-800"
          }`}
        >
          {tieneGpu ? "CUDA Activo" : "Modo CPU"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
        
        {/* Dispositivo Físico */}
        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917]">
          <span className="text-xs font-bold text-stone-500 uppercase">GPU Dedicada</span>
          <div className="text-sm font-black text-stone-900 mt-1 truncate">
            {gpu?.nombre || "NVIDIA RTX 4050"}
          </div>
          <span className="text-[11px] font-bold text-emerald-800">Laptop GPU</span>
        </div>

        {/* Soporte CUDA */}
        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917]">
          <span className="text-xs font-bold text-stone-500 uppercase">Framework CUDA</span>
          <div className="text-sm font-black text-stone-900 mt-1">
            {gpu?.cuda_disponible ? "Disponible (cu121)" : "No disponible"}
          </div>
          <span className="text-[11px] font-mono font-bold text-stone-600">Dispositivo: {gpu?.dispositivo_seleccionado || "cuda:0"}</span>
        </div>

        {/* Frameworks de IA */}
        <div className="p-4 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-[3px_3px_0px_0px_#1C1917]">
          <span className="text-xs font-bold text-stone-500 uppercase">Modelos Compatibles</span>
          <div className="text-sm font-black text-stone-900 mt-1">
            PyTorch 2.5 + YOLOv8
          </div>
          <span className="text-[11px] font-bold text-stone-600">Listo para entrenamiento</span>
        </div>

      </div>
    </section>
  );
}
