# Arquitectura del Sistema Tlalixmati

## Estructura del Monorepo
El proyecto Tlalixmati utiliza una arquitectura de monorepo, conteniendo el código frontend (Next.js), backend (FastAPI), modelos de inteligencia artificial (PyTorch/YOLO) y firmware/edge (ESP32/Raspberry Pi) en un solo repositorio.

## Sistema de Identidad
La identidad en el sistema se basa estrictamente en el **hardware**. Se utilizan los identificadores reales de las placas físicas (MAC, números de serie). No existen asignaciones de IDs manuales. 

Tlahuicole es una **agrupación lógica** que representa a estos dispositivos físicos (ESP32 + Raspberry Pi + periféricos) trabajando en conjunto.

## Relaciones y Flujo de Comunicación
El flujo de datos sigue el eje físico a la nube:

```text
+----------+      +--------------+      +---------+      +--------------------+
|          |      |              |      |         |      |                    |
|  ESP32   |<---->| Raspberry Pi |<---->| FastAPI |<---->| Supabase (DB +   |
| (Físico) |      |   (Edge)     |      | (Backend|      | Storage)           |
+----------+      +--------------+      +---------+      +--------------------+
```

1. **ESP32**: Maneja periféricos, sensores, motores. Se comunica con la Raspberry Pi.
2. **Raspberry Pi**: Procesa visión, actúa como puente de red, se comunica con FastAPI.
3. **FastAPI**: Backend principal, expone la API REST, se encarga de la validación, IA y se comunica con Supabase.
4. **Supabase**: Base de datos PostgreSQL y Storage de objetos.

## Límites de los Servicios
- **Frontend (Next.js)**: Consumo exclusivo de los servicios del Backend. UI de administración y visualización.
- **Backend (FastAPI)**: Orquestador lógico, control de acceso, proxy para Supabase e IA.
- **Edge (Raspberry Pi)**: Toma de decisiones rápida, compresión de imágenes, puente físico.
- **Microcontrolador (ESP32)**: Control en tiempo real a bajo nivel.
