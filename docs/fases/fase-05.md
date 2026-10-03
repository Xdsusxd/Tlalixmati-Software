# FASE 05 — DASHBOARD Y ACCESO (Next.js, TypeScript, Tailwind, Recharts, GSAP)

## 1. Resumen
Se implementó el frontend completo de la plataforma en `apps/web/` y el sistema de control de acceso por contraseña global:
- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts y GSAP.
- **Acceso (Fase 04)**: Validación de contraseña global única contra hash bcrypt en FastAPI y sesión en cookie `HttpOnly` (`SameSite=Lax`).
- **Diseño Visual**: Aplicación de la guía Organic Biophilic + Minimalista + Profesional obtenida de *UI/UX Pro Max* (paleta bosque, tierra, arena y blanco natural; sin emojis como iconos).

---

## 2. Componentes del Dashboard

1. **`Navbar.tsx`**:
   - Identidad visual de Tlalixmati.
   - Indicador de estado de API en tiempo real.
   - Botón de acceso modal o cierre de sesión con invalidación de cookie.

2. **`TlahuicoleSection.tsx`**:
   - Presenta la unidad física como agrupación lógica (no como entidad de BD).
   - Tarjetas independientes para **ESP32**, **Raspberry Pi** y **Cámara**.
   - Muestra claramente los estados: `Componente no conectado`, `Cámara no configurada`, `Sin hardware registrado`.

3. **`TelemetrySection.tsx`**:
   - Visualización de métricas de telemetría sensorial (humedad, temperatura, radiación, alimentación).
   - Gráfica en **Recharts** con estado explícito: *Sin datos / Sin mediciones de hardware disponibles*.
   - Cumple la regla de no inventar números ni curvas simuladas.

4. **`VisionSection.tsx`**:
   - Visor de imágenes de campo con prohibición de carga manual (sin `<input type="file">`).
   - Estado de modelos: YOLO (Detección) y PyTorch (Anomalías) marcados como `Modelo no configurado` y `Sin resultados`.

5. **`GpuDiagnosticCard.tsx`**:
   - Diagnóstico de la aceleración por hardware: reporta la **NVIDIA GeForce RTX 4050 Laptop GPU** y plataforma **CUDA (cu121)** disponible para inferencia y entrenamiento.

6. **`LoginModal.tsx`**:
   - Formulario modal para ingresar la contraseña global única de administración.

---

## 3. Verificación y Ejecución
- Compilación de producción con Turbopack exitosa (`npm run build`).
- Suite completa de 25 pruebas en pytest aprobadas (100%).
- Para iniciar el frontend en modo desarrollo:
  ```powershell
  cd apps/web
  npm run dev
  ```
  Disponible en: `http://localhost:3000`
