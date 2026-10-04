"use client";

import React, { useEffect, useState } from "react";

interface LoadingHeroStageProps {
  onComplete: () => void;
  mensajeCarga?: string;
}

export function LoadingHeroStage({
  onComplete,
  mensajeCarga = "Iniciando sistema Tlalixmati...",
}: LoadingHeroStageProps) {
  const [animando, setAnimando] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setAnimando(false);
      onComplete();
      return;
    }

    // Transición automática al finalizar la coreografía de entrada
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`hero-stage ${animando ? "is-entering" : ""}`}
      aria-label="Tlalixmati Plataforma de Monitoreo y Robótica Agrícola"
    >
      {/* 1. Título de Marca */}
      <h1 className="hero-brand">
        Tlalixmati<sup>TM</sup>
      </h1>

      {/* 2. SVG: Casco Robótico — Colores exactos del prompt original (Azul + Blanco) */}
      <svg
        className="hero-robot"
        viewBox="0 0 660 680"
        role="img"
        aria-labelledby="robotTitle robotDescription"
      >
        <title id="robotTitle">Tlalixmati Casco Robótico</title>
        <desc id="robotDescription">
          Casco robótico futurista blanco con visor azul marino profundo y costuras azules.
        </desc>

        <defs>
          {/* Shell: blanco puro exacto del prompt */}
          <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="56%" stopColor="#fbfbfb" />
            <stop offset="100%" stopColor="#f0f1f2" />
          </linearGradient>

          {/* Visor: azul marino profundo exacto del prompt */}
          <linearGradient id="visor" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#0c2b4e" />
            <stop offset="100%" stopColor="#071d35" />
          </linearGradient>

          {/* Sombra suave de borde exacto del prompt */}
          <filter id="softEdge" x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.15" result="blur" />
            <feOffset dy="1" result="offset" />
            <feColorMatrix
              in="offset"
              type="matrix"
              values="0 0 0 0 0.02 0 0 0 0 0.17 0 0 0 0 0.39 0 0 0 .14 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#softEdge)">
          {/* Paneles traseros de la corona */}
          <path
            className="piece rear-left"
            fill="url(#shell)"
            d="M72 256c-9-36-5-55 10-76l47-63c15-14 35-20 59-12l49-15 31 152-4 46-177 12z"
          />
          <path
            className="piece rear-right"
            fill="url(#shell)"
            d="M588 256c9-36 5-55-10-76l-47-63c-15-14-35-20-59-12l-49-15-31 152 4 46 177 12z"
          />

          {/* Módulos laterales con azul #0864d9 exacto del prompt */}
          <g className="piece ear-left">
            <path
              fill="url(#shell)"
              d="M63 251c-19 6-40 20-51 37C4 300 0 314 0 330v108c0 26 13 47 36 60l25 14 10-50 7-87z"
            />
            <path
              fill="#0864d9"
              d="M14 322c0-8 5-14 10-14s10 6 10 14v101c0 8-5 14-10 14s-10-6-10-14z"
            />
          </g>

          <g className="piece ear-right">
            <path
              fill="url(#shell)"
              d="M597 251c19 6 40 20 51 37 8 12 12 26 12 42v108c0 26-13 47-36 60l-25 14-10-50-7-87z"
            />
            <path
              fill="#0864d9"
              d="M626 322c0-8 5-14 10-14s10 6 10 14v101c0 8-5 14-10 14s-10-6-10-14z"
            />
          </g>

          {/* Mandíbula */}
          <path
            className="piece jaw-left"
            fill="url(#shell)"
            d="M69 385l82 61 48 178-101-65c-22-14-33-35-35-63z"
          />
          <path
            className="piece jaw-right"
            fill="url(#shell)"
            d="M591 385l-82 61-48 178 101-65c22-14 33-35 35-63z"
          />
          <path
            className="piece jaw-center"
            fill="url(#shell)"
            d="M151 437l45 27 24 170 30 28q7 11 20 11h120q13 0 20-11l30-28 24-170 45-27-6-34-88 38H265l-108-38z"
          />

          {/* Costuras azules exactas #0864d9 */}
          <g className="piece seams">
            <path fill="#0864d9" d="M70 407l91 61 54 166-10-7-53-153-82-55z" />
            <path fill="#0864d9" d="M590 407l-91 61-54 166 10-7 53-153 82-55z" />
          </g>

          {/* Visor exacto del prompt */}
          <path
            className="piece visor"
            fill="url(#visor)"
            d="M91 227c-18-4-30 8-28 28l15 111c2 14 8 24 20 32l73 45c5 4 12 6 19 6h280c7 0 14-2 19-6l73-45c12-8 18-18 20-32l15-111c2-20-10-32-28-28l-145 31c-35 7-60 11-94 11s-59-4-94-11z"
          />

          {/* Cresta superior con azul #0864d9 */}
          <g className="piece crown-fin">
            <g transform="translate(26.4 0) scale(.92 1)">
              <path
                fill="url(#shell)"
                stroke="#0864d9"
                strokeWidth="7"
                strokeLinejoin="round"
                d="M309 0h42c14 0 23 7 29 20l34 70c5 10 6 18 4 30l-28 141c-3 15-10 20-24 20h-72c-14 0-21-5-24-20l-28-141c-2-12-1-20 4-30l34-70c6-13 15-20 29-20z"
              />
              <path fill="#0864d9" d="M309 0h42v201c0 14-9 23-21 23s-21-9-21-23z" />
            </g>
          </g>

          {/* Detalles ópticos frontales */}
          <g className="piece face-details">
            <path fill="#ffffff" d="M151 354h109v20H151z" />
            <path fill="#ffffff" d="M399 360l105-28 5 20-105 28z" />
            <rect x="276" y="522" width="108" height="18" rx="9" fill="url(#visor)" />
            <rect x="276" y="549" width="108" height="18" rx="9" fill="url(#visor)" />
          </g>
        </g>
      </svg>

      {/* 3. Subtítulo */}
      <p className="hero-studio">Robotics Studio</p>

      {/* 4. Línea de borde del prompt original */}
      <span className="hero-edge-line" aria-hidden="true"></span>

      {/* 5. Indicador discreto de carga inferior (sin botones intrusivos) */}
      <div className="hero-footer-bar">
        <div className="flex items-center space-x-2 text-xs" style={{ color: "rgba(202,226,249,0.85)" }}>
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "#ffffff" }}
          />
          <span className="tracking-wide">{mensajeCarga}</span>
        </div>
      </div>
    </div>
  );
}
