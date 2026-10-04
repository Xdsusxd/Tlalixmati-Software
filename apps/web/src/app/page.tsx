"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { TlahuicoleSection } from "@/components/TlahuicoleSection";
import { LiveCameraSection } from "@/components/LiveCameraSection";
import { TelemetrySection } from "@/components/TelemetrySection";
import { EventsSection } from "@/components/EventsSection";
import { ReportsSection } from "@/components/ReportsSection";
import { AccessGate } from "@/components/AccessGate";
import { LoadingHeroStage } from "@/components/LoadingHeroStage";
import {
  api,
  TlahuicoleEstado,
  ReporteInfoResponse,
  TelemetriaActual,
  PuntoHistorial,
  EventoItem,
  CultivoInfo,
  VisionEstadoResponse,
} from "@/lib/api";

const BLUE = "#0069e9";
const BLUE_LIGHT = "rgba(0, 105, 233, 0.08)";
const BLUE_BORDER = "rgba(0, 105, 233, 0.22)";

export default function DashboardPage() {
  const [tlahuicole, setTlahuicole] = useState<TlahuicoleEstado | null>(null);
  const [reportes, setReportes] = useState<ReporteInfoResponse[]>([]);
  const [telemetria, setTelemetria] = useState<TelemetriaActual | null>(null);
  const [historial, setHistorial] = useState<PuntoHistorial[]>([]);
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [cultivo, setCultivo] = useState<CultivoInfo | null>(null);
  const [vision, setVision] = useState<VisionEstadoResponse | null>(null);
  const [apiConectada, setApiConectada] = useState<boolean>(false);
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const verificarSesionYCargarDatos = async () => {
    try {
      const authRes = await api.getAuthEstado();
      const estaAutenticado = authRes.autenticado;
      setAutenticado(estaAutenticado);

      const saludRes = await api.getSalud();
      setApiConectada(saludRes !== null);

      if (estaAutenticado) {
        const [
          tlahuicoleRes,
          reportesRes,
          telemRes,
          histRes,
          eventosRes,
          cultivoRes,
          visionRes,
        ] = await Promise.all([
          api.getTlahuicoleEstado(),
          api.getReportes(),
          api.getTelemetriaActual(),
          api.getTelemetriaHistorial(24),
          api.getEventos(30),
          api.getCultivoActivo(),
          api.getVisionEstado(),
        ]);

        if (tlahuicoleRes) setTlahuicole(tlahuicoleRes);
        setReportes(reportesRes);
        setTelemetria(telemRes);
        setHistorial(histRes);
        setEventos(eventosRes);
        setCultivo(cultivoRes);
        setVision(visionRes);
      } else {
        setTlahuicole(null);
        setReportes([]);
        setTelemetria(null);
        setHistorial([]);
        setEventos([]);
        setCultivo(null);
        setVision(null);
      }
    } catch {
      setApiConectada(false);
      setAutenticado(false);
    }
  };

  useEffect(() => {
    verificarSesionYCargarDatos();
    const interval = setInterval(verificarSesionYCargarDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  // Animación de entrada con GSAP para las secciones del dashboard
  useEffect(() => {
    if (!cargando && autenticado && containerRef.current) {
      const children = containerRef.current.children;
      gsap.fromTo(
        children,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        }
      );
    }
  }, [cargando, autenticado]);

  const handleLogout = async () => {
    await api.logout();
    setAutenticado(false);
    setTlahuicole(null);
    setReportes([]);
    setTelemetria(null);
    setHistorial([]);
    setEventos([]);
    setCultivo(null);
    setVision(null);
  };

  // 1. Pantalla de Entrada / Loading Hero Stage (solo se muestra al ingresar por primera vez)
  if (cargando) {
    return (
      <LoadingHeroStage
        onComplete={() => setCargando(false)}
        mensajeCarga="Iniciando plataforma Tlalixmati..."
      />
    );
  }

  // 2. Control de Acceso (si no está autenticado)
  if (!autenticado) {
    return (
      <AccessGate
        apiConectada={apiConectada}
        onLoginSuccess={() => {
          verificarSesionYCargarDatos();
        }}
      />
    );
  }

  // 3. Tablero Desbloqueado y Autenticado (Minimalista Azul)
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-gray-900 font-sans">
      <Navbar
        apiConectada={apiConectada}
        autenticado={autenticado}
        onOpenLogin={() => {}}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {/* Encabezado del Tablero */}
        <div className="mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  Monitoreo del Cultivo
                </h2>
                <span className="badge-blue">EN VIVO</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Supervisión agronómica en tiempo real, imágenes ópticas de campo y auditoría de eventos.
              </p>
            </div>

            {/* Badge de cultivo activo */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto border"
              style={{
                background: BLUE_LIGHT,
                borderColor: BLUE_BORDER,
                color: "#055bd3",
              }}
            >
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: BLUE }}
              />
              <span>
                {cultivo
                  ? `${cultivo.nombre}${cultivo.variedad ? ` · ${cultivo.variedad}` : ""}`
                  : "Lote de Monitoreo Activo"}
              </span>
            </div>
          </div>
        </div>

        {/* Módulos Principales del Tablero */}
        <div ref={containerRef} className="space-y-5">
          <TlahuicoleSection tlahuicole={tlahuicole} />

          <LiveCameraSection
            analisisTexto={tlahuicole?.analisis || "Sin anomalías"}
            vision={vision}
          />

          <TelemetrySection
            sensoresTexto={tlahuicole?.sensores || "Sin datos"}
            telemetria={telemetria}
            historial={historial}
          />

          <EventsSection eventos={eventos} />

          <ReportsSection reportesIniciales={reportes} />
        </div>
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-gray-200 bg-white py-5 mt-10 text-xs text-center text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Tlalixmati<sup className="ml-0.5 text-[#0069e9]">TM</sup> — Plataforma de Monitoreo y Robótica Agrícola
          </span>
          <span>Unidad de Campo: Tlahuicole (ESP32 + Raspberry Pi)</span>
        </div>
      </footer>
    </div>
  );
}
