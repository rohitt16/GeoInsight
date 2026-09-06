from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./geoinsight.db"
    POSTGRES_URL: str = "postgresql://postgres:postgres@db:5432/geoinsight"
    # Path to local data directory (optional)
    DATA_DIR: str = "./data"

    class Config:
        env_file = ".env"


settings = Settings()
