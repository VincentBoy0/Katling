from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Callable, Awaitable

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.user import User
from services.email_service import SMTPEmailService

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DailyStudyReminderTemplate:
    subject: str
    body: str


class DailyStudyReminderJob:
    """Daily 20:00 reminder job.

    Rules:
    - If user.last_active_date is NULL OR older than today (app timezone) => considered not studied today.
    - Send a reminder email.
    """

    def __init__(
        self,
        session_factory: Callable[[], AsyncSession],
        email_service: SMTPEmailService,
        app_timezone,  # ZoneInfo, kept untyped to avoid extra imports in student project
        template: DailyStudyReminderTemplate | None = None,
    ):
        self._session_factory = session_factory
        self._email_service = email_service
        self._tz = app_timezone
        self._template = template or DailyStudyReminderTemplate(
            subject="Katling - Nhắc bạn học hôm nay",
            body=(
                "Chào bạn,\n\n"
                "Hôm nay bạn chưa học bài trên Katling.\n"
                "Hãy dành vài phút để luyện tập và duy trì streak nhé!\n\n"
                "Katling Team"
            ),
        )

    def enqueue(self) -> None:
        """APScheduler expects a normal callable.

        We enqueue the actual async work onto the running event loop.
        """

        try:
            asyncio.get_running_loop()
        except RuntimeError:
            logger.warning("DailyStudyReminderJob.enqueue called without a running event loop")
            return

        asyncio.create_task(self.run())

    async def run(self) -> None:
        today_local = datetime.now(self._tz).date()
        logger.info("DailyStudyReminderJob started (today=%s)", today_local)

        async with self._session_factory() as session:
            users = await self._fetch_users(session)

        sent = 0
        skipped = 0

        for user in users:
            if not user.email or not user.email.strip():
                skipped += 1
                continue
            if getattr(user, "is_banned", False):
                skipped += 1
                continue

            if self._should_remind(user.last_active_date, today_local):
                try:
                    await self._email_service.send_text_email_async(
                        to_email=user.email,
                        subject=self._template.subject,
                        body=self._template.body,
                    )
                    sent += 1
                except Exception:
                    logger.exception("Failed to send reminder email to %s", user.email)
            else:
                skipped += 1

        logger.info("DailyStudyReminderJob finished (sent=%s, skipped=%s)", sent, skipped)

    async def _fetch_users(self, session: AsyncSession) -> list[User]:
        stmt = select(User)
        result = await session.exec(stmt)
        return result.all()

    def _should_remind(self, last_active_date: datetime | None, today_local) -> bool:
        if last_active_date is None:
            return True

        dt = last_active_date
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)

        last_active_local_date = dt.astimezone(self._tz).date()
        return last_active_local_date < today_local
