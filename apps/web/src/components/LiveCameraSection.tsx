"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, Activity, Zap } from "lucide-react";
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

  // Diagnóstico visual en blanco, negro y gris
  let iconoDiagnostico = <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />;
  let textoDiagnostico = "Cámara no conectada. En espera de transmisión óptica desde el hardware de campo.";
  let badgeTexto = "Óptica en espera";

  if (camaraConectada) {
    if (vision && vision.activo) {
      if (vision.es_anomalia) {
        iconoDiagnostico = <AlertTriangle className="w-4 h-4 text-[#111111] shrink-0" />;
        textoDiagnostico = `Alerta fitosanitaria: ${vision.clase_actual} (${((vision.confianza || 0) * 100).toFixed(1)}% confianza en GPU ${vision.dispositivo || "RTX 4050"}).`;
        badgeTexto = "Anomalía Detectada";
      } else {
        iconoDiagnostico = <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0" />;
        textoDiagnostico = `Follaje saludable: ${vision.clase_actual || "Sano"} (${((vision.confianza || 0) * 100).toFixed(1)}% certeza, ${vision.conteo_especimenes ?? 0} plantas visibles).`;
        badgeTexto = "Follaje Óptimo";
      }
    } else if (analisisTexto && analisisTexto !== "Sin resultados") {
      iconoDiagnostico = <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0" />;
      textoDiagnostico = analisisTexto;
      badgeTexto = "Transmisión Activa";
    } else {
      iconoDiagnostico = <Activity className="w-4 h-4 text-gray-500 shrink-0" />;
      textoDiagnostico = "Cámara transmitiendo en directo. Ciclo de inferencia IA en espera.";
      badgeTexto = "En Directo";
    }
  }

  return (
    <div className="card-mono p-6 sm:p-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold tracking-tight text-[#111111] heading-chunky">
              Cámara en Vivo del Cultivo
            </h3>
            <span
              className={camaraConectada ? "pill-mono-active" : "pill-mono-subtle"}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  camaraConectada ? "bg-white animate-pulse" : "bg-gray-400"
                }`}
              />
              {camaraConectada ? "En Directo" : "Desconectado"}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Supervisión foliar continua transmitida directamente desde el nodo de campo.
          </p>
        </div>

        <button
          onClick={recargarStream}
          className="btn-outline-gray self-start sm:self-auto text-xs py-1.5 px-3"
          title="Refrescar transmisión"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Visor de Video Monocromático */}
      <div
        className={`relative rounded-2xl overflow-hidden aspect-video ${
          compacto ? "max-h-[380px]" : "max-h-[500px]"
        } w-full flex items-center justify-center bg-[#111111] border border-gray-200`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={streamKey}
          src={streamUrl}
          alt="Transmisión en vivo del cultivo"
          className="w-full h-full object-contain"
        />

        {/* HUD Superior Izquierdo: Hardware y FPS */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-black/80 text-white border border-white/10 backdrop-blur-md">
          <span
            className={`w-2 h-2 rounded-full ${
              camaraConectada ? "bg-white animate-pulse" : "bg-gray-500"
            }`}
          />
          <span>
            {camaraConectada
              ? `${estadoCamara?.resolucion || "1080p"} · ${estadoCamara?.fps || 30} FPS`
              : "Autodetección Óptica en Espera"}
          </span>
        </div>

        {/* HUD Superior Derecho: Inferencia IA */}
        {vision?.activo && (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-black/80 text-white border border-white/10 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>
              {vision.clase_actual} ({((vision.confianza || 0) * 100).toFixed(0)}%)
            </span>
          </div>
        )}
      </div>

      {/* Franja de Diagnóstico Agronómico en Blanco, Negro y Gris */}
      <div className="mt-4 p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2">
        <div className="flex items-center gap-2.5 text-gray-700">
          {iconoDiagnostico}
          <span>
            <strong className="text-[#111111] font-bold">Diagnóstico:</strong>{" "}
            <span className="font-medium text-gray-600">{textoDiagnostico}</span>
          </span>
        </div>
        <span className="text-xs font-bold font-mono text-gray-500 bg-white px-2.5 py-0.5 rounded-lg border border-gray-200 shrink-0">
          {badgeTexto}
        </span>
      </div>
    </div>
  );
}
