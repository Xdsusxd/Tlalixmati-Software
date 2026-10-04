# Guía de Despliegue en Dominio Web Público (Producción)

Esta guía explica paso a paso cómo desplegar la plataforma Tlalixmati en un servidor VPS o nube accesible a través de un nombre de dominio propio (ej. `cultivo.tudominio.com`) con certificados **SSL/TLS (HTTPS)**.

---

## 1. Arquitectura de Despliegue

El tráfico web entrante llega por los puertos **80 (HTTP)** y **443 (HTTPS)** gestionado por el proxy inverso **Nginx**, el cual enruta:
* `/api/*` y `/docs` hacia el contenedor de **FastAPI** (`api:8000`).
* `/api/v1/camara/stream` con **búfer desactivado (`proxy_buffering off`)** para streaming MJPEG fluido sin interrupciones.
* `/` hacia el contenedor de **Next.js** (`web:3000`).

---

## 2. Configuración de DNS

En el panel de tu proveedor de dominio (Cloudflare, GoDaddy, Namecheap, etc.):
1. Crea un registro **A**:
   * **Nombre / Host**: `@` (para dominio raíz) o `cultivo` (para subdominio).
   * **Valor / IP**: Dirección IP pública estática de tu servidor VPS.
   * **TTL**: Automático o 300 segundos.
2. Si utilizas el subdominio `www`:
   * **Tipo**: CNAME
   * **Nombre**: `www`
   * **Valor**: Tu dominio principal.

---

## 3. Preparación de Variables de Entorno

1. Copia la plantilla de producción:
   ```bash
   cp .env.production.example .env
   ```
2. Edita `.env` y configura tus valores reales:
   ```ini
   DOMAIN_NAME=cultivo.tudominio.com
   API_URL=https://cultivo.tudominio.com
   WEB_URL=https://cultivo.tudominio.com
   COOKIE_SECURE=true
   ```

---

## 4. Opciones de Certificado SSL / HTTPS

### Opción A: Mediante Cloudflare (Recomendado y más sencillo)
Si administras tu dominio en Cloudflare:
1. Activa el proxy de Cloudflare (nube naranja activada en el registro DNS).
2. En la pestaña **SSL/TLS** de Cloudflare, selecciona el modo **Full** o **Flexible**.
3. Inicia los servicios con el proxy HTTP preconfigurado:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
   *Cloudflare gestionará automáticamente los certificados SSL mundiales sin necesidad de configurar Certbot en tu servidor.*

### Opción B: Certificados Nativos Let's Encrypt con Certbot
Si apuntas directamente tu IP sin Cloudflare:
1. Inicia temporalmente el proxy para responder al desafío ACME:
   ```bash
   docker compose -f docker-compose.prod.yml up -d proxy web api
   ```
2. Solicita el certificado SSL oficial con Certbot:
   ```bash
   docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d cultivo.tudominio.com -d www.cultivo.tudominio.com --email tu_correo@tudominio.com --agree-tos --no-eff-email
   ```
3. Reinicia el proxy para cargar los certificados HTTPS:
   ```bash
   docker compose -f docker-compose.prod.yml restart proxy
   ```

---

## 5. Mantenimiento y Verificación

* **Ver estado de los contenedores**:
  ```bash
  docker compose -f docker-compose.prod.yml ps
  ```
* **Ver registros en vivo**:
  ```bash
  docker compose -f docker-compose.prod.yml logs -f proxy
  ```
* **Renovación de Certificados**: El contenedor `certbot` en el perfil SSL se encarga automáticamente de renovar los certificados cada 60 días en segundo plano.
