"use client";

import React from "react";
import { Cpu, LogIn, LogOut } from "lucide-react";

interface NavbarProps {
  apiConectada: boolean;
  autenticado: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export function Navbar({
  apiConectada,
  autenticado,
  onOpenLogin,
  onLogout,
}: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Identidad de la Plataforma */}
        <div className="flex items-center space-x-3">
          {/* Isotipo: Casco robótico azul según especificación del prompt */}
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#045fd8" }}
          >
            <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
              <path d="M8 12l4-6h8l4 6-2 13H10z" fill="#ffffff" />
              <path d="M9 13h14l-2 7H11z" fill="#091f39" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-base font-bold tracking-tight text-gray-900"
                style={{ letterSpacing: "-0.025em" }}
              >
                Tlalixmati
                <sup
                  className="text-[10px] font-semibold ml-0.5"
                  style={{ color: "#0069e9" }}
                >
                  TM
                </sup>
              </h1>
              <span className="badge-blue hidden sm:inline-flex">
                <Cpu className="h-3 w-3" />
                Robótica Agrícola
              </span>
            </div>
            <p className="text-[10px] text-gray-500 hidden sm:block">
              Monitoreo Fitosanitario y Robótica de Campo
            </p>
          </div>
        </div>

        {/* Estado y Autenticación */}
        <div className="flex items-center gap-2.5">
          {/* Indicador de Conexión minimalista */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
            style={{
              background: apiConectada ? "rgba(0, 105, 233, 0.06)" : "#f3f4f6",
              borderColor: apiConectada ? "rgba(0, 105, 233, 0.20)" : "#e5e7eb",
              color: apiConectada ? "#055bd3" : "#6b7280",
            }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${apiConectada ? "animate-pulse" : ""}`}
              style={{ background: apiConectada ? "#0069e9" : "#9ca3af" }}
            />
            <span>{apiConectada ? "Servicio Activo" : "Sin Conexión"}</span>
          </div>

          {/* Autenticación */}
          {autenticado ? (
            <button
              onClick={onLogout}
              className="btn-secondary"
              title="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="btn-primary"
              title="Acceder al sistema"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Acceder</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
