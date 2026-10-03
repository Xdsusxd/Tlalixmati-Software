# FASE 02 — BACKEND (FastAPI, Validación, Errores, Servicios, Modelos)

## 1. Resumen de la Fase
En esta fase se implementó la arquitectura completa del backend en **FastAPI**, estableciendo:
- Capa de esquemas Pydantic v2 reutilizables en `packages/schemas/`.
- Servicios de negocio desacoplados para el sistema, componentes de hardware y la agregación lógica de Tlahuicole.
- Manejo uniforme de errores en español con códigos estándar.
- Endpoints de salud, diagnóstico de hardware (GPU NVIDIA RTX 4050 con CUDA), componentes físicos y estado unificado de Tlahuicole.
- Suite de pruebas automatizadas con `pytest` y `coverage` (cobertura del 94%).

---

## 2. Decisiones Arquitectónicas Clave (Razonamiento x10)

1. **Tlahuicole como Agrupación Lógica**:
   - Se diseñó el esquema `TlahuicoleEstado` y el servicio `TlahuicoleService` para que el estado sea **100% derivado** en tiempo de ejecución.
   - Tlahuicole **no** posee un `device_id` propio, ni se le asigna una identidad ficticia como `tlahuicole-01`.
   - Su salud general se calcula evaluando si sus componentes reales (ESP32 y Raspberry Pi) están reportando latidos.

2. **Principio Estricto: No Inventar Datos**:
   - En ausencia de hardware físico conectado, la API responde con textos explícitos: `Componente no conectado`, `Cámara no configurada`, `Sin datos` (en telemetría) y `Sin resultados` (en análisis).
   - Se implementó un filtro de validación en `ComponenteService` que rechaza identificadores genéricos o inventados (`tlahuicole-01`, `dummy`, `fake`, `simulador`).

3. **Diagnóstico Real de Hardware de Cómputo**:
   - El endpoint `/api/v1/sistema/gpu` inspecciona de forma segura el soporte CUDA real en la máquina del usuario, detectando la **NVIDIA GeForce RTX 4050 Laptop GPU** para los futuros pipelines de PyTorch / YOLO.

4. **Contratos de Datos Compartidos (`packages/schemas/`)**:
   - Los modelos de datos no están confinados a la API, sino ubicados en `packages/schemas/` para ser consumidos por los futuros servicios (ej. servicio Raspberry Pi, servicio de visión).

---

## 3. Archivos Creados y Modificados en FASE 02

| Archivo | Responsabilidad |
|---|---|
| `packages/schemas/componente.py` | Modelos Pydantic para tipos de componentes, identidades físicas reales, registros y estados. |
| `packages/schemas/tlahuicole.py` | Modelo de estado unificado y derivado de Tlahuicole (sin device_id). |
| `packages/schemas/sistema.py` | Modelos de salud, configuración y diagnóstico de GPU. |
| `packages/schemas/error.py` | Estructura uniforme de envoltura de errores (`ErrorResponse`). |
| `packages/schemas/__init__.py` | Exportaciones públicas del paquete de esquemas. |
| `apps/api/app/core/config.py` | Lector de `system.yaml`, variables de entorno y detección de GPU con PyTorch/CUDA. |
| `apps/api/app/core/exceptions.py` | Jerarquía de excepciones del dominio (`TlalixmatiException`, `ComponenteNoEncontradoException`, etc.). |
| `apps/api/app/core/handlers.py` | Manejadores globales de excepciones de FastAPI con respuestas en español. |
| `apps/api/app/services/sistema_service.py` | Lógica de consulta de configuración y salud de la plataforma. |
| `apps/api/app/services/componente_service.py` | Gestión en memoria de latidos y validación de identificadores de hardware real. |
| `apps/api/app/services/tlahuicole_service.py` | Agregador que deriva el estado de Tlahuicole a partir del ESP32 y Raspberry Pi. |
| `apps/api/app/api/v1/endpoints/salud.py` | Controlador HTTP para `GET /api/v1/salud`. |
| `apps/api/app/api/v1/endpoints/sistema.py` | Controlador HTTP para configuración y diagnóstico de GPU. |
| `apps/api/app/api/v1/endpoints/componentes.py` | Controlador HTTP para listar, consultar y registrar hardware real. |
| `apps/api/app/api/v1/endpoints/tlahuicole.py` | Controlador HTTP para consultar el estado integrado de Tlahuicole. |
| `apps/api/app/api/v1/router.py` | Router consolidado de la versión 1. |
| `apps/api/app/main.py` | Aplicación FastAPI, lifespan, CORS, middleware y handlers. |
| `apps/api/requirements.txt` | Dependencias del backend (FastAPI, Pydantic, PyYAML, Uvicorn, etc.). |
| `apps/api/Dockerfile` | Contenedorización optimizada de Python 3.10-slim. |
| `tests/conftest.py` | Fixtures de testing y aislamiento con TestClient. |
| `tests/test_api_salud.py` | Pruebas del endpoint de salud. |
| `tests/test_api_sistema.py` | Pruebas de configuración y GPU. |
| `tests/test_api_componentes.py` | Pruebas de listado, consulta, registro y rechazo de nombres prohibidos. |
| `tests/test_api_tlahuicole.py` | Pruebas del estado unificado y derivación de componentes. |
| `tests/test_errores.py` | Pruebas de formato uniforme de errores 404 y 422. |
| `docs/api/api.md` | Documentación técnica completa de la API. |

---

## 4. Verificación y Pruebas
Se ejecutó la suite completa con 18 pruebas automatizadas:
```text
tests/test_api_componentes.py::test_listar_componentes_por_defecto_sin_datos PASSED
tests/test_api_componentes.py::test_obtener_componente_especifico PASSED
tests/test_api_componentes.py::test_obtener_componente_invalido_retorna_404_con_error_estructurado PASSED
tests/test_api_componentes.py::test_registrar_componente_real_exitoso PASSED
tests/test_api_componentes.py::test_rechazo_de_identificador_inventado_o_prohibido PASSED
tests/test_api_componentes.py::test_rechazo_de_identificador_demasiado_corto PASSED
tests/test_api_salud.py::test_endpoint_salud_retorna_200_y_estructura_valida PASSED
tests/test_api_sistema.py::test_endpoint_raiz_retorna_informacion_plataforma PASSED
tests/test_api_sistema.py::test_endpoint_sistema_configuracion_refleja_system_yaml PASSED
tests/test_api_sistema.py::test_endpoint_sistema_gpu_diagnostico PASSED
tests/test_api_tlahuicole.py::test_tlahuicole_estado_inicial_sin_hardware PASSED
tests/test_api_tlahuicole.py::test_tlahuicole_estado_derivado_conexion_parcial PASSED
tests/test_api_tlahuicole.py::test_tlahuicole_estado_derivado_conexion_completa PASSED
tests/test_config.py::test_system_yaml_existe_y_es_valido PASSED
tests/test_config.py::test_no_inventar_hardware_por_defecto PASSED
tests/test_config.py::test_env_example_contiene_variables_clave PASSED
tests/test_errores.py::test_error_404_ruta_no_encontrada_formato_uniforme PASSED
tests/test_errores.py::test_error_422_validacion_payload_invalido_formato_uniforme PASSED
============================= 18 passed in 3.61s ==============================
```
Cobertura global alcanzada: **94%**.

---

## 5. Cómo Ejecutar la API en Desarrollo

1. **Configurar el entorno:**
   ```powershell
   cd c:\PROYECTS\proyecto\tlalixmati
   $env:PYTHONPATH = "c:\PROYECTS\proyecto\tlalixmati"
   ```

2. **Iniciar el servidor Uvicorn:**
   ```powershell
   uvicorn apps.api.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Acceder a la documentación Swagger:**
   - URL: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

---

## 6. Qué Falta (Para las Siguientes Fases)
- **FASE 03 — Supabase + PostgreSQL**: Esquema de base de datos relacional para persistir los componentes, eventos, imágenes y mediciones reales (reemplazando el almacenamiento volátil en memoria del servicio de componentes).
- **FASE 04 — Acceso**: Implementar la autenticación de contraseña global única con cookies seguras HttpOnly / SameSite.

---

## 7. Qué se Necesita del Usuario
- Revisión y aprobación explícita de la **FASE 02** para avanzar a la **FASE 03 — SUPABASE + POSTGRESQL**.
