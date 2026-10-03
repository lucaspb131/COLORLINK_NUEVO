import json
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "COLORLINK Enterprise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Parámetros Individuales de MySQL
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_DB: str = "colorlink_db"
    
    # URLs de Conexión cargadas desde .env (o derivadas si no vienen especificadas)
    DATABASE_URL: str = ""
    SYNC_DATABASE_URL: str = ""

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Retorna DATABASE_URL del .env o construye la cadena dinámica para aiomysql."""
        if self.DATABASE_URL and not self.DATABASE_URL.startswith("${"):
            return self.DATABASE_URL
        pwd = f":{self.MYSQL_PASSWORD}" if self.MYSQL_PASSWORD else ""
        return f"mysql+aiomysql://{self.MYSQL_USER}{pwd}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}?charset=utf8mb4"

    @property
    def RESOLVED_SYNC_DATABASE_URL(self) -> str:
        """Retorna SYNC_DATABASE_URL del .env o construye la cadena dinámica para pymysql."""
        if self.SYNC_DATABASE_URL and not self.SYNC_DATABASE_URL.startswith("${"):
            return self.SYNC_DATABASE_URL
        pwd = f":{self.MYSQL_PASSWORD}" if self.MYSQL_PASSWORD else ""
        return f"mysql+pymysql://{self.MYSQL_USER}{pwd}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}?charset=utf8mb4"

    # Seguridad & JWT
    JWT_SECRET: str = "super_secure_jwt_secret_colorlink_2026_enterprise_key_9988"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Gemini API
    GEMINI_API_KEY: str = ""

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:8501",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8501"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            clean_str = v.strip()
            # Asegurar que no contenga etiquetas corruptas
            if clean_str.startswith("[") and clean_str.endswith("]"):
                try:
                    return json.loads(clean_str)
                except Exception:
                    pass
            return [origin.strip() for origin in clean_str.split(",") if origin.strip()]
        return v

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
