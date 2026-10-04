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
        { opacity: 0, y: 16, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
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
            duration: 0.25,
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
            { x: -10 },
            { x: 0, duration: 0.38, ease: "elastic.out(1, 0.4)" }
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
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-10 bg-[#0d0d0f] text-[#cbd5e1]">

      {/* Barra superior */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#000000] border border-[#32323a] flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
              <path d="M8 12l4-6h8l4 6-2 13H10z" fill="#e2e8f0" />
              <path d="M9 13h14l-2 7H11z" fill="#161618" />
            </svg>
          </div>
          <span className="text-[1.1rem] font-bold tracking-[-0.04em] heading-chunky text-[#e2e8f0]">
            Tlalixmati
          </span>
        </div>

        <div className="flex items-center gap-2 font-data text-[0.7rem] font-semibold text-[#64748b]">
          <span className={`w-1.5 h-1.5 rounded-full ${apiConectada ? "bg-[#94a3b8] animate-pulse" : "bg-[#475569]"}`} />
          <span>{apiConectada ? "Servicio Activo" : "Conectando..."}</span>
        </div>
      </div>

      {/* Tarjeta Central */}
      <div ref={cardRef} className="max-w-sm w-full mx-auto my-auto py-8">
        <div className="bg-[#161618] rounded-3xl border border-[#252528] p-8 sm:p-10 shadow-2xl">

          <div className="mb-7">
            <div className="w-14 h-14 rounded-2xl bg-[#101012] border border-[#32323a] flex items-center justify-center text-[#94a3b8] mb-5">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.04em] heading-chunky text-[#e2e8f0]">
              Acceso al Tablero
            </h2>
            <p className="text-sm text-[#64748b] mt-1.5 leading-relaxed font-friendly">
              Introduce la clave para desbloquear el monitoreo de campo y la visión en vivo.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl text-sm flex items-start gap-3 bg-[#1c1c1f] border border-[#4a4a55] text-[#e2e8f0] font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#94a3b8]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-data text-[0.65rem] font-semibold text-[#64748b] uppercase tracking-[0.1em] mb-2.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Escribe la contraseña"
                  required
                  autoFocus
                  disabled={cargando}
                  className="w-full px-4 py-3.5 pr-12 text-sm bg-[#101012] rounded-xl border-2 border-[#252528] text-[#e2e8f0] placeholder:text-[#475569] font-friendly font-medium focus:outline-none focus:border-[#64748b] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#64748b] hover:text-[#cbd5e1] transition-colors"
                  tabIndex={-1}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !password.trim()}
              className="btn-black w-full py-3.5 text-[0.9rem] justify-center"
            >
              <span>{cargando ? "Verificando..." : "Desbloquear Tablero"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-[#252528] flex items-center justify-center gap-2 font-data text-[0.65rem] font-semibold text-[#475569]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Sesión protegida con cookie cifrada</span>
          </div>
        </div>
      </div>

      {/* Pie discreto */}
      <div className="text-center font-data text-[0.65rem] font-semibold text-[#334155]">
        Tlalixmati &copy; {new Date().getFullYear()} — Plataforma de Monitoreo Agrícola
      </div>
    </div>
  );
}
