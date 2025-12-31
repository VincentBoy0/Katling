from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from repositories.vocabRepository import VocabRepository
from schemas.vocab import SaveVocabRequest, UserWordOut


router = APIRouter(prefix="/user-words", tags=["UserWords"])


@router.get("", response_model=list[UserWordOut])
async def list_user_words(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """List all saved words of the current user."""

    repo = VocabRepository(session)
    return await repo.list_user_words(user_id=current_user.id)


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
        category=payload.category,
    )

    response.status_code = 201 if created else 200
    return user_word


@router.delete("/{word}", status_code=204)
async def delete_user_word(
    word: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Remove a vocab from the current user's saved words (idempotent)."""

    repo = VocabRepository(session)

    vocab = await repo.get_vocab_by_word(word)
    if not vocab:
        raise HTTPException(status_code=404, detail="Vocab not found")

    await repo.delete_user_word_idempotent(user_id=current_user.id, vocab_id=vocab.id)
    return Response(status_code=204)


@router.post("/{vocab_id}/promote", response_model=UserWordOut)
async def promote_user_word(
    vocab_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Promote review_status of a saved word to the next status.

    Transitions allowed:
    NEW -> LEARNING -> MASTERED
    """

    repo = VocabRepository(session)

    vocab = await repo.get_vocab_by_id(vocab_id)
    if not vocab:
        raise HTTPException(status_code=404, detail="Vocab not found")

    try:
        user_word = await repo.promote_user_word(user_id=current_user.id, vocab_id=vocab_id)
    except LookupError:
        raise HTTPException(status_code=404, detail="User word not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return user_word
