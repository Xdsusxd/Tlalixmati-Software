# Backend API (FastAPI) — Tlalixmati

## 1. Arquitectura del Backend
El backend de **Tlalixmati** está construido con **FastAPI** (Python 3.10+), enfocado en alto rendimiento, tipado estricto con **Pydantic v2**, modularidad y diseño limpio bajo arquitectura en capas:

- **Core (`apps/api/app/core/`)**: Configuración centralizada (`config.py`), jerarquía de excepciones (`exceptions.py`), manejadores globales (`handlers.py`).
- **Esquemas Compartidos (`packages/schemas/`)**: Contratos de datos comunes para componentes, Tlahuicole, diagnóstico y errores.
- **Servicios (`apps/api/app/services/`)**: Lógica de negocio desacoplada de la capa web (`sistema_service.py`, `componente_service.py`, `tlahuicole_service.py`).
- **Endpoints (`apps/api/app/api/v1/endpoints/`)**: Controladores HTTP expuestos bajo el prefijo `/api/v1`.

---

## 2. Principios de Identidad y Reglas de Hardware
1. **Identidad Física Real**: Los dispositivos se identifican mediante sus datos físicos reales (dirección MAC para ESP32, número de serie o UUID para Raspberry Pi).
2. **Prohibición de Hardware Falso**: Se prohíbe registrar nombres genéricos o inventados como `tlahuicole-01`, `dummy`, `mock`, `simulador`.
3. **Tlahuicole como Agrupación Lógica**: Tlahuicole **no** tiene `device_id` propio ni tabla en la base de datos; su estado es derivado en tiempo real de sus componentes reales.
4. **Estados Faltantes Claros**: Cuando no hay hardware conectado o telemetría, la API responde explícitamente:
   - `Componente no conectado`
   - `Cámara no configurada`
   - `Sin datos` (en telemetría/sensores)
   - `Sin resultados` (en análisis/visión)

---

## 3. Endpoints Implementados (Versión 1)

### General
- `GET /`
  - Información general de la plataforma, versión y enlaces rápidos a la documentación interactiva (`/docs`) y endpoints clave.

### Salud y Diagnóstico
- `GET /api/v1/salud`
  - Estado del servicio API, subsistemas y contador de componentes físicos activos.
- `GET /api/v1/sistema/configuracion`
  - Resumen de la configuración activa desde `config/system.yaml` (sin exponer secretos).
- `GET /api/v1/sistema/gpu`
  - Diagnóstico de la GPU física local (NVIDIA GeForce RTX 4050) y disponibilidad de aceleración con CUDA para PyTorch.

### Componentes Físicos
- `GET /api/v1/componentes`
  - Lista el estado de los componentes base (ESP32, Raspberry Pi, Cámara).
- `GET /api/v1/componentes/{tipo}`
  - Consulta el estado de un componente específico (`esp32`, `raspberry`, `camara`).
  - Retorna error 404 si el tipo no es soportado.
- `POST /api/v1/componentes/registrar`
  - Procesa un latido de hardware real con `ComponenteRegistro`.
  - Valida el identificador físico y actualiza el estado a `Conectado`.

### Tlahuicole (Unidad Física Integrada)
- `GET /api/v1/tlahuicole/estado`
  - Devuelve la vista consolidada y derivada del sistema de campo.
  - No duplica identificadores y calcula el estado operativo global a partir del estado de ESP32 y Raspberry Pi.

---

## 4. Esquema Uniforme de Manejo de Errores
Todas las respuestas de error (códigos HTTP >= 400) utilizan la estructura estándar `ErrorResponse`:

```json
{
  "error": {
    "codigo": "COMPONENTE_NO_CONECTADO",
    "mensaje": "Componente físico 'sensor_x' no encontrado o no conectado al sistema.",
    "detalles": {
      "identificador": "sensor_x"
    }
  }
}
```

Códigos de error estándar:
- `COMPONENTE_NO_CONECTADO`: Componente no encontrado o no activo (404).
- `IDENTIFICADOR_INVALIDO`: Identificador inventado o prohibido (400).
- `VALIDACION_DATOS_ERROR`: Payload con tipos o longitud inválida (422).
- `RUTA_NO_ENCONTRADA`: Recurso no existente en la API (404).
- `HARDWARE_NO_CONECTADO`: Solicitud de hardware físico que no está presente (503).
- `ERROR_INTERNO_SERVIDOR`: Fallo no controlado en el servidor (500).

---

## 5. Ejecución Local de la API
```powershell
# Desde la raíz del repositorio:
$env:PYTHONPATH = "c:\PROYECTS\proyecto\tlalixmati"
uvicorn apps.api.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Documentación Swagger disponible en: `http://localhost:8000/docs`

---
**Estado:** FASE 02 Implementada, probada con pytest (100% aprobado) y documentada.
