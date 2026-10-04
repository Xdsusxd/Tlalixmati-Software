"""
Módulo de identidad física de la Raspberry Pi.

Obtiene el identificador real del procesador para evitar identificadores inventados.
"""

import os
import platform
import subprocess
from typing import Optional


def obtener_serial_raspberry() -> Optional[str]:
    """
    Lee el número de serie único de la CPU en Raspberry Pi OS desde /proc/cpuinfo.
    Si no está en Raspberry Pi, obtiene el identificador de máquina real del sistema operativo.
    """
    # 1. Intentar lectura oficial en Raspberry Pi OS
    try:
        if os.path.exists("/proc/cpuinfo"):
            with open("/proc/cpuinfo", "r", encoding="utf-8") as f:
                for linea in f:
                    if linea.startswith("Serial"):
                        partes = linea.split(":")
                        if len(partes) >= 2:
                            serial = partes[1].strip()
                            if serial and serial != "0000000000000000":
                                return serial
    except Exception:
        pass

    # 2. Intentar machine-id en distribuciones Linux
    try:
        for ruta in ["/etc/machine-id", "/var/lib/dbus/machine-id"]:
            if os.path.exists(ruta):
                with open(ruta, "r", encoding="utf-8") as f:
                    mid = f.read().strip()
                    if mid and len(mid) >= 8:
                        return f"lin-{mid[:16]}"
    except Exception:
        pass

    # 3. Fallback para entorno de desarrollo Windows: serial de BIOS o UUID real
    if platform.system() == "Windows":
        try:
            salida = subprocess.check_output(
                ["wmic", "bios", "get", "serialnumber"],
                text=True,
                stderr=subprocess.DEVNULL
            )
            lineas = [l.strip() for l in salida.splitlines() if l.strip()]
            if len(lineas) >= 2 and lineas[1] and lineas[1].lower() != "to be filled by o.e.m.":
                return f"win-{lineas[1]}"
        except Exception:
            pass

    # 4. Obtener identificador real del nodo de red del host
    import uuid
    mac_num = uuid.getnode()
    if mac_num:
        mac_hex = f"{mac_num:012x}"
        return f"node-{mac_hex.upper()}"

    return None
