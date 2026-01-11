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

    app_timezone: str = Field("Asia/Ho_Chi_Minh", env="APP_TIMEZONE")
    scheduler_enabled: bool = Field(True, env="SCHEDULER_ENABLED")

    smtp_host: str = Field("", env="SMTP_HOST")
    smtp_port: int = Field(587, env="SMTP_PORT")
    smtp_username: str | None = Field(None, env="SMTP_USERNAME")
    smtp_password: str | None = Field(None, env="SMTP_PASSWORD")
    smtp_from_email: str = Field("", env="SMTP_FROM_EMAIL")
    smtp_use_tls: bool = Field(True, env="SMTP_USE_TLS")

    class Config:
        env_file = "../.env"

    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    # @property
    # def DATABASE_URL(self) -> str:
    #     return (
    #         f"postgresql+asyncpg://{self.database_username}:"
    #         f"{self.database_password}@{self.database_hostname}:"
    #         f"{self.database_port}/{self.database_name}"
    #     )

settings = Settings()
