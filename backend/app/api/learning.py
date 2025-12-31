from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

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
