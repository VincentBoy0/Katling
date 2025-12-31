from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from repositories.vocabRepository import VocabRepository
from schemas.vocab import SaveVocabRequest, UserWordOut


router = APIRouter(prefix="/user-words", tags=["UserWords"])


@router.post("", response_model=UserWordOut)
async def save_user_word(
    payload: SaveVocabRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Save a vocab to the current user's saved words (idempotent)."""

    repo = VocabRepository(session)

    vocab = await repo.get_vocab_by_word(payload.word)
    if not vocab:
        vocab = await repo.create_vocab(
            word=payload.word,
            definition=payload.definition,
            audio_url=payload.audio_url,
        )

    user_word, created = await repo.save_user_word_idempotent(
        user_id=current_user.id,
        vocab_id=vocab.id,
    )

    response.status_code = 201 if created else 200
    return user_word
