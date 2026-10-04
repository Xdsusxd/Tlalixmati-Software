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
        { opacity: 0, y: 14, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out" }
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
            y: -8,
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
            { x: -8 },
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
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-10 bg-[#f8f8fa] text-[#111111]">
      {/* Barra superior */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
              <path d="M8 12l4-6h8l4 6-2 13H10z" fill="#ffffff" />
              <path d="M9 13h14l-2 7H11z" fill="#111111" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight heading-chunky text-[#111111]">
            Tlalixmati
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <span
            className={`w-2 h-2 rounded-full ${apiConectada ? "bg-[#111111]" : "bg-gray-300"}`}
          />
          <span>{apiConectada ? "Servicio Activo" : "Conectando..."}</span>
        </div>
      </div>

      {/* Tarjeta Central de Acceso (Monocromática y Amigable) */}
      <div ref={cardRef} className="max-w-sm w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-9 shadow-xs">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-[#111111] mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[#111111] heading-chunky">
              Acceso al Tablero
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
              Introduce la clave para desbloquear el monitoreo de campo y la visión en vivo.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 bg-gray-100 border border-gray-300 text-[#111111] font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#111111]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
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
                  className="w-full px-4 py-3 pr-11 text-sm bg-white rounded-xl border-2 border-gray-200 text-[#111111] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#111111] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#111111] transition-colors"
                  tabIndex={-1}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !password.trim()}
              className="btn-black w-full py-3 text-sm justify-center font-extrabold"
            >
              <span>{cargando ? "Verificando..." : "Desbloquear Tablero"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400">
            <ShieldCheck className="w-4 h-4 text-gray-600" />
            <span>Sesión protegida con cookie cifrada</span>
          </div>
        </div>
      </div>

      {/* Pie de página discreto */}
      <div className="text-center text-xs font-semibold text-gray-400">
        Tlalixmati &copy; {new Date().getFullYear()} — Plataforma de Monitoreo Agrícola
      </div>
    </div>
  );
}
