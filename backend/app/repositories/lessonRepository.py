from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.lesson import Lesson


class LessonRepository:
    """Repository for Lesson database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    # --- Read ---
    async def get_lesson_by_id(self, lesson_id: int) -> Lesson | None:
        """
        Get lesson by ID.

        Args:
            lesson_id: Lesson ID

        Returns:
            Lesson instance if found, otherwise None
        """
        statement = select(Lesson).where(Lesson.id == lesson_id)
        result = await self.session.exec(statement)
        return result.first()
