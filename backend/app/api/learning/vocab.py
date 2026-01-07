from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from repositories.vocabRepository import VocabRepository
from schemas.vocab import SaveVocabRequest, UserWordOut, UserWordWithVocabOut, VocabSearchResponse
from services.mission_service import MissionService
from services.dictionary_service import (
    DictionaryUpstreamError,
    DictionaryWordNotFoundError,
    lookup_word,
)


router = APIRouter()


@router.get("/vocabs/search", response_model=VocabSearchResponse, tags=["Vocabs"])
async def search_vocab(word: str):
    """Search a vocab via dictionaryapi.dev."""

    try:
        payload = await lookup_word(word)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except DictionaryWordNotFoundError:
        raise HTTPException(status_code=404, detail="Word not found")
    except DictionaryUpstreamError:
        raise HTTPException(status_code=502, detail="Dictionary service unavailable")

    return payload


@router.get(
    "/user-words",
    response_model=list[UserWordWithVocabOut],
    response_model_by_alias=False,
    tags=["UserWords"],
)
async def list_user_words(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """List all saved words of the current user."""

    repo = VocabRepository(session)
    return await repo.list_user_words_with_vocab(user_id=current_user.id)


@router.post(
    "/user-words",
    response_model=UserWordOut,
    response_model_by_alias=False,
    tags=["UserWords"],
)
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
            phonetic=payload.phonetic,
        )

    user_word, created = await repo.save_user_word_idempotent(
        user_id=current_user.id,
        vocab_id=vocab.id,
        category=payload.category,
    )

    if created:
        mission_service = MissionService(session)
        await mission_service.on_word_saved(user_id=current_user.id)

    response.status_code = 201 if created else 200
    return user_word


@router.delete("/user-words/{user_word_id}", status_code=204, tags=["UserWords"])
async def delete_user_word(
    user_word_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Remove a vocab from the current user's saved words (idempotent)."""

    repo = VocabRepository(session)

    user_word = await repo.get_user_word_by_id(user_word_id=user_word_id, user_id=current_user.id)
    if not user_word:
        raise HTTPException(status_code=404, detail="User word not found")

    await repo.delete_user_word_by_id_idempotent(user_id=current_user.id, user_word_id=user_word_id)
    return Response(status_code=204)


@router.post(
    "/user-words/{user_word_id}/promote",
    response_model=UserWordOut,
    response_model_by_alias=False,
    tags=["UserWords"],
)
async def promote_user_word(
    user_word_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Promote review_status of a saved word to the next status.

    Transitions allowed:
    NEW -> LEARNING -> MASTERED
    """

    repo = VocabRepository(session)

    try:
        user_word = await repo.promote_user_word_by_id(user_id=current_user.id, user_word_id=user_word_id)
    except LookupError:
        raise HTTPException(status_code=404, detail="User word not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return user_word
