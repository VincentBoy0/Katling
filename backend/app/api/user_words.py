from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from repositories.vocabRepository import VocabRepository
from schemas.vocab import UserWordOut, UserWordSaveIn


router = APIRouter(prefix="/user-words", tags=["UserWords"])


@router.post("", response_model=UserWordOut)
async def save_user_word(
    payload: UserWordSaveIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Save a vocab to the current user's saved words (idempotent)."""

    repo = VocabRepository(session)

    vocab = await repo.get_vocab_by_id(payload.vocab_id)
    if not vocab:
        raise HTTPException(status_code=404, detail="Vocab not found")

    user_word, created = await repo.save_user_word_idempotent(
        user_id=current_user.id,
        vocab_id=payload.vocab_id,
        status=payload.status,
    )

    response.status_code = 201 if created else 200
    return user_word
