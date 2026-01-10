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
    html_body: str
    text_body: str


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
            text_body=(
                "Chào bạn,\n\n"
                "Hôm nay bạn chưa học trên Katling.\n"
                "Hãy dành vài phút để luyện tập và duy trì streak nhé!\n\n"
                "Chúc bạn học tốt,\n"
                "Đội ngũ Katling"
            ),
            html_body=(
                "<!DOCTYPE html>"
                "<html lang=\"vi\">"
                "<head>"
                "  <meta charset=\"UTF-8\" />"
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />"
                "  <style>"
                "    * { box-sizing: border-box; }"
                "    body { margin: 0; padding: 0; background: #f5f7fb; }"
                "    .outer-container {"
                "      background-color: #f2e9fa;"
                "      border: 2px solid #934FBF;"
                "      border-radius: 10px;"
                "      padding: 20px;"
                "      width: 740px;"
                "      max-width: 92vw;"
                "      margin: 40px auto;"
                "      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;"
                "      color: #333;"
                "    }"
                "    .app__name {"
                "      text-align: center;"
                "      font-size: 28px;"
                "      color: #934FBF;"
                "      font-weight: 800;"
                "      margin: 0 0 12px 0;"
                "    }"
                "    .inner-container {"
                "      background-color: #ffffff;"
                "      border-radius: 10px;"
                "      padding: 20px;"
                "      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);"
                "    }"
                "    .app__desc { text-align: center; margin: 0; }"
                "    .divider { border-bottom: 1px solid #ccc; margin: 16px 0; }"
                "    p { font-size: 16px; line-height: 1.6; margin: 12px 0; }"
                "    .highlight { font-weight: 800; color: #CA3500; }"
                "    .flame { margin-left: 6px; }"
                "    .cta {"
                "      display: inline-block;"
                "      margin-top: 12px;"
                "      padding: 10px 14px;"
                "      border-radius: 10px;"
                "      background: #934FBF;"
                "      color: #fff !important;"
                "      text-decoration: none;"
                "      font-weight: 700;"
                "    }"
                "    .muted { color: #667085; font-size: 14px; }"
                "  </style>"
                "</head>"
                "<body>"
                "  <div class=\"outer-container\">"
                "    <p class=\"app__name\">Katling</p>"
                "    <div class=\"inner-container\">"
                "      <p class=\"app__desc\">Nhắc bạn học mỗi ngày để duy trì <span class=\"highlight\">streak</span><span class=\"flame\" aria-hidden=\"true\">🔥</span>.</p>"
                "      <div class=\"divider\"></div>"
                "      <p>Chào bạn,</p>"
                "      <p>Hôm nay bạn <span class=\"highlight\">chưa học</span> trên Katling.</p>"
                "      <p>Hãy dành vài phút để ôn tập từ vựng, làm bài luyện tập và giữ chuỗi ngày học nhé.</p>"
                "      <p class=\"muted\">Nếu bạn đã học hôm nay, bạn có thể bỏ qua email này.</p>"
                "      <div class=\"divider\"></div>"
                "      <p>Chúc bạn học tốt,<br/><strong>Đội ngũ Katling</strong></p>"
                "    </div>"
                "  </div>"
                "</body>"
                "</html>"
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
                    await self._email_service.send_html_email_async(
                        to_email=user.email,
                        subject=self._template.subject,
                        html_body=self._template.html_body,
                        text_body=self._template.text_body,
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
