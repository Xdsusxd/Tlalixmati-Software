"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, AlertCircle, AlertTriangle, Activity, Zap } from "lucide-react";
import { api, CamaraEstadoResponse, VisionEstadoResponse } from "@/lib/api";

interface LiveCameraSectionProps {
  analisisTexto: string;
  vision?: VisionEstadoResponse | null;
}

const BLUE = "#0069e9";
const BLUE_DARK = "#055bd3";
const BLUE_LIGHT = "rgba(0, 105, 233, 0.08)";
const BLUE_BORDER = "rgba(0, 105, 233, 0.22)";

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

  // Diagnóstico visual
  let iconoDiagnostico = <AlertCircle className="h-4 w-4 shrink-0 text-gray-400" />;
  let textoDiagnostico = "Cámara no conectada. En espera de transmisión óptica desde el hardware de campo.";
  let etiquetaDerecha = "Hardware óptico en espera";

  if (camaraConectada) {
    if (vision && vision.activo) {
      if (vision.es_anomalia) {
        iconoDiagnostico = <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />;
        textoDiagnostico = `Alerta Fitosanitaria: ${vision.clase_actual} (${((vision.confianza || 0) * 100).toFixed(1)}% certeza). Detectada por modelos de IA en GPU.`;
        etiquetaDerecha = `Inferencia en GPU (${vision.dispositivo || "RTX 4050"})`;
      } else {
        iconoDiagnostico = <CheckCircle className="h-4 w-4 shrink-0 text-[#0069e9]" />;
        textoDiagnostico = `Follaje Saludable: ${vision.clase_actual || "Sano"} (${((vision.confianza || 0) * 100).toFixed(1)}% certeza, ${vision.conteo_especimenes ?? 0} plantas visibles).`;
        etiquetaDerecha = `Inferencia en GPU (${vision.dispositivo || "RTX 4050"})`;
      }
    } else if (analisisTexto && analisisTexto !== "Sin resultados") {
      iconoDiagnostico = <CheckCircle className="h-4 w-4 shrink-0 text-[#0069e9]" />;
      textoDiagnostico = analisisTexto;
      etiquetaDerecha = `Hardware activo: ${estadoCamara?.resolucion}`;
    } else {
      iconoDiagnostico = <Activity className="h-4 w-4 shrink-0 text-gray-500" />;
      textoDiagnostico = "Cámara transmitiendo en vivo. En espera del ciclo de inferencia de visión artificial en GPU.";
      etiquetaDerecha = `Hardware activo: ${estadoCamara?.resolucion}`;
    }
  }

  return (
    <section className="dash-card p-6 sm:p-7">
      {/* Encabezado */}
      <div className="section-header sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              className="text-xl font-bold tracking-tight text-gray-900"
              style={{ letterSpacing: "-0.02em" }}
            >
              Cámara en Vivo del Cultivo
            </h2>

            {/* Badge En Directo */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
              style={{
                background: BLUE_LIGHT,
                borderColor: BLUE_BORDER,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: BLUE }}
              />
              <span className="text-[11px] font-semibold text-[#055bd3]">
                En Directo
              </span>
            </div>

            {vision?.activo && (
              <span className="badge-blue hidden sm:inline-flex">
                <Zap className="h-3 w-3" />
                Inferencia Activa
              </span>
            )}
          </div>
          <p className="text-xs mt-1 text-gray-500">
            Visualización óptica continua del área foliar a máxima resolución y tasa nativa de hardware.
          </p>
        </div>

        <button
          onClick={recargarStream}
          className="btn-secondary self-start sm:self-auto"
          title="Refrescar transmisión"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refrescar Imagen</span>
        </button>
      </div>

      {/* Visor de Video en Vivo */}
      <div className="mt-1">
        <div
          className="relative rounded-xl overflow-hidden aspect-video max-h-[460px] w-full flex items-center justify-center border border-gray-200"
          style={{ background: "#0c1b30" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={streamKey}
            src={streamUrl}
            alt="Transmisión en vivo del cultivo"
            className="w-full h-full object-contain"
          />

          {/* Indicador de Transmisión */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-[#0c1b30]/85 text-white/90 border border-white/10 backdrop-blur-xs">
            <span
              className={`h-1.5 w-1.5 rounded-full ${camaraConectada ? "animate-pulse" : ""}`}
              style={{ background: camaraConectada ? "#0069e9" : "#9ca3af" }}
            />
            <span>
              {camaraConectada
                ? `${estadoCamara?.resolucion} @ ${estadoCamara?.fps} FPS`
                : "Autodetección en Espera"}
            </span>
          </div>

          {/* Badge de inferencia en tiempo real */}
          {vision?.activo && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-[#0c1b30]/85 text-[#cce2ff] border border-[#0069e9]/30 backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-[#0069e9]" />
              <span>
                {vision.clase_actual} ({((vision.confianza || 0) * 100).toFixed(0)}%)
              </span>
            </div>
          )}
        </div>

        {/* Resumen de Diagnóstico */}
        <div className="mt-3 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2 border border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {iconoDiagnostico}
            <span className="text-gray-700">
              <strong className="text-gray-900 font-semibold">Diagnóstico visual:</strong>{" "}
              {textoDiagnostico}
            </span>
          </div>
          <span className="text-[11px] font-medium text-gray-400 shrink-0">
            {etiquetaDerecha}
          </span>
        </div>
      </div>
    </section>
  );
}
