"""
Pruebas base de configuración e integridad para Tlalixmati (Fase 01).

Estas pruebas verifican que:
1. La configuración del sistema (config/system.yaml) sea válida y legible.
2. No existan componentes falsos o simulados habilitados por defecto.
3. El archivo .env.example defina todas las variables requeridas por la plataforma.
"""

from pathlib import Path
import yaml


def test_system_yaml_existe_y_es_valido():
    """Verifica que el archivo config/system.yaml exista y contenga estructura válida."""
    base_dir = Path(__file__).resolve().parent.parent
    config_path = base_dir / "config" / "system.yaml"
    
    assert config_path.exists(), f"No se encontró el archivo {config_path}"
    
    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
        
    assert isinstance(data, dict), "El archivo system.yaml debe ser un diccionario YAML"
    assert "proyecto" in data, "Falta la clave 'proyecto' en system.yaml"
    assert data["proyecto"]["nombre"] == "Tlalixmati"


def test_no_inventar_hardware_por_defecto():
    """
    Regla fundamental: NO INVENTAR DATOS NI HARDWARE.
    Todos los componentes físicos deben permanecer deshabilitados y sin modelos inventados
    hasta que se conecte y registre hardware real.
    """
    base_dir = Path(__file__).resolve().parent.parent
    config_path = base_dir / "config" / "system.yaml"
    
    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
        
    # ESP32
    assert data.get("esp32", {}).get("habilitado") is False, "ESP32 no debe estar habilitado sin hardware real"
    assert data.get("esp32", {}).get("modelo") is None, "No se debe inventar modelo de ESP32"

    # Raspberry Pi
    assert data.get("raspberry", {}).get("habilitada") is False, "Raspberry no debe estar habilitada sin hardware real"
    assert data.get("raspberry", {}).get("modelo") is None, "No se debe inventar modelo de Raspberry"

    # Cámara
    assert data.get("camara", {}).get("habilitada") is False, "Cámara no debe estar habilitada sin hardware real"
    assert data.get("camara", {}).get("modelo") is None, "No se debe inventar modelo de cámara"
    assert data.get("camara", {}).get("driver") is None, "No se debe inventar driver de cámara"

    # Visión
    assert data.get("vision", {}).get("habilitada") is False, "Módulo de visión no debe estar habilitado sin modelos reales"


def test_env_example_contiene_variables_clave():
    """Verifica que .env.example contenga todas las variables requeridas documentadas."""
    base_dir = Path(__file__).resolve().parent.parent
    env_path = base_dir / ".env.example"
    
    assert env_path.exists(), f"No se encontró el archivo {env_path}"
    
    content = env_path.read_text(encoding="utf-8")
    
    variables_requeridas = [
        "SUPABASE_URL",
        "SUPABASE_KEY",
        "DATABASE_URL",
        "API_URL",
        "WEB_URL",
        "SESSION_SECRET",
        "PASSWORD_HASH",
    ]
    
    for var in variables_requeridas:
        assert var in content, f"La variable {var} debe estar documentada en .env.example"
