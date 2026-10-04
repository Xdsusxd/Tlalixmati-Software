"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, AlertCircle, AlertTriangle, Activity, Sparkles } from "lucide-react";
import { api, CamaraEstadoResponse, VisionEstadoResponse } from "@/lib/api";

interface LiveCameraSectionProps {
  analisisTexto: string;
  vision?: VisionEstadoResponse | null;
}

export function LiveCameraSection({ analisisTexto, vision }: LiveCameraSectionProps) {
  const [streamKey, setStreamKey] = useState<number>(Date.now());
  const [estadoCamara, setEstadoCamara] = useState<CamaraEstadoResponse | null>(null);

  const cargarEstado = async () => {
    const est = await api.getCamaraEstado();
    if (est) setEstadoCamara(est);
  };

  useEffect(() => {
    cargarEstado();
    const interval = setInterval(cargarEstado, 5000);
    return () => clearInterval(interval);
  }, []);

  const recargarStream = () => {
    setStreamKey(Date.now());
    cargarEstado();
  };

  const streamUrl = `${api.getStreamUrl()}?t=${streamKey}`;
  const camaraConectada = Boolean(estadoCamara?.conectada);

  // Determinar diagnóstico visual honesto sin datos inventados
  let iconoDiagnostico = <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />;
  let textoDiagnostico = "Cámara no conectada. En espera de transmisión óptica desde el hardware de campo.";
  let etiquetaDerecha = "Hardware óptico en espera";

  if (camaraConectada) {
    if (vision && vision.activo) {
      if (vision.es_anomalia) {
        iconoDiagnostico = <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />;
        textoDiagnostico = `Alerta Fitosanitaria: ${vision.clase_actual} (${((vision.confianza || 0) * 100).toFixed(1)}% certeza). Detectada por modelos de IA en GPU.`;
        etiquetaDerecha = `Inferencia en GPU (${vision.dispositivo || "RTX 4050"})`;
      } else {
        iconoDiagnostico = <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />;
        textoDiagnostico = `Follaje Saludable: ${vision.clase_actual || "Sano"} (${((vision.confianza || 0) * 100).toFixed(1)}% certeza, ${vision.conteo_especimenes ?? 0} plantas visibles).`;
        etiquetaDerecha = `Inferencia en GPU (${vision.dispositivo || "RTX 4050"})`;
      }
    } else if (analisisTexto && analisisTexto !== "Sin resultados") {
      iconoDiagnostico = <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />;
      textoDiagnostico = analisisTexto;
      etiquetaDerecha = `Hardware activo: ${estadoCamara?.resolucion}`;
    } else {
      iconoDiagnostico = <Activity className="h-4 w-4 text-stone-500 shrink-0" />;
      textoDiagnostico = "Cámara transmitiendo en vivo. En espera del ciclo de inferencia de visión artificial en GPU.";
      etiquetaDerecha = `Hardware activo: ${estadoCamara?.resolucion}`;
    }
  }

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
            {vision?.activo && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                <Sparkles className="h-3 w-3" />
                IA Activa
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Visualización óptica continua del área foliar a máxima resolución y tasa nativa de hardware.
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

          {/* Indicador de Transmisión Dinámica */}
          <div className="absolute top-3 left-3 flex items-center space-x-2 px-3 py-1 rounded-lg bg-stone-900/85 backdrop-blur-xs text-white text-xs font-medium">
            <span className={`h-2 w-2 rounded-full ${camaraConectada ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>
              {camaraConectada
                ? `${estadoCamara?.resolucion} @ ${estadoCamara?.fps} FPS (Nativo)`
                : "Autodetección Máxima en Espera"}
            </span>
          </div>

          {/* Badge de inferencia en tiempo real */}
          {vision?.activo && (
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-purple-950/85 backdrop-blur-xs text-purple-200 text-xs font-mono border border-purple-800/50">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              <span>{vision.clase_actual} ({((vision.confianza || 0) * 100).toFixed(0)}%)</span>
            </div>
          )}
        </div>

        {/* Resumen Agronómico Visual Dinámico */}
        <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2">
          <div className="flex items-center space-x-2 text-stone-700">
            {iconoDiagnostico}
            <span>
              <strong>Diagnóstico visual:</strong> {textoDiagnostico}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            {etiquetaDerecha}
          </span>
        </div>
      </div>
    </section>
  );
}
