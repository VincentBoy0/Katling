from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.progress import ProgressStatus, UserProgress
from models.lesson import LessonSection


class UserProgressRepository:
    """Repository for user learning progress operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    # --- Read ---
    async def get_next_section(
        self,
        user_id: int,
        lesson_id: int,
    ) -> LessonSection | None:
        """
        Get the next section that the user has not completed in a lesson.

        Args:
            user_id: ID of the user
            lesson_id: ID of the lesson

        Returns:
            LessonSection instance or None if all sections are completed
        """

        # Subquery: sections already completed by the user
        completed_sections_stmt = (
            select(UserProgress.section_id)
            .where(UserProgress.user_id == user_id)
            .where(UserProgress.lesson_id == lesson_id)
            .where(UserProgress.status == ProgressStatus.COMPLETED)
        )

        # Query: first section not in completed list
        statement = (
            select(LessonSection)
            .where(LessonSection.lesson_id == lesson_id)
            .where(LessonSection.id.notin_(completed_sections_stmt))
            .order_by(LessonSection.order_index)
        )

        result = await self.session.exec(statement)
        return result.first()
