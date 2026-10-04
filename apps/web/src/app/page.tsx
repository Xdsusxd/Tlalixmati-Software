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
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          setVistaActiva(nuevaVista);
          gsap.fromTo(
            mainContentRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }
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

  // 1. Pantalla de Entrada / Loading Hero Stage (solo se muestra al ingresar)
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

  // 3. Tablero Desbloqueado y Autenticado (Apple-Grade Minimalist Architecture)
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb] text-[#18181b] font-sans">
      <Navbar
        apiConectada={apiConectada}
        autenticado={autenticado}
        vistaActiva={vistaActiva}
        onCambiarVista={handleCambiarVista}
        cultivoNombre={
          cultivo
            ? `${cultivo.nombre}${cultivo.variedad ? ` · ${cultivo.variedad}` : ""}`
            : undefined
        }
        onRefresh={verificarSesionYCargarDatos}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Encabezado Editorial de la Vista */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[rgba(24,24,27,0.06)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="micro-label">Plataforma Agronómica</span>
              <span className="text-[#a1a1aa] text-xs">/</span>
              <span className="text-xs font-mono text-[#71717a]">
                {cultivo?.ubicacion || "Lote de Producción"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#18181b] font-display mt-1">
              {vistaActiva === "panorama" && "Supervisión Integral de Campo"}
              {vistaActiva === "camara" && "Canal de Visión Óptica & GPU"}
              {vistaActiva === "telemetria" && "Análisis Físico & Microclimático"}
              {vistaActiva === "hardware" && "Topología de Nodos Tlahuicole"}
              {vistaActiva === "informes" && "Informes Técnicos & Auditoría"}
            </h1>
          </div>

          <div className="text-xs text-[#71717a] font-mono self-start sm:self-auto">
            {cultivo
              ? `${cultivo.nombre} · Ciclo Activo`
              : "Lote de Monitoreo Activo"}
          </div>
        </div>

        {/* Contenedor con animación suave de cambio de vista */}
        <div ref={mainContentRef}>
          {/* ═══════════════════════════════════════════════════════════════
             VISTA 1: PANORAMA (Executive Asymmetrical Dashboard)
             ═══════════════════════════════════════════════════════════════ */}
          {vistaActiva === "panorama" && (
            <div className="space-y-7">
              {/* Franja de KPIs Tipográficos Suizos (respirando con espacio) */}
              <TelemetrySection
                sensoresTexto={tlahuicole?.sensores}
                telemetria={telemetria}
                historial={historial}
                compacto={true}
              />

              {/* Grid Asimétrico: Óptica a la izquierda, Inteligencia a la derecha */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Columna Principal (7 columnas): Cámara y Visión en Vivo */}
                <div className="lg:col-span-7 space-y-6">
                  <LiveCameraSection
                    analisisTexto={tlahuicole?.analisis || "Sin anomalías"}
                    vision={vision}
                  />

                  {/* Informes Técnicos rápidos */}
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
             VISTA 2: CÁMARA & VISIÓN (Full-width Optical Station)
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
             VISTA 3: TELEMETRÍA (Deep-dive Sensors & Trends)
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
             VISTA 4: HARDWARE (Tlahuicole Profiler)
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

      {/* Pie de Página Editorial */}
      <footer className="border-t border-[rgba(24,24,27,0.06)] bg-[#ffffff] py-6 mt-12 text-xs text-[#a1a1aa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#18181b] font-display">Tlalixmati</span>
            <span>— Plataforma Inteligente de Monitoreo & Robótica Agrícola</span>
          </div>
          <div className="font-mono text-[11px] text-[#71717a]">
            Nodo de Campo: Tlahuicole (ESP32 + Raspberry Pi)
          </div>
        </div>
      </footer>
    </div>
  );
}
