"use client";

import React from "react";
import { LogOut, RefreshCw, Layers, Video, Activity, Cpu, FileText } from "lucide-react";

export type VistaTab = "panorama" | "camara" | "telemetria" | "hardware" | "informes";

interface NavbarProps {
  apiConectada: boolean;
  autenticado: boolean;
  vistaActiva: VistaTab;
  onCambiarVista: (vista: VistaTab) => void;
  cultivoNombre?: string;
  onRefresh?: () => void;
  onLogout: () => void;
}

export function Navbar({
  apiConectada,
  autenticado,
  vistaActiva,
  onCambiarVista,
  cultivoNombre,
  onRefresh,
  onLogout,
}: NavbarProps) {
  const tabs: { id: VistaTab; label: string; icon: React.ReactNode }[] = [
    { id: "panorama", label: "Panorama", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "camara", label: "Cámara & Visión", icon: <Video className="w-3.5 h-3.5" /> },
    { id: "telemetria", label: "Telemetría", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "hardware", label: "Hardware", icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: "informes", label: "Bitácora & Reportes", icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fbfbfb]/90 backdrop-blur-md border-b border-[rgba(24,24,27,0.07)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Identidad de Marca */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[#18181b] flex items-center justify-center text-white shadow-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-[-0.03em] font-display text-[#18181b]">
              Tlalixmati
            </span>
            <span className="hidden md:inline text-[11px] text-[#a1a1aa] font-medium">
              Studio
            </span>
          </div>

          {/* Micro-indicador de Conectividad */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-[rgba(24,24,27,0.08)]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiConectada ? "bg-[#15803d]" : "bg-[#a1a1aa]"
              }`}
            />
            <span className="text-[11px] font-mono text-[#71717a]">
              {apiConectada ? "En línea" : "Desconectado"}
            </span>
          </div>
        </div>

        {/* Segmented Control Central (Apple-style navigation) */}
        {autenticado && (
          <nav className="hidden lg:flex items-center">
            <div className="segmented-track">
              {tabs.map((tab) => {
                const isActive = vistaActiva === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onCambiarVista(tab.id)}
                    className={`segmented-item ${isActive ? "active" : ""}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* Utilidades de la derecha */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tag de Cultivo Activo */}
          {cultivoNombre && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f4f5] border border-[rgba(24,24,27,0.06)] text-[11px] font-medium text-[#52525b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
              <span className="truncate max-w-[130px]">{cultivoNombre}</span>
            </div>
          )}

          {/* Refrescar Datos */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-colors"
              title="Actualizar datos"
              aria-label="Actualizar datos del sistema"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Cerrar Sesión */}
          {autenticado && (
            <button
              onClick={onLogout}
              className="btn-quiet text-xs py-1.5 px-2.5"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>

      {/* Navegación móvil inferior integrada */}
      {autenticado && (
        <div className="lg:hidden px-4 pb-2.5 overflow-x-auto">
          <div className="segmented-track w-full justify-between">
            {tabs.map((tab) => {
              const isActive = vistaActiva === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onCambiarVista(tab.id)}
                  className={`segmented-item flex-1 justify-center py-1.5 px-2 text-[11px] ${
                    isActive ? "active" : ""
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
