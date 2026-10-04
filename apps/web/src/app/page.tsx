"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Navbar, VistaTab } from "@/components/Navbar";
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
  const [vistaActiva, setVistaActiva] = useState<VistaTab>("panorama");

  const mainContentRef = useRef<HTMLDivElement>(null);

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

  // Animación de transición GSAP al cambiar de pestaña
  const handleCambiarVista = (nuevaVista: VistaTab) => {
    if (nuevaVista === vistaActiva) return;

    if (mainContentRef.current) {
      gsap.to(mainContentRef.current, {
        opacity: 0,
        y: 6,
        duration: 0.14,
        ease: "power2.in",
        onComplete: () => {
          setVistaActiva(nuevaVista);
          gsap.fromTo(
            mainContentRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
          );
        },
      });
    } else {
      setVistaActiva(nuevaVista);
    }
  };

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

  // 1. Pantalla de Entrada / Hero Stage en Gris y Negro (solo al entrar)
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

  // 3. Tablero Desbloqueado y Autenticado
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0f] text-[#cbd5e1] font-friendly">
      <Navbar
        apiConectada={apiConectada}
        autenticado={autenticado}
        vistaActiva={vistaActiva}
        onCambiarVista={handleCambiarVista}
        onRefresh={verificarSesionYCargarDatos}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Encabezado Principal con Tipografía (Sin Parcela Experimental) */}
        <div className="mb-7 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-[#252528] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="micro-label">Plataforma Agrícola</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.04em] heading-display">
              {vistaActiva === "panorama" && "Supervisión del Cultivo"}
              {vistaActiva === "camara" && "Cámara en Vivo & Visión Artificial"}
              {vistaActiva === "telemetria" && "Condiciones del Terreno & Clima"}
              {vistaActiva === "hardware" && "Equipo de Campo (Tlahuicole)"}
              {vistaActiva === "informes" && "Informes del Cultivo & Bitácora"}
            </h1>
          </div>
        </div>

        {/* Contenedor dinámico de vistas */}
        <div ref={mainContentRef}>
          {/* ═══════════════════════════════════════════════════════════════
             VISTA 1: PANORAMA (Gris y Negro como Principales)
             ═══════════════════════════════════════════════════════════════ */}
          {vistaActiva === "panorama" && (
            <div className="space-y-7">
              {/* Franja de KPIs Tipográficos Gruesos */}
              <TelemetrySection
                sensoresTexto={tlahuicole?.sensores}
                telemetria={telemetria}
                historial={historial}
                compacto={true}
              />

              {/* Grid Asimétrico: Óptica a la izquierda, Inteligencia a la derecha */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Columna Principal (7 columnas): Cámara y Reportes */}
                <div className="lg:col-span-7 space-y-6">
                  <LiveCameraSection
                    analisisTexto={tlahuicole?.analisis || "Sin anomalías"}
                    vision={vision}
                  />

                  <ReportsSection reportesIniciales={reportes} />
                </div>

                {/* Columna Lateral (5 columnas): Hardware y Bitácora */}
                <div className="lg:col-span-5 space-y-6">
                  <TlahuicoleSection tlahuicole={tlahuicole} />

                  <EventsSection eventos={eventos} />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             VISTA 2: CÁMARA & VISIÓN
             ═══════════════════════════════════════════════════════════════ */}
          {vistaActiva === "camara" && (
            <div className="space-y-6">
              <LiveCameraSection
                analisisTexto={tlahuicole?.analisis || "Sin anomalías"}
                vision={vision}
              />
              <EventsSection
                eventos={eventos.filter(
                  (e) => e.origen.toLowerCase().includes("vision") || e.nivel === "critico"
                )}
              />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             VISTA 3: TELEMETRÍA
             ═══════════════════════════════════════════════════════════════ */}
          {vistaActiva === "telemetria" && (
            <div className="space-y-6">
              <TelemetrySection
                sensoresTexto={tlahuicole?.sensores}
                telemetria={telemetria}
                historial={historial}
                compacto={false}
              />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             VISTA 4: HARDWARE
             ═══════════════════════════════════════════════════════════════ */}
          {vistaActiva === "hardware" && (
            <div className="space-y-6">
              <TlahuicoleSection tlahuicole={tlahuicole} />
              <EventsSection
                eventos={eventos.filter(
                  (e) =>
                    e.origen.toLowerCase().includes("esp32") ||
                    e.origen.toLowerCase().includes("raspberry") ||
                    e.origen.toLowerCase().includes("sistema")
                )}
              />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
             VISTA 5: INFORMES & BITÁCORA
             ═══════════════════════════════════════════════════════════════ */}
          {vistaActiva === "informes" && (
            <div className="space-y-6">
              <ReportsSection reportesIniciales={reportes} />
              <EventsSection eventos={eventos} />
            </div>
          )}
        </div>
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-[#252528] bg-[#111113] py-5 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#e2e8f0] tracking-[-0.03em] heading-chunky">Tlalixmati</span>
            <span className="font-medium text-[#475569]">— Plataforma Inteligente de Monitoreo & Robótica Agrícola</span>
          </div>
          <div className="font-data text-[0.65rem] font-semibold text-[#334155]">
            Nodo de Campo: Tlahuicole (ESP32 + Raspberry Pi)
          </div>
        </div>
      </footer>
    </div>
  );
}
