# Configuración del Sistema

## Estructura de `system.yaml`
El archivo `system.yaml` (en la raíz del proyecto) es el documento central para la configuración del monorepo y las dependencias de los distintos servicios de Tlalixmati (puertos, volúmenes, comandos). Se utiliza principalmente para unificar la configuración de `docker-compose.yml`.

## Variables de Entorno (`.env.example`)
El archivo `.env.example` contiene la plantilla de las variables necesarias para ejecutar el sistema.
- **Propósito**: Definir credenciales de Supabase, variables de configuración de puertos y contraseña global.
- **Formato**: Formato KEY=VALUE estándar.
- **Obtención**: Copiar `.env.example` a `.env` y rellenar con las claves de Supabase y una contraseña segura para el acceso global.

## Uso de Docker Compose
Docker Compose es la herramienta principal para levantar los servicios del ecosistema durante el desarrollo (FastAPI, Next.js, etc.).
- Comando principal: `docker compose up -d`
- Se apoya en la configuración provista por `system.yaml` y `.env`.

## Pasos de Configuración para Desarrollo
1. Clonar el repositorio.
2. Copiar `.env.example` a `.env` y configurar las variables necesarias.
3. Ejecutar `docker compose up --build` para levantar los servicios.
