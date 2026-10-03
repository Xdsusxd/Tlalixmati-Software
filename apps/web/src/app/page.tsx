"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Navbar } from "@/components/Navbar";
import { TlahuicoleSection } from "@/components/TlahuicoleSection";
import { TelemetrySection } from "@/components/TelemetrySection";
import { VisionSection } from "@/components/VisionSection";
import { GpuDiagnosticCard } from "@/components/GpuDiagnosticCard";
import { LoginModal } from "@/components/LoginModal";
import { api, GPUInfo, TlahuicoleEstado } from "@/lib/api";

export default function DashboardPage() {
  const [tlahuicole, setTlahuicole] = useState<TlahuicoleEstado | null>(null);
  const [gpu, setGpu] = useState<GPUInfo | null>(null);
  const [apiConectada, setApiConectada] = useState<boolean>(false);
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const cargarDatos = async () => {
    try {
      const [saludRes, tlahuicoleRes, gpuRes, authRes] = await Promise.all([
        api.getSalud(),
        api.getTlahuicoleEstado(),
        api.getGpuInfo(),
        api.getAuthEstado(),
      ]);

      setApiConectada(saludRes !== null);
      if (tlahuicoleRes) setTlahuicole(tlahuicoleRes);
      if (gpuRes) setGpu(gpuRes);
      setAutenticado(authRes.autenticado);
    } catch {
      setApiConectada(false);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000); // Polling suave cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  // Animación suave de entrada con GSAP
  useEffect(() => {
    if (!cargando && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [cargando]);

  const handleLogout = async () => {
    await api.logout();
    setAutenticado(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col">
      {/* Navegación Superior */}
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
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Panel de Control y Monitoreo
          </h2>
          <p className="mt-1 text-sm text-stone-600 max-w-2xl">
            Supervisión continua de la instalación agrícola y estado de la unidad física de campo.
          </p>
        </div>

        {/* Rejilla de Módulos */}
        <div ref={containerRef} className="space-y-6">
          
          {/* 1. Unidad Física Tlahuicole (Agrupación de ESP32 + Raspberry Pi + Cámara) */}
          <TlahuicoleSection tlahuicole={tlahuicole} />

          {/* 2. Métricas y Telemetría de Sensores */}
          <TelemetrySection sensoresTexto={tlahuicole?.sensores || "Sin datos"} />

          {/* 3. Visión Computacional e Inferencia de Imágenes */}
          <VisionSection analisisTexto={tlahuicole?.analisis || "Sin resultados"} />

          {/* 4. Diagnóstico de Cómputo Local (NVIDIA RTX 4050 / PyTorch) */}
          <GpuDiagnosticCard gpu={gpu} />

        </div>
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-stone-200 bg-white/70 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Tlalixmati — Sistema Autónomo de Monitoreo Agrícola</span>
          <span className="font-mono text-stone-400">Tlahuicole: ESP32 + Raspberry Pi</span>
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
