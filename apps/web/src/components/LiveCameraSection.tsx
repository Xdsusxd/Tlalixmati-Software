"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, AlertCircle, AlertTriangle, Activity, Zap, Maximize2 } from "lucide-react";
import { api, CamaraEstadoResponse, VisionEstadoResponse } from "@/lib/api";

interface LiveCameraSectionProps {
  analisisTexto: string;
  vision?: VisionEstadoResponse | null;
  compacto?: boolean;
}

export function LiveCameraSection({ analisisTexto, vision, compacto = false }: LiveCameraSectionProps) {
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

  // Diagnóstico visual agronómico
  let iconoDiagnostico = <AlertCircle className="w-4 h-4 text-[#a1a1aa] shrink-0" />;
  let textoDiagnostico = "Cámara no conectada. En espera de transmisión óptica desde el hardware de campo.";
  let badgeTexto = "Óptica en espera";

  if (camaraConectada) {
    if (vision && vision.activo) {
      if (vision.es_anomalia) {
        iconoDiagnostico = <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0" />;
        textoDiagnostico = `Alerta fitosanitaria: ${vision.clase_actual} (${((vision.confianza || 0) * 100).toFixed(1)}% confianza en GPU ${vision.dispositivo || "RTX 4050"}).`;
        badgeTexto = "Anomalía Fitosanitaria";
      } else {
        iconoDiagnostico = <CheckCircle className="w-4 h-4 text-[#15803d] shrink-0" />;
        textoDiagnostico = `Follaje saludable: ${vision.clase_actual || "Sano"} (${((vision.confianza || 0) * 100).toFixed(1)}% certeza, ${vision.conteo_especimenes ?? 0} plantas visibles).`;
        badgeTexto = "Follaje Óptimo";
      }
    } else if (analisisTexto && analisisTexto !== "Sin resultados") {
      iconoDiagnostico = <CheckCircle className="w-4 h-4 text-[#15803d] shrink-0" />;
      textoDiagnostico = analisisTexto;
      badgeTexto = "Transmisión Activa";
    } else {
      iconoDiagnostico = <Activity className="w-4 h-4 text-[#71717a] shrink-0" />;
      textoDiagnostico = "Cámara transmitiendo en directo. Ciclo de inferencia IA en espera.";
      badgeTexto = "En Directo";
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[rgba(24,24,27,0.07)] p-5 sm:p-6 shadow-xs">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[rgba(24,24,27,0.06)] gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-[#18181b] font-display">
              Canal Óptico en Directo
            </h3>
            <span
              className={`pill-status ${
                camaraConectada ? "pill-ok" : "pill-neutral"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  camaraConectada ? "bg-[#15803d] animate-pulse" : "bg-[#a1a1aa]"
                }`}
              />
              {camaraConectada ? "En Directo" : "Desconectado"}
            </span>
          </div>
          <p className="text-xs text-[#71717a] mt-0.5">
            Supervisión foliar continua transmitida desde el nodo de campo Tlahuicole.
          </p>
        </div>

        <button
          onClick={recargarStream}
          className="btn-quiet self-start sm:self-auto text-xs py-1.5 px-3"
          title="Refrescar transmisión"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Visor de Video de Precisión */}
      <div
        className={`relative rounded-xl overflow-hidden aspect-video ${
          compacto ? "max-h-[360px]" : "max-h-[480px]"
        } w-full flex items-center justify-center bg-[#09090b] border border-[rgba(24,24,27,0.12)]`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={streamKey}
          src={streamUrl}
          alt="Transmisión en vivo del cultivo"
          className="w-full h-full object-contain"
        />

        {/* HUD Superior Izquierdo: Resolución y Hardware */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono bg-black/75 text-white/90 border border-white/10 backdrop-blur-md">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              camaraConectada ? "bg-[#22c55e] animate-pulse" : "bg-neutral-500"
            }`}
          />
          <span>
            {camaraConectada
              ? `${estadoCamara?.resolucion || "1080p"} · ${estadoCamara?.fps || 30} FPS`
              : "Autodetección Óptica en Espera"}
          </span>
        </div>

        {/* HUD Superior Derecho: Inferencia IA / GPU */}
        {vision?.activo && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-black/75 text-white/90 border border-white/10 backdrop-blur-md">
            <Zap className="w-3 h-3 text-[#22c55e]" />
            <span>
              {vision.clase_actual} ({((vision.confianza || 0) * 100).toFixed(0)}%)
            </span>
          </div>
        )}
      </div>

      {/* Franja de Diagnóstico Agronómico */}
      <div className="mt-3.5 p-3 rounded-xl bg-[#fbfbfb] border border-[rgba(24,24,27,0.06)] flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2">
        <div className="flex items-center gap-2.5 text-[#52525b]">
          {iconoDiagnostico}
          <span>
            <strong className="text-[#18181b] font-medium">Diagnóstico:</strong>{" "}
            {textoDiagnostico}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a1a1aa] shrink-0">
          {badgeTexto}
        </span>
      </div>
    </div>
  );
}
