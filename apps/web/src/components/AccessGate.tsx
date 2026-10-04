"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lock, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import gsap from "gsap";
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

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 14, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError(null);
    setCargando(true);

    try {
      const res = await api.login(password);
      if (res.autenticado) {
        setPassword("");
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.3,
            ease: "power2.in",
            onComplete: onLoginSuccess,
          });
        } else {
          onLoginSuccess();
        }
      } else {
        setError(res.mensaje || "Contraseña de acceso incorrecta.");
        if (cardRef.current) {
          gsap.fromTo(
            cardRef.current,
            { x: -6 },
            { x: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" }
          );
        }
      }
    } catch {
      setError("No se pudo conectar con el servidor de autenticación.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-10 bg-[#fafafa] text-[#18181b]">
      {/* Barra superior discreta */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#18181b] flex items-center justify-center text-white">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-[-0.02em] font-display">
            Tlalixmati
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#71717a]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${apiConectada ? "bg-[#15803d]" : "bg-[#a1a1aa]"}`}
          />
          <span>{apiConectada ? "En línea" : "Conectando..."}</span>
        </div>
      </div>

      {/* Tarjeta Central Minimalista */}
      <div ref={cardRef} className="max-w-sm w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-2xl border border-[rgba(24,24,27,0.08)] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#f4f4f5] border border-[rgba(24,24,27,0.06)] flex items-center justify-center text-[#18181b] mb-4">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#18181b] font-display">
              Acceso al Sistema
            </h2>
            <p className="text-xs text-[#71717a] mt-1 leading-relaxed">
              Ingrese la clave del sistema para desbloquear el tablero y la telemetría en directo.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-xs flex items-start gap-2 bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.18)] text-[#b91c1c]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#71717a] uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Clave de acceso"
                  required
                  autoFocus
                  disabled={cargando}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white rounded-lg border border-[rgba(24,24,27,0.14)] text-[#18181b] placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#18181b] focus:ring-1 focus:ring-[#18181b] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#a1a1aa] hover:text-[#18181b] transition-colors"
                  tabIndex={-1}
                >
                  {mostrarPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !password.trim()}
              className="btn-graphite w-full py-2.5 text-xs font-semibold"
            >
              <span>{cargando ? "Verificando..." : "Desbloquear Tablero"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[rgba(24,24,27,0.06)] flex items-center justify-center gap-1.5 text-[11px] text-[#a1a1aa]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#71717a]" />
            <span>Sesión cifrada con cookie segura</span>
          </div>
        </div>
      </div>

      {/* Pie de página discreto */}
      <div className="text-center text-[11px] text-[#a1a1aa]">
        Tlalixmati Plataforma Agrícola &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
