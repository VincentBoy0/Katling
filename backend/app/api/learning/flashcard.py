from __future__ import annotations

import random
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from models.vocab import ReviewStatus
from repositories.vocabRepository import VocabRepository
from schemas.flashcard import (
	FlashcardMode,
	FlashcardCard,
	FlashcardsCompleteRequest,
	FlashcardsResponse,
)
from services.mission_service import MissionService


router = APIRouter(prefix="/learning", tags=["Flashcards"])


def _parse_review_status(raw: str) -> ReviewStatus:
	value = raw.strip().upper()
	try:
		return ReviewStatus(value)
	except ValueError as exc:
		raise ValueError("Invalid review_status") from exc


def _primary_definition(definition: object) -> str:
	if not isinstance(definition, dict):
		return ""

	# definition is stored as { part_of_speech: [def1, def2, ...], ... }
	for key in sorted(definition.keys(), key=lambda k: str(k)):
		values = definition.get(key)
		if not isinstance(values, list):
			continue
		for item in values:
			if isinstance(item, str) and item.strip():
				return item.strip()
	return ""


@router.get("/flashcards", response_model=FlashcardsResponse)
async def get_flashcards(
	mode: FlashcardMode = FlashcardMode.all,
	review_status: Optional[str] = None,
	category: Optional[str] = None,
	session: AsyncSession = Depends(get_session),
	current_user=Depends(get_current_user),
):
	repo = VocabRepository(session)

	rs: ReviewStatus | None = None
	cat: str | None = None

	if mode == FlashcardMode.review_status:
		if not review_status:
			raise HTTPException(status_code=400, detail="review_status is required when mode=review_status")
		try:
			rs = _parse_review_status(review_status)
		except ValueError:
			raise HTTPException(status_code=400, detail="Invalid review_status")
	elif mode == FlashcardMode.category:
		if not category or not category.strip():
			raise HTTPException(status_code=400, detail="category is required when mode=category")
		cat = category

	rows = await repo.list_flashcards(user_id=current_user.id, review_status=rs, category=cat)

	cards: list[FlashcardCard] = []
	for user_word, vocab in rows:
		cards.append(
			FlashcardCard(
				user_word_id=user_word.id,
				word=vocab.word,
				definition=_primary_definition(vocab.definition),
				phonetic=None,
				audio_url=vocab.audio_url,
			)
		)

	random.shuffle(cards)
	return FlashcardsResponse(total=len(cards), cards=cards)


@router.post("/flashcards/complete", status_code=204)
async def complete_flashcards(
	payload: FlashcardsCompleteRequest,
	session: AsyncSession = Depends(get_session),
	current_user=Depends(get_current_user),
):
	repo = VocabRepository(session)
	await repo.touch_last_reviewed_at(user_id=current_user.id, user_word_ids=payload.user_word_ids)
	mission_service = MissionService(session)
	await mission_service.on_flashcard_reviewed(user_id=current_user.id)
	return Response(status_code=204)
