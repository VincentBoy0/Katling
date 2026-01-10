from __future__ import annotations

import asyncio
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Optional


@dataclass(frozen=True)
class SMTPEmailConfig:
    host: str
    port: int
    username: Optional[str]
    password: Optional[str]
    from_email: str
    use_tls: bool = True


class SMTPEmailService:
    """Simple SMTP email service."""

    def __init__(self, config: SMTPEmailConfig):
        self._config = config

    def send_text_email(self, to_email: str, subject: str, body: str) -> None:
        if not to_email or not to_email.strip():
            raise ValueError("to_email is required")

        msg = EmailMessage()
        msg["From"] = self._config.from_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(body)

        with smtplib.SMTP(self._config.host, self._config.port, timeout=15) as smtp:
            smtp.ehlo()
            if self._config.use_tls:
                smtp.starttls()
                smtp.ehlo()

            if self._config.username:
                smtp.login(self._config.username, self._config.password or "")

            smtp.send_message(msg)

    def send_html_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> None:
        if not to_email or not to_email.strip():
            raise ValueError("to_email is required")

        msg = EmailMessage()
        msg["From"] = self._config.from_email
        msg["To"] = to_email
        msg["Subject"] = subject

        fallback_text = text_body or "Email này có định dạng HTML. Vui lòng mở bằng ứng dụng hỗ trợ HTML."
        msg.set_content(fallback_text)
        msg.add_alternative(html_body, subtype="html")

        with smtplib.SMTP(self._config.host, self._config.port, timeout=15) as smtp:
            smtp.ehlo()
            if self._config.use_tls:
                smtp.starttls()
                smtp.ehlo()

            if self._config.username:
                smtp.login(self._config.username, self._config.password or "")

            smtp.send_message(msg)

    async def send_text_email_async(self, to_email: str, subject: str, body: str) -> None:
        await asyncio.to_thread(self.send_text_email, to_email, subject, body)

    async def send_html_email_async(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> None:
        await asyncio.to_thread(self.send_html_email, to_email, subject, html_body, text_body)
