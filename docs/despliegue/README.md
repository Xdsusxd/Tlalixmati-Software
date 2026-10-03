# Despliegue de Tlalixmati

## Desarrollo Local
Actualmente, el despliegue del proyecto está orientado exclusivamente al desarrollo local, utilizando **Docker Compose**. Esto permite encapsular los servicios de FastAPI, Next.js, y demás herramientas de forma estandarizada e independiente del entorno del sistema operativo anfitrión.

## Base de Datos e Infraestructura Cloud
Se utiliza **Supabase** como proveedor principal en la nube para la base de datos (PostgreSQL) y el almacenamiento de objetos (Storage). El sistema interactuará con la instancia cloud de Supabase.

## Consideraciones Futuras
En fases posteriores, se definirán las estrategias para:
- Despliegue a producción de los servicios web (FastAPI, Next.js).
- Pipeline CI/CD para el despliegue automático del backend y frontend.
- Despliegue seguro de actualizaciones OTA (Over-the-Air) para ESP32 y Raspberry Pi.

---
**Estado:** Solo desarrollo local disponible
