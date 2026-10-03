"use client";

import React, { useState } from "react";
import { Lock, X, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await api.login(password);
      if (res.autenticado) {
        setPassword("");
        onSuccess();
        onClose();
      } else {
        setError(res.mensaje || "Contraseña de acceso incorrecta.");
      }
    } catch {
      setError("Error al comunicarse con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border-2 border-stone-900 shadow-[6px_6px_0px_0px_#1C1917] max-w-sm w-full p-6 relative">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="neo-button absolute top-4 right-4 p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 rounded-2xl bg-emerald-200 border-2 border-stone-900 text-emerald-950 shadow-[2px_2px_0px_0px_#1C1917]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-stone-900 uppercase">Acceso al Sistema</h3>
            <p className="text-xs font-semibold text-stone-500">Contraseña global de Tlalixmati</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl border-2 border-stone-900 bg-red-100 text-xs font-bold text-red-950 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-700" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-stone-900 uppercase mb-1.5">
              Contraseña Global
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña de administración"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-stone-900 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-[2px_2px_0px_0px_#1C1917]"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 px-4 neo-button bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs uppercase flex items-center justify-center space-x-2 shadow-[3px_3px_0px_0px_#1C1917] disabled:opacity-50"
          >
            <span>{cargando ? "Verificando..." : "Ingresar a Tlalixmati"}</span>
            <ArrowRight className="h-4 w-4 text-emerald-200" />
          </button>
        </form>

        <p className="text-[11px] font-semibold text-stone-500 text-center mt-4">
          Sesión asegurada con cookie HttpOnly de 7 días.
        </p>
      </div>
    </div>
  );
}
