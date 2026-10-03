# Imagen base optimizada de Python 3.10
FROM python:3.10-slim

# Evitar escritura de archivos .pyc y activar salida sin buffer para logs inmediatos
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias de Python
COPY apps/api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copiar esquemas compartidos y código de la aplicación
COPY packages /app/packages
COPY config /app/config
COPY apps/api/app /app/apps/api/app

# Exponer puerto configurado en system.yaml
EXPOSE 8000

# Comando de ejecución con Uvicorn
CMD ["uvicorn", "apps.api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
