"use client";

import React, { useState } from "react";
import { Lock, AlertCircle, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f8f9fa]">
      {/* Barra superior minimalista */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#045fd8" }}
          >
            <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
              <path d="M8 12l4-6h8l4 6-2 13H10z" fill="#ffffff" />
              <path d="M9 13h14l-2 7H11z" fill="#091f39" />
            </svg>
          </div>
          <span
            className="text-base font-bold tracking-tight text-gray-900"
            style={{ letterSpacing: "-0.025em" }}
          >
            Tlalixmati
            <sup className="text-[10px] font-semibold ml-0.5 text-[#0069e9]">TM</sup>
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
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
          {apiConectada ? "Servicio Activo" : "Conectando..."}
        </div>
      </div>

      {/* Tarjeta Central de Login */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-7 sm:p-9 shadow-xs">
          {/* Encabezado */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-3 rounded-xl shrink-0"
              style={{
                background: "rgba(0, 105, 233, 0.08)",
                border: "1px solid rgba(0, 105, 233, 0.16)",
              }}
            >
              <Lock className="h-5 w-5" style={{ color: "#0069e9" }} />
            </div>
            <div>
              <h2
                className="text-xl font-bold tracking-tight text-gray-900"
                style={{ letterSpacing: "-0.02em" }}
              >
                Acceso al Tablero
              </h2>
              <p className="text-xs text-gray-500">
                Identificación requerida para monitorear el cultivo
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-gray-600 mb-6">
            El monitoreo óptico en vivo, la telemetría del suelo y los informes agronómicos están
            protegidos. Ingrese la contraseña del sistema para desbloquear el tablero.
          </p>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl text-xs flex items-start gap-2.5 border border-red-200 bg-red-50 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0069e9] focus:ring-2 focus:ring-[#0069e9]/20 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !password.trim()}
              className="btn-primary w-full py-2.5 text-sm justify-center"
            >
              <span>{cargando ? "Verificando..." : "Desbloquear Tablero"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Aviso de Seguridad */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="h-4 w-4 text-[#0069e9]" />
            <span>Sesión cifrada con cookie segura HttpOnly</span>
          </div>
        </div>
      </div>

      {/* Pie de Página */}
      <div className="text-center text-[11px] text-gray-400">
        Tlalixmati<sup className="ml-0.5">TM</sup> © {new Date().getFullYear()} — Plataforma de Monitoreo Agrícola
      </div>
    </div>
  );
}
