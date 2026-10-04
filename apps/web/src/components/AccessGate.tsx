"use client";

import React, { useState } from "react";
import { Sprout, Lock, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

interface AccessGateProps {
  apiConectada: boolean;
  onLoginSuccess: () => void;
}

export function AccessGate({ apiConectada, onLoginSuccess }: AccessGateProps) {
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError(null);
    setCargando(true);

    try {
      const res = await api.login(password);
      if (res.autenticado) {
        setPassword("");
        onLoginSuccess();
      } else {
        setError(res.mensaje || "Contraseña de acceso incorrecta.");
      }
    } catch {
      setError("No se pudo conectar con el servidor de autenticación.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Barra superior mínima de estado */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-xs">
            <Sprout className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-stone-900">Tlalixmati</span>
            <span className="ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
              Campo
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border border-stone-200 bg-white/80 shadow-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              apiConectada ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
            }`}
          />
          <span className="text-stone-600">
            {apiConectada ? "Servicio Activo" : "Conectando..."}
          </span>
        </div>
      </div>

      {/* Tarjeta Central de Control de Acceso */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/50 p-7 sm:p-9 relative overflow-hidden">
          {/* Acento visual superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-emerald-600 to-stone-700" />

          {/* Encabezado del Gatekeeper */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-100">
              <Lock className="h-6 w-6 text-emerald-800" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900">
                Acceso al Tablero
              </h2>
              <p className="text-xs text-stone-500">
                Identificación requerida para consultar el cultivo
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed mb-6">
            El monitoreo fotogramétrico en vivo, las lecturas sensoriales de suelo y los informes agronómicos están protegidos. Ingrese la contraseña del sistema para desbloquear el tablero.
          </p>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Contraseña del Sistema
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese la contraseña"
                  required
                  autoFocus
                  disabled={cargando}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all bg-stone-50/50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                >
                  {mostrarPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !password.trim()}
              className="w-full py-3 px-4 organic-btn bg-emerald-900 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-900/10 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{cargando ? "Verificando Credenciales..." : "Desbloquear Tablero"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Aviso de Seguridad */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-center space-x-2 text-[11px] text-stone-400">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Sesión cifrada con cookie segura HttpOnly (7 días)</span>
          </div>
        </div>
      </div>

      {/* Pie de Página */}
      <div className="text-center text-[11px] text-stone-400">
        Tlalixmati © {new Date().getFullYear()} — Plataforma Inteligente de Monitoreo Agrícola
      </div>
    </div>
  );
}
