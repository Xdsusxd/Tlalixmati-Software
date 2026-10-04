# Fase 10: Ingesta de Telemetría Real, Bitácora de Eventos y Gestión de Cultivos

## 1. Objetivo de la Fase
Completar la tubería integral de datos agrícolas reales entre el microcontrolador ESP32, el servicio Edge en la Raspberry Pi, el backend FastAPI, la base de datos PostgreSQL en Supabase y el Dashboard agronómico web en Next.js. Se implementó la ingesta de telemetría de campo, la persistencia en `measurements`, la bitácora de auditoría e incidencias en `events`, y la gestión del cultivo en seguimiento en `cultivations`.

La locomoción física permanece estrictamente en espera hasta contar con el chasis físico final (ruedas, orugas, motores y drivers).

---

## 2. Componentes Desarrollados

### 2.1 Esquemas Pydantic (`packages/schemas/`)
* **`telemetria.py`**:
  * `TelemetriaLecturaIn`: Trama enviada por la Raspberry Pi con lecturas del ESP32 (`mac`, `humedad_suelo`, `temperatura`, `radiacion`, `bateria`).
  * `TelemetriaActualOut`: Estado actual honesto (`conectado`, valores reales o `null`, `resumen_sensores`).
  * `PuntoHistorialOut` y `HistorialTelemetriaResponse`: Puntos cronológicos reales para graficación en el dashboard.
* **`evento.py`**:
  * `EventoIn` y `EventoOut`: Severidades (`info`, `aviso`, `error`, `critico`), origen (`VISION_IA`, `ESP32_ALIMENTACION`, `SISTEMA_REPORTES`), mensaje y metadatos.
* **`cultivo.py`**:
  * `CultivoIn` y `CultivoOut`: Datos de la parcela/lote en monitoreo activo (`nombre`, `variedad`, `ubicacion`, `notas`, `activo`).

### 2.2 Servicios Backend (`apps/api/app/services/`)
* **`telemetria_service.py`**:
  * Administra el estado sensorial en memoria con caducidad por timeout (120s).
  * Persiste cada lectura individual válida en la tabla `measurements` de PostgreSQL (Supabase).
  * Monitorea umbrales críticos (batería < 3.3V, temperatura > 42°C) y dispara eventos automáticos de aviso.
  * Agrega el historial por hora para graficación sin inventar curvas ficticias.
* **`evento_service.py`**:
  * Bitácora en memoria y persistencia en la tabla `events` de Supabase.
  * Registro de inferencias de IA, generación de reportes y diagnósticos.
* **`cultivo_service.py`**:
  * Gestión del lote en seguimiento activo persistido en la tabla `cultivations`.

### 2.3 Enlace Edge Raspberry Pi (`services/raspberry/app/servicio_edge.py`)
* Se conectó `procesar_telemetria_esp32()` para reenviar las tramas recibidas por puerto serial hacia el endpoint `POST /api/v1/telemetria/recibir`.

### 2.4 Dashboard Web Agronómico (`apps/web/`)
* **`TelemetrySection.tsx`**: Muestra las métricas de campo en tiempo real conectadas a los sensores físicos. Incluye gráfica Recharts con dos series (`Humedad` y `Temperatura`) alimentada por el historial de mediciones de base de datos. Si no hay datos, muestra honestamente `"Sin datos de sonda"` y estado vacío sin curvas simuladas.
* **`EventsSection.tsx`**: Nuevo módulo de bitácora de auditoría agronómica con filtrado interactivo por severidad (`Alertas`, `Avisos`, `Info`), badges de estado y marcas de tiempo.
* **`page.tsx`**: Refleja el lote o cultivo en seguimiento en el encabezado superior y orquesta la actualización periódica de todos los módulos.

---

## 3. Verificación y Calidad
* **Pruebas Automatizadas**: 49 pruebas unitarias y de integración pasando al 100% (`py -3.10 -m pytest -q`).
* **Compilación Frontend**: Build de producción de Next.js (`npm run build`) completado con 0 errores y optimización estática limpia.
