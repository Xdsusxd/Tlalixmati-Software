/**
 * Cliente API de Tlalixmati para la comunicación entre el dashboard web y FastAPI.
 */

const API_BASE_URL = typeof window !== "undefined"
  ? ""
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

export interface ComponenteEstado {
  tipo: "esp32" | "raspberry" | "camara" | "vision" | "periferico";
  identificador_hardware: string | null;
  habilitado: boolean;
  estado: string;
  ultima_comunicacion: string | null;
  mensaje: string;
}

export interface TlahuicoleEstado {
  nombre: string;
  naturaleza: string;
  estado_general: string;
  esp32: ComponenteEstado;
  raspberry: ComponenteEstado;
  camara: ComponenteEstado;
  sensores: string;
  analisis: string;
  perifericos_adicionales: ComponenteEstado[];
  resumen_operativo: string;
}

export interface GPUInfo {
  detectada: boolean;
  nombre: string | null;
  cuda_disponible: boolean;
  dispositivo_seleccionado: string;
}

export interface SaludResponse {
  estado: string;
  timestamp: string;
  version: string;
  servicios: Record<string, string>;
  componentes_activos: number;
}

export interface ReporteInfoResponse {
  id: string;
  titulo: string;
  generado_en: string;
  origen: "manual" | "automatico";
  alerta_detectada: boolean;
  tamano_bytes: number;
  nombre_archivo: string;
  fases_resumen: string;
  url_descarga: string;
  supabase_url: string | null;
  almacenado_en_supabase: boolean;
}

export interface CamaraEstadoResponse {
  conectada: boolean;
  fps: number;
  ancho: number;
  alto: number;
  resolucion: string;
  frames_totales: number;
  ultima_actualizacion: string | null;
  mensaje: string;
}

export interface AuthResponse {
  autenticado: boolean;
  mensaje: string;
}

export interface TelemetriaActual {
  conectado: boolean;
  mac: string | null;
  humedad_suelo: number | null;
  temperatura: number | null;
  radiacion: number | null;
  bateria: number | null;
  ultima_lectura: string | null;
  resumen_sensores: string;
}

export interface PuntoHistorial {
  fecha_hora: string;
  humedad_suelo: number | null;
  temperatura: number | null;
  radiacion: number | null;
  bateria: number | null;
}

export interface HistorialTelemetriaResponse {
  total_puntos: number;
  puntos: PuntoHistorial[];
}

export interface EventoItem {
  id: string;
  nivel: "info" | "aviso" | "error" | "critico";
  origen: string;
  mensaje: string;
  detalles: Record<string, any>;
  creado_en: string;
}

export interface CultivoInfo {
  id: string;
  nombre: string;
  variedad: string | null;
  fecha_inicio: string | null;
  ubicacion: string | null;
  notas: string | null;
  activo: boolean;
}


export const api = {
  getStreamUrl(): string {
    return `${API_BASE_URL}/api/v1/camara/stream`;
  },

  async getCamaraEstado(): Promise<CamaraEstadoResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/camara/estado`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getSalud(): Promise<SaludResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/salud`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getTlahuicoleEstado(): Promise<TlahuicoleEstado | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/tlahuicole/estado`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getGpuInfo(): Promise<GPUInfo | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/sistema/gpu`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getReportes(): Promise<ReporteInfoResponse[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reportes`, { cache: "no-store" });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async generarReporte(
    titulo?: string,
    notas?: string,
    origen: "manual" | "automatico" = "manual"
  ): Promise<ReporteInfoResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reportes/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, notas, origen }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async dispararAlertaAutomatica(detalle?: string): Promise<ReporteInfoResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reportes/alerta-automatica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detalle_anomalia: detalle }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getAuthEstado(): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/estado`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return { autenticado: false, mensaje: "Error al verificar sesión" };
      return await res.json();
    } catch {
      return { autenticado: false, mensaje: "Servidor API no disponible" };
    }
  },

  async login(password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          autenticado: false,
          mensaje: data?.error?.mensaje || data?.detail || "Contraseña incorrecta",
        };
      }
      return data;
    } catch {
      return { autenticado: false, mensaje: "No se pudo conectar con el servidor" };
    }
  },

  async logout(): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      return await res.json();
    } catch {
      return { autenticado: false, mensaje: "Error al cerrar sesión" };
    }
  },

  async getTelemetriaActual(): Promise<TelemetriaActual | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/telemetria/actual`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getTelemetriaHistorial(horas = 24): Promise<PuntoHistorial[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/telemetria/historial?horas=${horas}`, { cache: "no-store" });
      if (!res.ok) return [];
      const data: HistorialTelemetriaResponse = await res.json();
      return data.puntos || [];
    } catch {
      return [];
    }
  },

  async getEventos(limite = 30): Promise<EventoItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/eventos?limite=${limite}`, { cache: "no-store" });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getCultivoActivo(): Promise<CultivoInfo | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cultivos/activo`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};

