from dotenv import load_dotenv
load_dotenv()

from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    database_hostname: str = Field(..., env="DATABASE_HOSTNAME")
    database_port: str = Field(..., env="DATABASE_PORT")
    database_password: str = Field(..., env="DATABASE_PASSWORD")
    database_name: str = Field(..., env="DATABASE_NAME")
    database_username: str = Field(..., env="DATABASE_USERNAME")

    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = Field(..., env="ALGORITHM")
    access_token_expire_minutes: int = Field(..., env="ACCESS_TOKEN_EXPIRE_MINUTES")
    api_v1_str: str = Field(..., env="API_V1_STR")

    class Config:
        env_file = "../.env"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.database_username}:"
            f"{self.database_password}@{self.database_hostname}:"
            f"{self.database_port}/{self.database_name}"
        )

settings = Settings()
