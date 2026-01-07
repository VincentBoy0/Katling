from __future__ import annotations

from typing import Optional, Dict, Any
from sqlmodel import select, update
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.exc import IntegrityError

from models.vocab import Vocab, UserWord, ReviewStatus, utc_now


def _normalize_category(category: Optional[str]) -> Optional[str]:
    if category is None:
        return None
    normalized = " ".join(category.strip().split()).lower()
    return normalized or None


class VocabRepository:
    """Repository for Vocab/UserWord database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_vocab_by_id(self, vocab_id: int) -> Vocab | None:
        statement = select(Vocab).where(Vocab.id == vocab_id)
        result = await self.session.exec(statement)
        return result.first()

    async def get_vocab_by_word(self, word: str) -> Vocab | None:
        statement = select(Vocab).where(Vocab.word == word)
        result = await self.session.exec(statement)
        return result.first()

    async def create_vocab(
        self,
        word: str,
        definition: Optional[Dict[str, Any]] = None,
        audio_url: Optional[str] = None,
        phonetic: Optional[str] = None,
    ) -> Vocab:
        vocab = Vocab(word=word, definition=definition, audio_url=audio_url, phonetic=phonetic)
        self.session.add(vocab)
        try:
            await self.session.commit()
        except IntegrityError:
            # Unique word hit (race) -> return existing
            await self.session.rollback()
            existing = await self.get_vocab_by_word(word)
            if existing:
                return existing
            raise

        await self.session.refresh(vocab)
        return vocab

    async def get_or_create_vocab(
        self,
        word: str,
        definition: Optional[Dict[str, Any]] = None,
        audio_url: Optional[str] = None,
        phonetic: Optional[str] = None,
    ) -> Vocab:
        existing = await self.get_vocab_by_word(word)
        if existing:
            return existing
        return await self.create_vocab(word=word, definition=definition, audio_url=audio_url, phonetic=phonetic)

    async def get_user_word(self, user_id: int, vocab_id: int) -> UserWord | None:
        statement = select(UserWord).where(
            UserWord.user_id == user_id,
            UserWord.word_id == vocab_id,
        )
        result = await self.session.exec(statement)
        return result.first()

    async def get_user_word_by_id(self, *, user_word_id: int, user_id: int) -> UserWord | None:
        statement = select(UserWord).where(
            UserWord.id == user_word_id,
            UserWord.user_id == user_id,
        )
        result = await self.session.exec(statement)
        return result.first()

    async def list_user_words(self, user_id: int) -> list[UserWord]:
        statement = (
            select(UserWord)
            .where(UserWord.user_id == user_id)
            .order_by(UserWord.created_at.desc())
        )
        result = await self.session.exec(statement)
        return result.all()

    async def list_flashcards(
        self,
        *,
        user_id: int,
        review_status: ReviewStatus | None = None,
        category: str | None = None,
    ) -> list[tuple[UserWord, Vocab]]:
        statement = (
            select(UserWord, Vocab)
            .join(Vocab, UserWord.word_id == Vocab.id)
            .where(UserWord.user_id == user_id)
        )

        if review_status is not None:
            statement = statement.where(UserWord.review_status == review_status)

        normalized_category = _normalize_category(category)
        if normalized_category is not None:
            statement = statement.where(UserWord.category == normalized_category)

        result = await self.session.exec(statement)
        return result.all()

    async def touch_last_reviewed_at(self, *, user_id: int, user_word_ids: list[int]) -> int:
        if not user_word_ids:
            return 0

        now = utc_now()
        statement = (
            update(UserWord)
            .where(UserWord.user_id == user_id)
            .where(UserWord.id.in_(user_word_ids))
            .values(last_reviewed_at=now)
        )

        result = await self.session.exec(statement)
        await self.session.commit()
        return int(getattr(result, "rowcount", 0) or 0)

    async def list_user_words_with_vocab(self, user_id: int) -> list[dict[str, Any]]:
        statement = (
            select(UserWord, Vocab)
            .join(Vocab, UserWord.word_id == Vocab.id)
            .where(UserWord.user_id == user_id)
            .order_by(UserWord.created_at.desc())
        )

        result = await self.session.exec(statement)
        rows: list[tuple[UserWord, Vocab]] = result.all()

        out: list[dict[str, Any]] = []
        for user_word, vocab in rows:
            out.append(
                {
                    "id": user_word.id,
                    "user_id": user_word.user_id,
                    "word_id": user_word.word_id,
                    "category": user_word.category,
                    "status": user_word.status,
                    "review_status": user_word.review_status,
                    "last_reviewed_at": user_word.last_reviewed_at,
                    "next_reviewed_at": user_word.next_reviewed_at,
                    "created_at": user_word.created_at,
                    "word": vocab.word,
                    "definition": vocab.definition,
                    "audio_url": vocab.audio_url,
                    "phonetic": getattr(vocab, "phonetic", None),
                }
            )

        return out

    async def save_user_word_idempotent(
        self,
        user_id: int,
        vocab_id: int,
        status: Optional[Dict[str, Any]] = None,
        category: Optional[str] = None,
    ) -> tuple[UserWord, bool]:
        """Return (user_word, created)."""
        normalized_category = _normalize_category(category)
        existing = await self.get_user_word(user_id=user_id, vocab_id=vocab_id)
        if existing:
            if normalized_category is not None and existing.category != normalized_category:
                existing.category = normalized_category
                await self.session.commit()
                await self.session.refresh(existing)
            return existing, False

        user_word = UserWord(
            user_id=user_id,
            word_id=vocab_id,
            status=status,
            category=normalized_category,
            review_status=ReviewStatus.NEWBIE
        )
        self.session.add(user_word)
        try:
            await self.session.commit()
        except IntegrityError:
            # Another request inserted the same row concurrently.
            await self.session.rollback()
            existing = await self.get_user_word(user_id=user_id, vocab_id=vocab_id)
            if existing:
                if normalized_category is not None and existing.category != normalized_category:
                    existing.category = normalized_category
                    await self.session.commit()
                    await self.session.refresh(existing)
                return existing, False
            raise

        await self.session.refresh(user_word)
        return user_word, True

    async def delete_user_word_idempotent(self, user_id: int, vocab_id: int) -> bool:
        """Delete the saved word for a user.

        Returns True if a row was deleted, False if it didn't exist.
        """

        existing = await self.get_user_word(user_id=user_id, vocab_id=vocab_id)
        if not existing:
            return False

        await self.session.delete(existing)
        await self.session.commit()
        return True

    async def delete_user_word_by_id_idempotent(self, *, user_id: int, user_word_id: int) -> bool:
        """Delete the saved word for a user by user_word_id.

        Returns True if a row was deleted, False if it didn't exist.
        """

        existing = await self.get_user_word_by_id(user_word_id=user_word_id, user_id=user_id)
        if not existing:
            return False

        await self.session.delete(existing)
        await self.session.commit()
        return True

    async def promote_user_word(self, user_id: int, vocab_id: int) -> UserWord:
        """Promote review_status for a saved word to the next level.

        Allowed transitions:
        - NEW -> LEARNING
        - LEARNING -> MASTERED
        """

        user_word = await self.get_user_word(user_id=user_id, vocab_id=vocab_id)
        if not user_word:
            raise LookupError("UserWord not found")

        next_status_map: dict[ReviewStatus, ReviewStatus] = {
            ReviewStatus.NEWBIE: ReviewStatus.LEARNING,
            ReviewStatus.LEARNING: ReviewStatus.MASTERED,
        }

        next_status = next_status_map.get(user_word.review_status)
        if not next_status:
            raise ValueError("Cannot promote review_status from current status")

        now = utc_now()
        user_word.review_status = next_status
        user_word.last_reviewed_at = now
        user_word.next_reviewed_at = now

        await self.session.commit()
        await self.session.refresh(user_word)
        return user_word

    async def promote_user_word_by_id(self, *, user_id: int, user_word_id: int) -> UserWord:
        """Promote review_status for a saved word to the next level by user_word_id.

        Allowed transitions:
        - NEW -> LEARNING
        - LEARNING -> MASTERED
        """

        user_word = await self.get_user_word_by_id(user_word_id=user_word_id, user_id=user_id)
        if not user_word:
            raise LookupError("UserWord not found")

        next_status_map: dict[ReviewStatus, ReviewStatus] = {
            ReviewStatus.NEWBIE: ReviewStatus.LEARNING,
            ReviewStatus.LEARNING: ReviewStatus.MASTERED,
        }

        next_status = next_status_map.get(user_word.review_status)
        if not next_status:
            raise ValueError("Cannot promote review_status from current status")

        now = utc_now()
        user_word.review_status = next_status
        user_word.last_reviewed_at = now
        user_word.next_reviewed_at = now

        await self.session.commit()
        await self.session.refresh(user_word)
        return user_word
