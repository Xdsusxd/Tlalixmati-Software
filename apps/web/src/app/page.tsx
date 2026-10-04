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
import { Sprout } from "lucide-react";

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
      // 1. Primero comprobar autenticación obligatoria
      const authRes = await api.getAuthEstado();
      const estaAutenticado = authRes.autenticado;
      setAutenticado(estaAutenticado);

      const saludRes = await api.getSalud();
      setApiConectada(saludRes !== null);

      // 2. Si está autenticado, cargar datos privados del cultivo
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
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    verificarSesionYCargarDatos();
    const interval = setInterval(verificarSesionYCargarDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  // Animación suave de entrada con GSAP para el tablero desbloqueado
  useEffect(() => {
    if (!cargando && autenticado && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" }
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


  // 1. Estado de carga inicial
  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-900 text-white flex items-center justify-center shadow-md animate-pulse">
            <Sprout className="h-6 w-6 text-emerald-300" />
          </div>
          <span className="text-xs font-semibold text-stone-600 tracking-wide uppercase">
            Verificando credenciales de acceso...
          </span>
        </div>
      </div>
    );
  }

  // 2. Si NO está autenticado: BLOQUEO ESTRICTO DEL TABLERO
  // No se renderiza la cámara, ni la telemetría, ni los reportes de campo
  if (!autenticado) {
    return (
      <AccessGate
        apiConectada={apiConectada}
        onLoginSuccess={() => {
          setCargando(true);
          verificarSesionYCargarDatos();
        }}
      />
    );
  }

  // 3. Tablero Desbloqueado (Usuario Autenticado)
  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col">
      {/* Barra de Navegación Superior */}
      <Navbar
        apiConectada={apiConectada}
        autenticado={autenticado}
        onOpenLogin={() => {}}
        onLogout={handleLogout}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        
        {/* Encabezado del Tablero */}
        <div className="mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Monitoreo del Cultivo
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600">
                Supervisión agronómica en tiempo real, imágenes ópticas de campo y auditoría de eventos.
              </p>
            </div>
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-medium self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {cultivo
                  ? `${cultivo.nombre}${cultivo.variedad ? ` · ${cultivo.variedad}` : ""}`
                  : "Lote de Monitoreo Activo"}
              </span>
            </div>
          </div>
        </div>

        {/* Módulos Esenciales del Cultivo */}
        <div ref={containerRef} className="space-y-6">
          
          {/* 1. Estado del Equipo de Campo (Tlahuicole) */}
          <TlahuicoleSection tlahuicole={tlahuicole} />

          {/* 2. Cámara en Tiempo Real del Cultivo */}
          <LiveCameraSection
            analisisTexto={tlahuicole?.analisis || "Sin anomalías"}
            vision={vision}
          />


          {/* 3. Condiciones del Terreno y Clima (Sensores) */}
          <TelemetrySection
            sensoresTexto={tlahuicole?.sensores || "Sin datos"}
            telemetria={telemetria}
            historial={historial}
          />

          {/* 4. Bitácora de Eventos e Incidencias Fitosanitarias */}
          <EventsSection eventos={eventos} />

          {/* 5. Informes Agronómicos en PDF (Automáticos y Manuales con Supabase) */}
          <ReportsSection reportesIniciales={reportes} />

        </div>
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-stone-200/80 bg-white/70 py-5 mt-12 text-xs text-stone-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Tlalixmati — Plataforma de Monitoreo Agrícola</span>
          <span>Unidad de Campo: Tlahuicole (ESP32 + Raspberry Pi)</span>
        </div>
      </footer>
    </div>
  );
}
