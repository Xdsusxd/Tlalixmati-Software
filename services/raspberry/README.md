# Servicio Edge para Raspberry Pi — Tlalixmati (Tlahuicole)

Este módulo es el servicio ligero que corre directamente en la Raspberry Pi en campo.

---

## 1. Funciones del Servicio
1. **Captura y Transmisión Óptica**: Captura fotogramas de la cámara física y los envía por HTTP a la API (`POST /api/v1/camara/frame`) para el streaming en vivo en el dashboard.
2. **Receptor de Telemetría ESP32**: Escucha por puerto serial (`/dev/ttyUSB0`) las lecturas de los sensores analógicos de suelo y clima.
3. **Identidad por Hardware**: Registra automáticamente la Raspberry Pi en la plataforma utilizando su número de serie real de CPU (`/proc/cpuinfo`).

---

## 2. Instalación en Raspberry Pi OS

### Requisitos previos:
```bash
sudo apt update
sudo apt install -y python3-pip python3-venv git
```

### Configuración del entorno:
```bash
cd services/raspberry
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 3. Ejecución

### Prueba de ciclo único:
```bash
python -m services.raspberry.app.main --once
```

### Ejecución continua:
```bash
python -m services.raspberry.app.main
```

---

## 4. Servicio Automático con Systemd (Arranque con el sistema)

Para que el programa inicie solo al encender la Raspberry Pi:

1. Crea el archivo de servicio:
```bash
sudo nano /etc/systemd/system/tlalixmati-edge.service
```

2. Agrega la siguiente configuración:
```ini
[Unit]
Description=Tlalixmati Edge Service (Camara y Sensores)
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/tlalixmati
ExecStart=/home/pi/tlalixmati/services/raspberry/venv/bin/python -m services.raspberry.app.main
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

3. Habilita y arranca el servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tlalixmati-edge.service
sudo systemctl start tlalixmati-edge.service
```
