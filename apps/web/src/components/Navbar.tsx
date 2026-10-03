"use client";

import React from "react";
import { Sprout, Activity, ShieldCheck, LogIn, LogOut, Cpu } from "lucide-react";

interface NavbarProps {
  apiConectada: boolean;
  autenticado: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export function Navbar({ apiConectada, autenticado, onOpenLogin, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Marca y Subtítulo */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
            <Sprout className="h-6 w-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">Tlalixmati</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono font-medium">v0.1.0</span>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">
              Plataforma Inteligente de Monitoreo Agrícola
            </p>
          </div>
        </div>

        {/* Indicadores y Acciones */}
        <div className="flex items-center space-x-3">
          {/* Indicador de API */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 bg-stone-50">
            <span
              className={`h-2 w-2 rounded-full ${
                apiConectada ? "bg-emerald-500 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className="text-stone-700">
              API {apiConectada ? "Conectada" : "Desconectada"}
            </span>
          </div>

          {/* Botón de Autenticación */}
          {autenticado ? (
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 smooth-transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5 text-stone-500" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm smooth-transition cursor-pointer"
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
