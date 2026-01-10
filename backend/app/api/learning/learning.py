from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Any, List

from core.security import get_current_user
from repositories.lessonRepository import LessonRepository
from repositories.progressRepository import UserProgressRepository
from repositories.topicRepository import TopicRepository
from repositories.userRepository import UserRepository
from schemas.learning import (
	CompleteSectionRequest,
	CompleteSectionResponse,
	NextSectionResponse,
	TopicLessonsResponse,
)
from database.session import get_session
from repositories.questionRepository import QuestionRepository
from schemas.lesson import (
	QuestionAnswerSubmitRequest,
	QuestionAnswerSubmitResponse,
	LearningState,
	SectionQuestionsResponse,
)
from models.lesson import QuestionType
from models.progress import ProgressStatus
from models.user import ActivityType
from schemas.topic import TopicProgressOut, TopicsResponse
from services.mission_service import MissionService

router = APIRouter(tags=["Learning"])


XP_PER_SECTION = 20


@router.get("/topics", response_model=TopicsResponse)
async def get_topics(
	session: AsyncSession = Depends(get_session),
	current_user=Depends(get_current_user),
) -> TopicsResponse:
	"""Return topics with derived status and progress for current user."""

	topic_repo = TopicRepository(session)
	topics_raw = await topic_repo.get_topics_progress(user_id=current_user.id)

	if not topics_raw:
		return TopicsResponse(topics=[])

	# Determine the single "current" topic:
	# - first topic that isn't fully completed
	# - if all are completed, make the last topic "current" (progress=100)
	current_index = None
	for idx, t in enumerate(topics_raw):
		if t["total_sections"] > 0 and t["completed_sections"] < t["total_sections"]:
			current_index = idx
			break
	if current_index is None:
		current_index = len(topics_raw) - 1

	topics_out: List[TopicProgressOut] = []
	for idx, t in enumerate(topics_raw):
		# All topics are accessible - no locking
		# Only mark as completed if fully done, otherwise current
		if idx < current_index:
			status = "completed"
		else:
			status = "current"

		topics_out.append(
			TopicProgressOut(
				id=t["id"],
				name=t["name"],
				description=t["description"],
				status=status,  # type: ignore[arg-type]
				progress=t["progress"],
			)
		)

	return TopicsResponse(topics=topics_out)


@router.get("/topics/{topic_id}/lessons", response_model=TopicLessonsResponse)
async def get_topic_lessons(
	topic_id: int,
	session: AsyncSession = Depends(get_session),
	current_user=Depends(get_current_user),
) -> TopicLessonsResponse:
	"""Return lessons in a topic with per-user progress."""

	topic_repo = TopicRepository(session)
	# 404 if topic not exist
	await topic_repo.get_topic_by_id(topic_id)

	# No topic locking - all topics are accessible
	lesson_repo = LessonRepository(session)
	lessons_raw = await lesson_repo.get_lessons_progress_by_topic(user_id=current_user.id, topic_id=topic_id)

	lessons_out = []
	previous_completed = True  # First lesson is always available
	
	for l in lessons_raw:
		total = int(l["total_sections"])
		completed = int(l["completed_sections"])
		progress = int((completed * 100) / total) if total > 0 else 0
		progress = max(0, min(100, progress))
		
		# Determine lesson status based on previous lesson completion
		is_completed = total > 0 and completed >= total
		if is_completed:
			status = "completed"
		elif previous_completed:
			status = "available"
		else:
			status = "locked"
		
		# Get sections for this lesson
		sections = await lesson_repo.get_sections_with_progress(
			user_id=current_user.id,
			lesson_id=int(l["id"])
		)
		
		lessons_out.append(
			{
				"id": int(l["id"]),
				"type": l["type"],
				"title": l["title"],
				"description": None,  # Add description if available in Lesson model
				"progress": progress,
				"status": status,
				"order_index": int(l["order_index"]),
				"sections": sections,
			}
		)
		
		# Update previous_completed for next iteration
		previous_completed = is_completed

	return TopicLessonsResponse(topic_id=topic_id, lessons=lessons_out)


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
	current_user=Depends(get_current_user),
) -> QuestionAnswerSubmitResponse:
	user_repo = UserRepository(session)
	remaining_energy = await user_repo.consume_learning_energy(current_user.id, cost=1)

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
		learning_state=LearningState(energy=remaining_energy),
	)



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


@router.post(
	"/lessons/{lesson_id}/sections/{section_id}/complete",
	response_model=CompleteSectionResponse,
)
async def complete_section(
	lesson_id: int,
	section_id: int,
	payload: CompleteSectionRequest,
	session: AsyncSession = Depends(get_session),
	current_user=Depends(get_current_user),
) -> CompleteSectionResponse:
	"""Mark a section as completed for the current user."""

	lesson_repo = LessonRepository(session)
	progress_repo = UserProgressRepository(session)

	lesson = await lesson_repo.get_lesson_by_id(lesson_id)
	if not lesson:
		raise HTTPException(status_code=404, detail="Lesson not found")

	section = await progress_repo.get_section_by_id(section_id)
	if not section:
		raise HTTPException(status_code=404, detail="Section not found")

	if section.lesson_id != lesson_id:
		raise HTTPException(status_code=400, detail="Section does not belong to lesson")

	# Section must be the next uncompleted section
	next_section = await progress_repo.get_next_section(user_id=current_user.id, lesson_id=lesson_id)

	# Reject re-submitting completed section
	progress = await progress_repo.get_user_progress_by_section(user_id=current_user.id, section_id=section_id)
	if progress and progress.status == ProgressStatus.COMPLETED:
		raise HTTPException(status_code=409, detail="Section already completed")

	if not next_section or next_section.id != section_id:
		raise HTTPException(status_code=403, detail="Section is not the next section")

	user_repo = UserRepository(session)

	# Single transaction boundary per request: router controls commit/rollback.
	# Repositories/services must not commit implicitly.
	try:
		await progress_repo.upsert_section_completed(
			user_id=current_user.id,
			lesson_id=lesson_id,
			section_id=section_id,
			score=payload.score,
			commit=False,
		)
		await user_repo.add_xp(current_user.id, amount=XP_PER_SECTION, commit=False)
		await user_repo.log_xp_activity(
			current_user.id,
			activity_type=ActivityType.LESSON_COMPLETE,
			xp_amount=XP_PER_SECTION,
			commit=False,
		)

		mission_service = MissionService(session)
		await mission_service.on_lesson_completed(
			user_id=current_user.id,
			lesson_type=lesson.type,
			score=payload.score,
		)

		_, is_streak_increased_today = await user_repo.update_streak_on_activity(current_user.id)

		await session.commit()
	except HTTPException:
		await session.rollback()
		raise
	except Exception:
		await session.rollback()
		raise

	return CompleteSectionResponse(
		lesson_id=lesson_id,
		section_id=section_id,
		score=payload.score,
		xp=XP_PER_SECTION,
		streak=1 if is_streak_increased_today else 0,
	)
