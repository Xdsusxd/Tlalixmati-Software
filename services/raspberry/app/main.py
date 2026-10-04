"""
Punto de entrada principal para el servicio Edge en Raspberry Pi.
"""

import argparse
import asyncio
import sys

from services.raspberry.app.servicio_edge import ServicioEdgeRaspberry


def main():
    parser = argparse.ArgumentParser(description="Tlalixmati — Servicio Edge de Campo (Raspberry Pi)")
    parser.add_argument("--once", action="store_true", help="Ejecuta un único ciclo de verificación y finaliza")
    args = parser.parse_args()

    servicio = ServicioEdgeRaspberry()

    if args.once:
        print("[*] Ejecutando verificación de ciclo único...")
        resultado = servicio.ejecutar_ciclo()
        print(f"[OK] Resultado: {resultado}")
        sys.exit(0)

    try:
        asyncio.run(servicio.bucle_principal())
    except KeyboardInterrupt:
        servicio.detener()
        print("\n[*] Servicio Edge detenido por el usuario.")


if __name__ == "__main__":
    main()
