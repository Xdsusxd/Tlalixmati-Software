"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { TlahuicoleSection } from "@/components/TlahuicoleSection";
import { LiveCameraSection } from "@/components/LiveCameraSection";
import { TelemetrySection } from "@/components/TelemetrySection";
import { ReportsSection } from "@/components/ReportsSection";
import { GpuDiagnosticCard } from "@/components/GpuDiagnosticCard";
import { LoginModal } from "@/components/LoginModal";
import { api, GPUInfo, TlahuicoleEstado, ReporteInfoResponse } from "@/lib/api";

export default function DashboardPage() {
  const [tlahuicole, setTlahuicole] = useState<TlahuicoleEstado | null>(null);
  const [gpu, setGpu] = useState<GPUInfo | null>(null);
  const [reportes, setReportes] = useState<ReporteInfoResponse[]>([]);
  const [apiConectada, setApiConectada] = useState<boolean>(false);
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const cargarDatos = async () => {
    try {
      const [saludRes, tlahuicoleRes, gpuRes, authRes, reportesRes] = await Promise.all([
        api.getSalud(),
        api.getTlahuicoleEstado(),
        api.getGpuInfo(),
        api.getAuthEstado(),
        api.getReportes(),
      ]);

      setApiConectada(saludRes !== null);
      if (tlahuicoleRes) setTlahuicole(tlahuicoleRes);
      if (gpuRes) setGpu(gpuRes);
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
    const interval = setInterval(cargarDatos, 12000); // Refresco suave
    return () => clearInterval(interval);
  }, []);

  // Animación de entrada GSAP
  useEffect(() => {
    if (!cargando && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [cargando]);

  const handleLogout = async () => {
    await api.logout();
    setAutenticado(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de Navegación */}
      <Navbar
        apiConectada={apiConectada}
        autenticado={autenticado}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner de Contexto */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl uppercase">
                Panel de Monitoreo Agrícola
              </h2>
              <p className="mt-1 text-sm font-semibold text-stone-600 max-w-2xl">
                Supervisión fotográfica en vivo, telemetría y diagnósticos de la unidad de campo Tlahuicole.
              </p>
            </div>
            <div className="neo-badge text-xs px-3.5 py-1 bg-white text-stone-900 self-start sm:self-auto">
              Operación Autónoma
            </div>
          </div>
        </div>

        {/* Rejilla de Módulos Neo-Brutalistas */}
        <div ref={containerRef} className="space-y-8">
          
          {/* 1. Unidad Física de Campo Tlahuicole (ESP32 + Raspberry Pi + Cámara) */}
          <TlahuicoleSection tlahuicole={tlahuicole} />

          {/* 2. Cámara en Tiempo Real (Stream MJPEG + Inferencia IA) */}
          <LiveCameraSection analisisTexto={tlahuicole?.analisis || "Sin resultados"} />

          {/* 3. Métricas y Telemetría de Sensores de Suelo y Ambiente */}
          <TelemetrySection sensoresTexto={tlahuicole?.sensores || "Sin datos"} />

          {/* 4. Informes y Reportes Agronómicos en PDF con Fases e Imágenes */}
          <ReportsSection reportesIniciales={reportes} />

          {/* 5. Aceleración por Hardware (GPU NVIDIA RTX 4050 / PyTorch) */}
          <GpuDiagnosticCard gpu={gpu} />

        </div>
      </main>

      {/* Pie de Página */}
      <footer className="border-t-2 border-stone-900 bg-white py-6 mt-16 text-xs font-bold text-stone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>TLALIXMATI — Sistema Inteligente de Monitoreo Agrícola</span>
          <span className="font-mono text-stone-500">Unidad de Campo: Tlahuicole</span>
        </div>
      </footer>

      {/* Modal de Acceso por Contraseña Global */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => setAutenticado(true)}
      />
    </div>
  );
}
