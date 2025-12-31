from __future__ import annotations

from typing import Optional, Dict, Any
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.exc import IntegrityError

from models.vocab import Vocab, UserWord


class VocabRepository:
    """Repository for Vocab/UserWord database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_vocab_by_id(self, vocab_id: int) -> Vocab | None:
        statement = select(Vocab).where(Vocab.id == vocab_id)
        result = await self.session.exec(statement)
        return result.first()

    async def get_user_word(self, user_id: int, vocab_id: int) -> UserWord | None:
        statement = select(UserWord).where(
            UserWord.user_id == user_id,
            UserWord.word_id == vocab_id,
        )
        result = await self.session.exec(statement)
        return result.first()

    async def save_user_word_idempotent(
        self,
        user_id: int,
        vocab_id: int,
        status: Optional[Dict[str, Any]] = None,
    ) -> tuple[UserWord, bool]:
        """Return (user_word, created)."""
        existing = await self.get_user_word(user_id=user_id, vocab_id=vocab_id)
        if existing:
            return existing, False

        user_word = UserWord(user_id=user_id, word_id=vocab_id, status=status)
        self.session.add(user_word)
        try:
            await self.session.commit()
        except IntegrityError:
            # Another request inserted the same row concurrently.
            await self.session.rollback()
            existing = await self.get_user_word(user_id=user_id, vocab_id=vocab_id)
            if existing:
                return existing, False
            raise

        await self.session.refresh(user_word)
        return user_word, True
