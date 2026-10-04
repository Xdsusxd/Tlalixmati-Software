"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface LoadingHeroStageProps {
  onComplete: () => void;
  mensajeCarga?: string;
}

export function LoadingHeroStage({
  onComplete,
  mensajeCarga = "Iniciando plataforma agronómica...",
}: LoadingHeroStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<SVGSVGElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [pasoTexto, setPasoTexto] = useState("Inicializando subsistemas...");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.45,
            ease: "power2.inOut",
            onComplete,
          });
        },
      });

      // 1. Aparición sutil del isotipo y tipografía
      tl.fromTo(
        markRef.current,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
      )
        .fromTo(
          [titleRef.current, subtitleRef.current],
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
          "-=0.3"
        )
        // 2. Barra de carga de precisión
        .fromTo(
          barRef.current,
          { width: "0%" },
          {
            width: "100%",
            duration: 1.2,
            ease: "power1.inOut",
            onUpdate: function () {
              const prog = this.progress();
              if (prog > 0.65) {
                setPasoTexto("Sincronizando telemetría de campo...");
              } else if (prog > 0.3) {
                setPasoTexto("Verificando nodo óptico Tlahuicole...");
              }
            },
          },
          "-=0.2"
        )
        .to(statusRef.current, { opacity: 0.5, duration: 0.2 });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-[#f4f4f5] select-none"
    >
      <div className="flex flex-col items-center max-w-xs w-full px-6 text-center">
        {/* Isotipo de Precisión (Apple-inspired vector emblem) */}
        <div className="mb-6 relative">
          <svg
            ref={markRef}
            className="w-12 h-12 text-white"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Lente focal y retícula sensorial */}
            <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.18)" />
            <circle cx="24" cy="24" r="8" stroke="rgba(255,255,255,0.85)" strokeWidth="1.75" />
            <path d="M24 6v4" stroke="rgba(255,255,255,0.4)" />
            <path d="M24 38v4" stroke="rgba(255,255,255,0.4)" />
            <path d="M6 24h4" stroke="rgba(255,255,255,0.4)" />
            <path d="M38 24h4" stroke="rgba(255,255,255,0.4)" />
            {/* Vértice de cultivo botánico sutil */}
            <path d="M24 16c2 4 4 6 4 8s-1.79 4-4 4-4-2-4-4 2-4 4-8z" fill="rgba(255,255,255,0.95)" stroke="none" />
          </svg>
        </div>

        {/* Título de Marca Editorial */}
        <h1
          ref={titleRef}
          className="text-2xl font-semibold tracking-[-0.03em] text-[#fafafa] font-display"
        >
          Tlalixmati
        </h1>
        <p
          ref={subtitleRef}
          className="text-xs text-[#a1a1aa] mt-1 font-medium tracking-normal"
        >
          Plataforma de Monitoreo & Robótica de Campo
        </p>

        {/* Barra de progreso milimétrica */}
        <div className="w-full h-[2px] bg-[rgba(255,255,255,0.08)] rounded-full mt-7 overflow-hidden relative">
          <div
            ref={barRef}
            className="h-full bg-white rounded-full"
            style={{ width: "0%" }}
          />
        </div>

        {/* Micro-estado de inicialización */}
        <div
          ref={statusRef}
          className="text-[11px] text-[#71717a] mt-3 font-mono tracking-tight"
        >
          {pasoTexto}
        </div>
      </div>
    </div>
  );
}
