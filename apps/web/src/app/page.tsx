"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { TlahuicoleSection } from "@/components/TlahuicoleSection";
import { LiveCameraSection } from "@/components/LiveCameraSection";
import { TelemetrySection } from "@/components/TelemetrySection";
import { ReportsSection } from "@/components/ReportsSection";
import { LoginModal } from "@/components/LoginModal";
import { api, TlahuicoleEstado, ReporteInfoResponse } from "@/lib/api";

export default function DashboardPage() {
  const [tlahuicole, setTlahuicole] = useState<TlahuicoleEstado | null>(null);
  const [reportes, setReportes] = useState<ReporteInfoResponse[]>([]);
  const [apiConectada, setApiConectada] = useState<boolean>(false);
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const cargarDatos = async () => {
    try {
      const [saludRes, tlahuicoleRes, authRes, reportesRes] = await Promise.all([
        api.getSalud(),
        api.getTlahuicoleEstado(),
        api.getAuthEstado(),
        api.getReportes(),
      ]);

      setApiConectada(saludRes !== null);
      if (tlahuicoleRes) setTlahuicole(tlahuicoleRes);
      setAutenticado(authRes.autenticado);
      setReportes(reportesRes);
    } catch {
      setApiConectada(false);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 12000);
    return () => clearInterval(interval);
  }, []);

  // Animación suave de entrada con GSAP
  useEffect(() => {
    if (!cargando && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" }
      );
    }
  }, [cargando]);

  const handleLogout = async () => {
    await api.logout();
    setAutenticado(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col">
      {/* Barra de Navegación Superior */}
      <Navbar
        apiConectada={apiConectada}
        autenticado={autenticado}
        onOpenLogin={() => setIsLoginOpen(true)}
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
                Supervisión agronómica en tiempo real, imágenes de campo y generación de informes técnicos.
              </p>
            </div>
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-medium self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cultivo en Seguimiento Activo</span>
            </div>
          </div>
        </div>

        {/* Módulos Esenciales del Cultivo */}
        <div ref={containerRef} className="space-y-6">
          
          {/* 1. Estado del Equipo de Campo (Tlahuicole) */}
          <TlahuicoleSection tlahuicole={tlahuicole} />

          {/* 2. Cámara en Tiempo Real del Cultivo */}
          <LiveCameraSection analisisTexto={tlahuicole?.analisis || "Sin anomalías"} />

          {/* 3. Condiciones del Terreno y Clima (Sensores) */}
          <TelemetrySection sensoresTexto={tlahuicole?.sensores || "Sin datos"} />

          {/* 4. Informes Agronómicos en PDF (Automáticos y Manuales con Supabase) */}
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

      {/* Modal de Acceso */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => setAutenticado(true)}
      />
    </div>
  );
}
