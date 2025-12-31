from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Any

from database.session import get_session
from repositories.questionRepository import QuestionRepository
from schemas.lesson import (
	QuestionAnswerSubmitRequest,
	QuestionAnswerSubmitResponse,
	SectionQuestionsResponse,
)
from models.lesson import QuestionType

router = APIRouter(tags=["Learning"])


def _canonicalize(value: Any, *, string_casefold: bool, unordered_lists: bool) -> Any:
	if isinstance(value, dict):
		return {k: _canonicalize(v, string_casefold=string_casefold, unordered_lists=unordered_lists) for k, v in sorted(value.items())}
	if isinstance(value, list):
		normalized = [_canonicalize(v, string_casefold=string_casefold, unordered_lists=unordered_lists) for v in value]
		if unordered_lists:
			return sorted(normalized, key=lambda x: repr(x))
		return normalized
	if isinstance(value, str) and string_casefold:
		return value.strip().casefold()
	return value


def _is_answer_correct(question_type: QuestionType, submitted: Any, correct: Any) -> bool:
	string_casefold = question_type in {QuestionType.FILL_IN_THE_BLANK, QuestionType.TRANSCRIPT}
	unordered_lists = question_type in {QuestionType.MULTIPLE_SELECT, QuestionType.MATCHING}
	return _canonicalize(submitted, string_casefold=string_casefold, unordered_lists=unordered_lists) == _canonicalize(
		correct, string_casefold=string_casefold, unordered_lists=unordered_lists
	)


@router.get("/sections/{section_id}/questions", response_model=SectionQuestionsResponse)
async def get_section_questions(
	section_id: int,
	session: AsyncSession = Depends(get_session),
) -> SectionQuestionsResponse:
	question_repo = QuestionRepository(session)
	if not await question_repo.section_exists(section_id):
		raise HTTPException(status_code=404, detail="Section not found")

	questions = await question_repo.get_questions_by_section(section_id)
	return SectionQuestionsResponse(section_id=section_id, questions=questions)


@router.post("/questions/{question_id}/answer", response_model=QuestionAnswerSubmitResponse)
async def submit_question_answer(
	question_id: int,
	payload: QuestionAnswerSubmitRequest,
	session: AsyncSession = Depends(get_session),
) -> QuestionAnswerSubmitResponse:
	question_repo = QuestionRepository(session)
	question = await question_repo.get_question_by_id(question_id)
	if not question:
		raise HTTPException(status_code=404, detail="Question not found")

	if question.correct_answer is None:
		raise HTTPException(status_code=400, detail="Question has no correct answer to grade")

	is_correct = _is_answer_correct(question.type, payload.answer, question.correct_answer)
	return QuestionAnswerSubmitResponse(
		question_id=question.id,
		section_id=question.section_id,
		is_correct=is_correct,
		correct_answer=None if is_correct else question.correct_answer,
	)

from database.session import get_session
from core.security import get_current_user
from repositories.lessonRepository import LessonRepository
from repositories.progressRepository import UserProgressRepository
from schemas.learning import NextSectionResponse

router = APIRouter(prefix="/learning", tags=["Learning"])


@router.get("/lessons/{lesson_id}/next-section", response_model=NextSectionResponse)
async def get_next_section(
    lesson_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Return the next section that the user has not completed in the given lesson.
    """

    lesson_repo = LessonRepository(session)
    progress_repo = UserProgressRepository(session)

    # 1. Check lesson exists
    lesson = await lesson_repo.get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # 2. Get next uncompleted section
    section = await progress_repo.get_next_section(
        user_id=current_user.id,
        lesson_id=lesson_id,
    )

    if not section:
        return {
            "status": "completed",
            "message": "All sections in this lesson have been completed"
        }

    return {
        "lesson_id": lesson_id,
        "section": section
    }
