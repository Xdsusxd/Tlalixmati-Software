"use client";

import React from "react";
import { Eye, CameraOff, Scan, AlertTriangle, Sparkles } from "lucide-react";

interface VisionSectionProps {
  analisisTexto: string;
}

export function VisionSection({ analisisTexto }: VisionSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 card-elevation">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">Visión Computacional e IA</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono">
              YOLO + PyTorch
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Detección de patologías, segmentación y conteo sobre capturas de cámara física.
          </p>
        </div>

        <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium border border-stone-200">
          {analisisTexto || "Sin resultados"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        
        {/* Visor de Imágenes de Campo (Sin subida manual) */}
        <div className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 flex flex-col items-center justify-center min-h-[220px] text-center">
          <div className="p-3 rounded-full bg-stone-200/70 text-stone-500 mb-3">
            <CameraOff className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-800">Sin imágenes disponibles</h3>
          <p className="text-xs text-stone-500 max-w-xs mt-1">
            Cámara no configurada en campo. La ingesta es 100% automatizada desde el hardware de captura.
          </p>
          <div className="mt-3 text-[11px] px-2.5 py-1 rounded bg-stone-200/60 text-stone-600 font-mono">
            Subida manual deshabilitada por diseño
          </div>
        </div>

        {/* Panel de Inferencia de Modelos */}
        <div className="flex flex-col justify-between space-y-3">
          
          {/* Tarjeta YOLO */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scan className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-semibold text-stone-900">Ultralytics YOLO (Detección / Segmentación)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 font-medium">
                Modelo no configurado
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Esperando dataset de imágenes de cultivo para entrenamiento e inferencia en GPU.
            </p>
          </div>

          {/* Tarjeta PyTorch Custom */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-700" />
                <span className="text-xs font-semibold text-stone-900">PyTorch (Análisis de Anomalías)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 font-medium">
                Modelo no entrenado
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Modelos especializados para clasificación fina y detección de estrés en hojas.
            </p>
          </div>

          {/* Estado de Evidencia */}
          <div className="p-2.5 rounded-lg bg-stone-100/80 text-xs text-stone-600 flex items-center space-x-2">
            <AlertTriangle className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>No hay evidencia suficiente ni análisis procesados.</span>
          </div>

        </div>

      </div>
    </section>
  );
}
