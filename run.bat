@echo off
chcp 65001 >nul
title Tlalixmati - Lanzador de Sistema

echo ==============================================================
echo   TLALIXMATI - Plataforma Inteligente de Monitoreo Agrícola
echo   Tlahuicole: ESP32 + Raspberry Pi
echo ==============================================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker no esta en ejecucion. Intentando iniciar Docker Desktop...
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        echo [*] Esperando que el motor de Docker responda...
        :esperar_docker
        timeout /t 4 /nobreak >nul
        docker info >nul 2>&1
        if %errorlevel% neq 0 (
            echo     ...esperando que Docker termine de arrancar...
            goto esperar_docker
        )
        echo [OK] Docker Desktop ha iniciado correctamente.
    ) else (
        echo [AVISO] Docker Desktop no se encontro en la ruta estandar.
        echo Pasando a ejecucion local nativa...
        goto modo_local
    )
) else (
    echo [OK] Docker activo y listo.
)

echo.
echo Selecciona el modo de ejecucion:
echo   [1] Modo Docker (Levanta contenedores de API y Web en segundo plano)
echo   [2] Modo Desarrollo Local (Abre consolas separadas con recarga en vivo)
echo   [3] Detener Contenedores Docker (docker compose down)
echo   [4] Iniciar Daemon de Vision e IA (Supervision continua en GPU RTX 4050)
echo   [5] Diagnostico de GPU y Modelos de IA
echo.
set /p OPCION="Elige una opcion [1-5] (Por defecto 1): "

if "%OPCION%"=="2" goto modo_local
if "%OPCION%"=="3" goto detener_docker
if "%OPCION%"=="4" goto modo_vision
if "%OPCION%"=="5" goto modo_diagnostico_ia

:modo_docker
echo.
echo [2/3] Levantando contenedores con Docker Compose...
docker compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al iniciar Docker Compose.
    pause
    exit /b 1
)

echo.
echo [3/3] Abriendo navegador...
timeout /t 3 /nobreak >nul
start http://localhost:3000
start http://localhost:8000/docs

echo.
echo ==============================================================
echo   TLALIXMATI EN EJECUCION (DOCKER)
echo   - Frontend:      http://localhost:3000
echo   - API / Swagger: http://localhost:8000/docs
echo   - Credenciales:  Tlalixmati2026!
echo ==============================================================
echo.
echo Para ver los logs en vivo ejecuta: docker compose logs -f
echo Para detener los contenedores ejecuta: docker compose down
echo.
pause
exit /b 0

:modo_local
echo.
echo [2/3] Iniciando Backend (FastAPI) y Frontend (Next.js) en modo desarrollo...
start "Tlalixmati API (FastAPI)" cmd /k "cd /d "%~dp0" && set PYTHONPATH=%~dp0 && uvicorn apps.api.app.main:app --host 0.0.0.0 --port 8000 --reload"
start "Tlalixmati Web (Next.js)" cmd /k "cd /d "%~dp0apps\web" && npm run dev"

echo.
echo [3/3] Abriendo navegador...
timeout /t 5 /nobreak >nul
start http://localhost:3000
start http://localhost:8000/docs

echo.
echo ==============================================================
echo   TLALIXMATI EN EJECUCION (LOCAL DEV)
echo   - Frontend:      http://localhost:3000
echo   - API / Swagger: http://localhost:8000/docs
echo   - Credenciales:  Tlalixmati2026!
echo ==============================================================
echo.
exit /b 0

:detener_docker
echo.
echo Deteniendo todos los contenedores...
docker compose down
echo [OK] Contenedores detenidos.
pause
exit /b 0

:modo_vision
echo.
echo [*] Iniciando Daemon de Vision e Inteligencia Artificial en GPU...
start "Tlalixmati Vision IA (RTX 4050)" cmd /k "cd /d "%~dp0" && set PYTHONPATH=%~dp0 && py -3.10 services/vision/app/main.py --modo continuo --intervalo 3.0"
echo [OK] Daemon iniciado en consola independiente.
exit /b 0

:modo_diagnostico_ia
echo.
py -3.10 services/vision/app/main.py --modo diagnostico
pause
exit /b 0
