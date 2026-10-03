# Backend API (FastAPI)

## Backend Principal
El backend de Tlalixmati está construido utilizando FastAPI (Python), proporcionando una plataforma rápida y fuertemente tipada.

## Autenticación y Acceso
El sistema utiliza un esquema de acceso simple y estricto:
- **Contraseña global única**: Todos los usuarios autorizados utilizan la misma contraseña de sistema.
- **Sin Supabase Auth ni OAuth**: No se gestionan usuarios individuales en la base de datos de Supabase.
- **Sesiones**: El acceso se gestiona mediante sesiones basadas en cookies (Cookie-based session) tras la validación de la contraseña global.

## Validación de Datos
Todas las entradas y salidas de la API estarán estrictamente validadas utilizando modelos de **Pydantic**, garantizando la coherencia e integridad de los datos.

## Manejo de Errores
Se implementará un enfoque estándar para el manejo de excepciones, devolviendo respuestas JSON consistentes con códigos HTTP apropiados y detalles del error claros (sin exponer información sensible).

## Estructura Futura de Endpoints
La API contará con routers agrupados lógicamente (ej. `/api/v1/devices`, `/api/v1/hardware`, `/api/v1/images`, `/api/v1/ai`).

---
**Estado:** API no implementada todavía
