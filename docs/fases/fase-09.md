# Fase 09: Preparación para Despliegue en Dominio Web Público (Producción)

## 1. Resumen de la Fase
En esta fase se preparó la infraestructura completa para publicar la plataforma Tlalixmati en un nombre de dominio web propio con certificados de seguridad **SSL/TLS (HTTPS)**, permitiendo que cualquier usuario autorizado acceda al dashboard agronómico desde internet sin exponer puertos internos.

---

## 2. Componentes Desarrollados

### 2.1. Proxy Inverso Nginx (`deploy/nginx/`)
* **Enrutamiento Unificado**: Un único punto de entrada en puertos 80 y 443 que distribuye tráfico a:
  * `/` ➔ Dashboard web Next.js (`web:3000`).
  * `/api/*` ➔ Backend FastAPI (`api:8000`).
  * `/docs` y `/openapi.json` ➔ Documentación interactiva Swagger.
* **Streaming Óptico sin Estrangulamiento**:
  * Configuración especializada para `/api/v1/camara/stream`:
    * `proxy_buffering off;`
    * `proxy_cache off;`
    * `proxy_read_timeout 86400s;`
    * `chunked_transfer_encoding on;`
    * Garantiza flujo de video continuo sin desconexiones ni demoras.

### 2.2. Seguridad Criptográfica y Cookies HTTPS
* **Encabezados de Seguridad**: `Strict-Transport-Security` (HSTS), `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`.
* **Cookie de Sesión Segura**: En [`auth.py`](file:///c:/PROYECTS/proyecto/tlalixmati/apps/api/app/api/v1/endpoints/auth.py) se configuró la detección automática de `X-Forwarded-Proto: https` y la variable `COOKIE_SECURE=true`, activando el atributo `Secure` en la cookie `tlalixmati_session` al navegar bajo HTTPS.

### 2.3. Orquestación Docker para Producción (`docker-compose.prod.yml`)
* Define los servicios aislados en red privada puente (`tlalixmati-net`):
  * `web`: Contenedor Next.js compilado para producción.
  * `api`: Contenedor FastAPI optimizado.
  * `proxy`: Servidor Nginx Alpine con recarga automática de plantillas.
  * `certbot`: Servicio en segundo plano para renovación periódica de certificados Let's Encrypt.

### 2.4. Guía de Conexión de Dominio
* Documentada en [`docs/despliegue/dominio.md`](file:///c:/PROYECTS/proyecto/tlalixmati/docs/despliegue/dominio.md), detallando configuración de DNS (registros A / CNAME), modos Cloudflare Flexible/Full y certificados Let's Encrypt independientes.
