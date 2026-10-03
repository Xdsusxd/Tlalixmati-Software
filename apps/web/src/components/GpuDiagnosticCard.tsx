"use client";

import React from "react";
import { Cpu, Zap, Layers, Terminal } from "lucide-react";
import { GPUInfo } from "@/lib/api";

interface GpuDiagnosticCardProps {
  gpu: GPUInfo | null;
}

export function GpuDiagnosticCard({ gpu }: GpuDiagnosticCardProps) {
  const tieneGpu = gpu?.detectada && gpu?.cuda_disponible;

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 card-elevation">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">Aceleración por Hardware (IA)</h2>
            <p className="text-xs text-stone-500">Cómputo local configurado para PyTorch y Ultralytics YOLO.</p>
          </div>
        </div>

        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            tieneGpu ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
          }`}
        >
          {tieneGpu ? "CUDA Activo" : "Modo CPU"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        
        {/* GPU Detectada */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <span className="text-xs text-stone-400 font-medium">Dispositivo Físico</span>
          <div className="text-sm font-semibold text-stone-800 mt-1 truncate">
            {gpu?.nombre || "NVIDIA RTX 4050"}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Laptop GPU</span>
        </div>

        {/* Soporte CUDA */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <span className="text-xs text-stone-400 font-medium">Plataforma CUDA</span>
          <div className="text-sm font-semibold text-stone-800 mt-1">
            {gpu?.cuda_disponible ? "Disponible (cu121)" : "No disponible"}
          </div>
          <span className="text-[11px] text-stone-500 font-mono">Dispositivo: {gpu?.dispositivo_seleccionado || "cuda:0"}</span>
        </div>

        {/* Frameworks de IA */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <span className="text-xs text-stone-400 font-medium">Frameworks Compatibles</span>
          <div className="text-sm font-semibold text-stone-800 mt-1">
            PyTorch 2.5 + YOLOv8
          </div>
          <span className="text-[11px] text-stone-500">Listo para entrenamiento</span>
        </div>

      </div>
    </section>
  );
}
