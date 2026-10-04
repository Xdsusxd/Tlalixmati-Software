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
    { id: "panorama", label: "Panorama", icon: <Layers className="w-4 h-4" /> },
    { id: "camara", label: "Cámara & Visión", icon: <Video className="w-4 h-4" /> },
    { id: "telemetria", label: "Telemetría", icon: <Activity className="w-4 h-4" /> },
    { id: "hardware", label: "Hardware", icon: <Cpu className="w-4 h-4" /> },
    { id: "informes", label: "Bitácora & Reportes", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Identidad de Marca: Tipografía Gruesa y Amigable */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Isotipo: Casco robótico en negro y blanco */}
          <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
              <path d="M8 12l4-6h8l4 6-2 13H10z" fill="#ffffff" />
              <path d="M9 13h14l-2 7H11z" fill="#111111" />
            </svg>
          </div>
          
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold tracking-tight heading-chunky text-[#111111]">
              Tlalixmati
            </span>
            <sup className="text-xs font-bold text-gray-400">TM</sup>
          </div>

          {/* Indicador de Estado en Monocromo (Punto negro/gris) */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-200">
            <span
              className={`w-2 h-2 rounded-full ${
                apiConectada ? "bg-[#111111] animate-pulse" : "bg-gray-300"
              }`}
            />
            <span className="text-xs font-bold text-gray-500">
              {apiConectada ? "En línea" : "Desconectado"}
            </span>
          </div>
        </div>

        {/* Control Segmentado Central (Blanco, Negro y Gris) */}
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
          {/* Tag de Cultivo Activo (Monocromo) */}
          {cultivoNombre && (
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
              <span className="truncate max-w-[140px]">{cultivoNombre}</span>
            </div>
          )}

          {/* Refrescar Datos */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl text-gray-600 hover:text-[#111111] hover:bg-gray-100 transition-colors"
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
        <div className="lg:hidden px-4 pb-3 overflow-x-auto">
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
