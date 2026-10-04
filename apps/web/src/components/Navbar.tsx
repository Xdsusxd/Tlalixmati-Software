"use client";

import React from "react";
import { Sprout, LogIn, LogOut } from "lucide-react";

interface NavbarProps {
  apiConectada: boolean;
  autenticado: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export function Navbar({ apiConectada, autenticado, onOpenLogin, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Identidad de la Plataforma */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-xs">
            <Sprout className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-stone-900">Tlalixmati</h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                Agrícola
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Monitoreo Inteligente de Cultivo en Campo
            </p>
          </div>
        </div>

        {/* Estado y Acciones */}
        <div className="flex items-center space-x-3">
          {/* Indicador de Conexión */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border border-stone-200 bg-stone-50/80">
            <span
              className={`h-2 w-2 rounded-full ${
                apiConectada ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
              }`}
            />
            <span className="text-stone-700">
              {apiConectada ? "Servicio Conectado" : "Esperando Servicio"}
            </span>
          </div>

          {/* Autenticación */}
          {autenticado ? (
            <button
              onClick={onLogout}
              className="organic-btn flex items-center space-x-1.5 px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200"
              title="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="organic-btn flex items-center space-x-1.5 px-4 py-1.5 text-xs text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl shadow-xs"
            >
              <LogIn className="h-3.5 w-3.5 text-emerald-200" />
              <span>Acceder</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
