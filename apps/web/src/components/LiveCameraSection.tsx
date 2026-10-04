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

  // Diagnóstico visual en gris y negro
  let iconoDiagnostico = <AlertCircle className="w-4 h-4 text-gray-500 shrink-0" />;
  let textoDiagnostico = "Cámara no conectada. En espera de transmisión óptica desde el hardware de campo.";
  let badgeTexto = "Óptica en espera";

  if (camaraConectada) {
    if (vision && vision.activo) {
      if (vision.es_anomalia) {
        iconoDiagnostico = <AlertTriangle className="w-4 h-4 text-white shrink-0" />;
        textoDiagnostico = `Alerta fitosanitaria: ${vision.clase_actual} (${((vision.confianza || 0) * 100).toFixed(1)}% confianza en GPU ${vision.dispositivo || "RTX 4050"}).`;
        badgeTexto = "Anomalía Detectada";
      } else {
        iconoDiagnostico = <CheckCircle2 className="w-4 h-4 text-white shrink-0" />;
        textoDiagnostico = `Follaje saludable: ${vision.clase_actual || "Sano"} (${((vision.confianza || 0) * 100).toFixed(1)}% certeza, ${vision.conteo_especimenes ?? 0} plantas visibles).`;
        badgeTexto = "Follaje Óptimo";
      }
    } else if (analisisTexto && analisisTexto !== "Sin resultados") {
      iconoDiagnostico = <CheckCircle2 className="w-4 h-4 text-white shrink-0" />;
      textoDiagnostico = analisisTexto;
      badgeTexto = "Transmisión Activa";
    } else {
      iconoDiagnostico = <Activity className="w-4 h-4 text-gray-400 shrink-0" />;
      textoDiagnostico = "Cámara transmitiendo en directo. Ciclo de inferencia IA en espera.";
      badgeTexto = "En Directo";
    }
  }

  return (
    <div className="card-mono p-6 sm:p-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#252528] gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold tracking-[-0.03em] heading-chunky text-[#e2e8f0]">
              Cámara en Vivo del Cultivo
            </h3>
            <span className={camaraConectada ? "pill-mono-active" : "pill-mono-subtle"}>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  camaraConectada ? "bg-[#cbd5e1] animate-pulse" : "bg-[#475569]"
                }`}
              />
              {camaraConectada ? "En Directo" : "Desconectado"}
            </span>
          </div>
          <p className="text-xs font-medium text-[#64748b] mt-1">
            Supervisión foliar continua transmitida directamente desde el nodo de campo.
          </p>
        </div>

        <button
          onClick={recargarStream}
          className="btn-outline-gray self-start sm:self-auto text-sm"
          title="Refrescar transmisión"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Visor de Video en Negro Puro */}
      <div
        className={`relative rounded-2xl overflow-hidden aspect-video ${
          compacto ? "max-h-[380px]" : "max-h-[500px]"
        } w-full flex items-center justify-center bg-[#000000] border border-[#252528]`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={streamKey}
          src={streamUrl}
          alt="Transmisión en vivo del cultivo"
          className="w-full h-full object-contain"
        />

        {/* HUD Superior Izquierdo */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl font-data text-xs font-semibold bg-[#101012]/90 text-[#cbd5e1] border border-[#32323a] backdrop-blur-md">
          <span
            className={`w-2 h-2 rounded-full ${
              camaraConectada ? "bg-[#94a3b8] animate-pulse" : "bg-[#475569]"
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
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-data text-xs font-semibold bg-[#101012]/90 text-[#cbd5e1] border border-[#32323a] backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-[#94a3b8]" />
            <span>
              {vision.clase_actual} ({((vision.confianza || 0) * 100).toFixed(0)}%)
            </span>
          </div>
        )}
      </div>

      {/* Franja de Diagnóstico Agronómico */}
      <div className="mt-4 p-3.5 rounded-xl bg-[#101012] border border-[#252528] flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2">
        <div className="flex items-center gap-2.5 text-[#cbd5e1]">
          {iconoDiagnostico}
          <span>
            <strong className="text-[#e2e8f0] font-semibold">Diagnóstico:</strong>{" "}
            <span className="font-medium text-[#64748b]">{textoDiagnostico}</span>
          </span>
        </div>
        <span className="font-data text-xs font-semibold text-[#94a3b8] bg-[#161618] px-2.5 py-0.5 rounded-lg border border-[#252528] shrink-0">
          {badgeTexto}
        </span>
      </div>
    </div>
  );
}
