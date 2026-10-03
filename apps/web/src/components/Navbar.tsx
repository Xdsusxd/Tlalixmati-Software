"use client";

import React from "react";
import { Sprout, LogIn, LogOut, Radio } from "lucide-react";

interface NavbarProps {
  apiConectada: boolean;
  autenticado: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export function Navbar({ apiConectada, autenticado, onOpenLogin, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-900 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Identidad de Marca */}
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center border-2 border-stone-900 shadow-[3px_3px_0px_0px_#1C1917]">
            <Sprout className="h-6 w-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-stone-900 uppercase">Tlalixmati</h1>
              <span className="neo-badge text-[11px] px-2.5 py-0.5 bg-emerald-100 text-emerald-900">
                v0.1.0
              </span>
            </div>
            <p className="text-xs text-stone-600 font-semibold hidden sm:block">
              Plataforma Inteligente de Monitoreo Agrícola
            </p>
          </div>
        </div>

        {/* Estado y Acceso */}
        <div className="flex items-center space-x-3">
          {/* Indicador de Conexión de API */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border-2 border-stone-900 bg-stone-50 shadow-[2px_2px_0px_0px_#1C1917]">
            <span
              className={`h-2.5 w-2.5 rounded-full border border-stone-900 ${
                apiConectada ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-xs font-bold text-stone-800">
              API {apiConectada ? "EN LÍNEA" : "OFFLINE"}
            </span>
          </div>

          {/* Autenticación */}
          {autenticado ? (
            <button
              onClick={onLogout}
              className="neo-button flex items-center space-x-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold"
              title="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="neo-button flex items-center space-x-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-[3px_3px_0px_0px_#1C1917]"
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
