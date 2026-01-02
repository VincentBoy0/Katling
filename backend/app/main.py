import asyncio
import uvicorn
import logging
from contextlib import asynccontextmanager
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.firebase import init_firebase
from core.config import settings
from database.session import create_db_and_tables
from database.session import async_session_maker

from api import test, home, daily_missions
from api.community import friends
from api.general import auth, user, report as user_report
from api.management import admin, admin_moderator, moderator, report as manager_report
from api.learning import learning, vocab, flashcard

from services.email_service import SMTPEmailConfig, SMTPEmailService
from services.daily_study_reminder_job import DailyStudyReminderJob


# from app.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _maybe_start_scheduler() -> AsyncIOScheduler | None:
    if not settings.scheduler_enabled:
        logger.info("Scheduler disabled via SCHEDULER_ENABLED")
        return None

    tz = ZoneInfo(settings.app_timezone)
    if not settings.smtp_host or not settings.smtp_from_email:
        logger.warning(
            "SMTP not configured (SMTP_HOST/SMTP_FROM_EMAIL missing). Daily reminder job will not start."
        )
        return None

    email_service = SMTPEmailService(
        SMTPEmailConfig(
            host=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            from_email=settings.smtp_from_email,
            use_tls=settings.smtp_use_tls,
        )
    )
    reminder_job = DailyStudyReminderJob(
        session_factory=async_session_maker,
        email_service=email_service,
        app_timezone=tz,
    )

    scheduler = AsyncIOScheduler(timezone=tz)
    scheduler.add_job(
        reminder_job.enqueue,
        CronTrigger(hour=20, minute=0, timezone=tz),
        id="daily_study_reminder",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler started (timezone=%s), daily reminder at 20:00", settings.app_timezone)
    return scheduler


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler = _maybe_start_scheduler()
    try:
        yield
    finally:
        if scheduler is not None:
            scheduler.shutdown(wait=False)


app = FastAPI(lifespan=lifespan)
init_firebase()
origins = [
    'http://localhost:8000',  # URL of backend API
    "http://localhost:5173",  # URL of frontend (Vite dev server)
    "http://localhost:3000",  # Alternative frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # List of allowed origins
    allow_credentials=True,      # Allow cookies to be sent with requests
    allow_methods=["*"],         # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],         # Allow all headers (e.g., Content-Type, Authorization)
)

#---------------------------------- Routers -------------------------------------------------------
app.include_router(test.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(moderator.router)
app.include_router(admin_moderator.router)
app.include_router(user.router)
app.include_router(home.router)
app.include_router(daily_missions.router)
app.include_router(vocab.router)
app.include_router(learning.router)
app.include_router(flashcard.router)
app.include_router(user_report.router)
app.include_router(manager_report.router)
app.include_router(friends.router)
#--------------------------------------------------------------------------------------------------

# ------------------- Main -------------------
if __name__ == "__main__":
    asyncio.run(create_db_and_tables())
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


# setting up database to connect with postgres
# @app.on_event("startup")
# async def on_startup():
#     SQLModel.metadata.create_all(engine)
