"use client";

import React from "react";
import { LogOut, RefreshCw, Layers, Video, Activity, Cpu, FileText } from "lucide-react";

export type VistaTab = "panorama" | "camara" | "telemetria" | "hardware" | "informes";

interface NavbarProps {
  apiConectada: boolean;
  autenticado: boolean;
  vistaActiva: VistaTab;
  onCambiarVista: (vista: VistaTab) => void;
  onRefresh?: () => void;
  onLogout: () => void;
}

export function Navbar({
  apiConectada,
  autenticado,
  vistaActiva,
  onCambiarVista,
  onRefresh,
  onLogout,
}: NavbarProps) {
  const tabs: { id: VistaTab; label: string; icon: React.ReactNode }[] = [
    { id: "panorama", label: "Panorama", icon: <Layers className="w-4 h-4" /> },
    { id: "camara", label: "Cámara & Visión", icon: <Video className="w-4 h-4" /> },
    { id: "telemetria", label: "Telemetría", icon: <Activity className="w-4 h-4" /> },
    { id: "hardware", label: "Hardware", icon: <Cpu className="w-4 h-4" /> },
    { id: "informes", label: "Bitácora & Reportes", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#121215]/95 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Identidad de Marca: Sin TM, Tipografía Gruesa y Amigable */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Isotipo: Casco robótico en negro puro y blanco */}
          <div className="w-9 h-9 rounded-xl bg-[#000000] border border-[#2e2e33] flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
              <path d="M8 12l4-6h8l4 6-2 13H10z" fill="#ffffff" />
              <path d="M9 13h14l-2 7H11z" fill="#18181b" />
            </svg>
          </div>
          
          <span className="text-xl font-extrabold tracking-tight heading-chunky text-[#ffffff]">
            Tlalixmati
          </span>

          {/* Indicador de Estado en Gris y Negro */}
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-[#27272a]">
            <span
              className={`w-2 h-2 rounded-full ${
                apiConectada ? "bg-[#ffffff] animate-pulse" : "bg-gray-600"
              }`}
            />
            <span className="text-xs font-bold text-gray-400">
              {apiConectada ? "En línea" : "Desconectado"}
            </span>
          </div>
        </div>

        {/* Control Segmentado Central en Gris Carbón y Negro */}
        {autenticado && (
          <nav className="hidden lg:flex items-center">
            <div className="segmented-track-mono">
              {tabs.map((tab) => {
                const isActive = vistaActiva === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onCambiarVista(tab.id)}
                    className={`segmented-item-mono ${isActive ? "active" : ""}`}
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
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Refrescar Datos */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1f1f24] border border-transparent hover:border-[#2e2e33] transition-colors"
              title="Actualizar datos"
              aria-label="Actualizar datos del sistema"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Cerrar Sesión */}
          {autenticado && (
            <button
              onClick={onLogout}
              className="btn-outline-gray text-xs py-1.5 px-3"
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
        <div className="lg:hidden px-4 pb-3 overflow-x-auto bg-[#121215] border-t border-[#222226]">
          <div className="segmented-track-mono w-full justify-between">
            {tabs.map((tab) => {
              const isActive = vistaActiva === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onCambiarVista(tab.id)}
                  className={`segmented-item-mono flex-1 justify-center py-2 px-2 text-xs ${
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
