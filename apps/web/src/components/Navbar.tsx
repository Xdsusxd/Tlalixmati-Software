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
    { id: "panorama",   label: "Panorama",           icon: <Layers   className="w-4 h-4" /> },
    { id: "camara",     label: "Cámara & Visión",     icon: <Video    className="w-4 h-4" /> },
    { id: "telemetria", label: "Telemetría",           icon: <Activity className="w-4 h-4" /> },
    { id: "hardware",   label: "Hardware",             icon: <Cpu      className="w-4 h-4" /> },
    { id: "informes",   label: "Bitácora & Reportes", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#111113]/95 backdrop-blur-md border-b border-[#252528]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-4">

        {/* Marca */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Isotipo */}
          <div className="w-9 h-9 rounded-xl bg-[#000000] border border-[#32323a] flex items-center justify-center shadow-sm shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
              <path d="M8 12l4-6h8l4 6-2 13H10z" fill="#e2e8f0" />
              <path d="M9 13h14l-2 7H11z" fill="#161618" />
            </svg>
          </div>

          <span className="text-[1.1rem] font-bold tracking-[-0.04em] heading-chunky text-[#e2e8f0]">
            Tlalixmati
          </span>

          {/* Indicador API */}
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-[#252528]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiConectada ? "bg-[#94a3b8] animate-pulse" : "bg-[#475569]"
              }`}
            />
            <span className="font-data text-[0.7rem] font-semibold text-[#64748b]">
              {apiConectada ? "En línea" : "Desconectado"}
            </span>
          </div>
        </div>

        {/* Nav Segmentada Central */}
        {autenticado && (
          <nav className="hidden lg:flex items-center">
            <div className="segmented-track-mono">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onCambiarVista(tab.id)}
                  className={`segmented-item-mono ${vistaActiva === tab.id ? "active" : ""}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Utilidades derecha */}
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn-icon"
              title="Actualizar datos"
              aria-label="Actualizar datos del sistema"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {autenticado && (
            <button
              onClick={onLogout}
              className="btn-outline-gray text-sm"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>

      {/* Navegación móvil inferior */}
      {autenticado && (
        <div className="lg:hidden px-3 pb-2.5 overflow-x-auto bg-[#111113] border-t border-[#1c1c1f]">
          <div className="segmented-track-mono w-full justify-between">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onCambiarVista(tab.id)}
                className={`segmented-item-mono flex-1 justify-center py-2 px-1.5 text-xs ${
                  vistaActiva === tab.id ? "active" : ""
                }`}
              >
                {tab.icon}
                <span className="truncate hidden xs:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
