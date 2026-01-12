from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.progress import ProgressStatus, UserProgress, utc_now
from models.lesson import Lesson, LessonSection, Topic, LessonStatus


class UserProgressRepository:
    """Repository for user learning progress operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    # --- Read ---
    async def get_next_section(
        self,
        user_id: int,
        lesson_id: int,
        *,
        include_deleted: bool = True,
        published_only: bool = False,
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

        if not include_deleted or published_only:
            statement = statement.where(LessonSection.is_deleted == False)

        if published_only:
            statement = (
                statement.join(Lesson, Lesson.id == LessonSection.lesson_id)
                .join(Topic, Topic.id == Lesson.topic_id)
                .where(Lesson.status == LessonStatus.PUBLISHED)
                .where(Lesson.is_deleted == False)
                .where(Topic.status == LessonStatus.PUBLISHED)
                .where(Topic.is_deleted == False)
            )

        result = await self.session.exec(statement)
        return result.first()

    async def get_section_by_id(
        self,
        section_id: int,
        *,
        include_deleted: bool = True,
        published_only: bool = False,
    ) -> LessonSection | None:
        statement = select(LessonSection).where(LessonSection.id == section_id)

        if not include_deleted or published_only:
            statement = statement.where(LessonSection.is_deleted == False)

        if published_only:
            statement = (
                statement.join(Lesson, Lesson.id == LessonSection.lesson_id)
                .join(Topic, Topic.id == Lesson.topic_id)
                .where(Lesson.status == LessonStatus.PUBLISHED)
                .where(Lesson.is_deleted == False)
                .where(Topic.status == LessonStatus.PUBLISHED)
                .where(Topic.is_deleted == False)
            )
        result = await self.session.exec(statement)
        return result.first()

    async def get_user_progress_by_section(
        self,
        user_id: int,
        section_id: int,
    ) -> UserProgress | None:
        statement = (
            select(UserProgress)
            .where(UserProgress.user_id == user_id)
            .where(UserProgress.section_id == section_id)
        )
        result = await self.session.exec(statement)
        return result.first()

    async def upsert_section_completed(
        self,
        *,
        user_id: int,
        lesson_id: int,
        section_id: int,
        score: int,
        commit: bool = True,
    ) -> UserProgress:
        existing = await self.get_user_progress_by_section(user_id=user_id, section_id=section_id)

        if existing:
            existing.lesson_id = lesson_id
            existing.status = ProgressStatus.COMPLETED
            existing.score = score
            existing.completed_at = utc_now()
            self.session.add(existing)
            if commit:
                await self.session.commit()
                await self.session.refresh(existing)
            else:
                await self.session.flush()
            return existing

        created = UserProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            section_id=section_id,
            status=ProgressStatus.COMPLETED,
            score=score,
            completed_at=utc_now(),
        )
        self.session.add(created)
        if commit:
            await self.session.commit()
            await self.session.refresh(created)
        else:
            await self.session.flush()
        return created
