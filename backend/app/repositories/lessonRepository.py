from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status
from typing import List, Optional

from sqlalchemy import func

from models.lesson import Lesson, Topic
from models.lesson import LessonSection
from models.progress import ProgressStatus, UserProgress
from schemas.lesson import LessonCreate, LessonUpdate


class LessonRepository:
    """Repository for Lesson database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    # --- Create ---
    async def create_lesson(self, user_id: int, form: LessonCreate) -> Lesson:
        """Create a new lesson.
        
        Args:
            user_id: ID of the user creating the lesson
            form: LessonCreate schema with lesson details
            
        Returns:
            Created Lesson object
            
        Raises:
            HTTPException: If topic not found
        """
        # Verify topic exists
        topic = await self._get_topic_by_id(form.topic_id)
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Topic {form.topic_id} not found"
            )
        
        lesson_data = form.dict(exclude_unset=True)
        lesson = Lesson(**lesson_data, created_by=user_id)
        self.session.add(lesson)
        await self.session.commit()
        await self.session.refresh(lesson)
        return lesson

    # --- Read ---
    async def get_lesson_by_id(self, lesson_id: int, include_deleted: bool = False) -> Lesson:
        """Get lesson by ID.

        Args:
            lesson_id: Lesson ID
            include_deleted: Whether to include soft-deleted lessons

        Returns:
            Lesson instance
            
        Raises:
            HTTPException: If lesson not found
        """
        stmt = select(Lesson).where(Lesson.id == lesson_id)
        if not include_deleted:
            stmt = stmt.where(Lesson.is_deleted == False)
        
        result = await self.session.exec(stmt)
        lesson = result.first()
        
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson {lesson_id} not found"
            )
        return lesson

    async def get_lessons_by_topic(
        self, 
        topic_id: int, 
        skip: int = 0, 
        limit: int = 100,
        include_deleted: bool = False
    ) -> List[Lesson]:
        """Get all lessons in a topic.

        Args:
            topic_id: Topic ID
            skip: Number of records to skip
            limit: Maximum records to return
            include_deleted: Whether to include soft-deleted lessons

        Returns:
            List of Lesson objects
        """
        stmt = (
            select(Lesson)
            .where(Lesson.topic_id == topic_id)
            .order_by(Lesson.order_index, Lesson.id)
            .offset(skip)
            .limit(limit)
        )
        if not include_deleted:
            stmt = stmt.where(Lesson.is_deleted == False)
        
        result = await self.session.exec(stmt)
        return result.all()

    async def get_lessons_progress_by_topic(
        self,
        *,
        user_id: int,
        topic_id: int,
        include_deleted: bool = False,
    ) -> list[dict]:
        """Return lessons in a topic with per-user progress.

        Progress is derived from section-level `user_progress` rows.
        Each item contains: id, type, title, total_sections, completed_sections.
        """

        statement = (
            select(
                Lesson.id.label("lesson_id"),
                Lesson.type.label("type"),
                Lesson.title.label("title"),
                Lesson.order_index.label("order_index"),
                func.count(func.distinct(LessonSection.id)).label("total_sections"),
                func.count(func.distinct(UserProgress.section_id)).label("completed_sections"),
            )
            .select_from(Lesson)
            .join(
                LessonSection,
                (LessonSection.lesson_id == Lesson.id) & (LessonSection.is_deleted == False),
                isouter=True,
            )
            .join(
                UserProgress,
                (UserProgress.section_id == LessonSection.id)
                & (UserProgress.user_id == user_id)
                & (UserProgress.status == ProgressStatus.COMPLETED),
                isouter=True,
            )
            .where(Lesson.topic_id == topic_id)
            .group_by(Lesson.id, Lesson.type, Lesson.title, Lesson.order_index)
            .order_by(Lesson.order_index, Lesson.id)
        )

        if not include_deleted:
            statement = statement.where(Lesson.is_deleted == False)

        result = await self.session.exec(statement)
        rows = result.all()

        out: list[dict] = []
        for row in rows:
            out.append(
                {
                    "id": int(row.lesson_id),
                    "type": str(row.type),
                    "title": row.title,
                    "total_sections": int(row.total_sections or 0),
                    "completed_sections": int(row.completed_sections or 0),
                }
            )
        return out

    async def get_lessons_by_creator(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        include_deleted: bool = False
    ) -> List[Lesson]:
        """Get all lessons created by a user.

        Args:
            user_id: Creator user ID
            skip: Number of records to skip
            limit: Maximum records to return
            include_deleted: Whether to include soft-deleted lessons

        Returns:
            List of Lesson objects
        """
        stmt = (
            select(Lesson)
            .where(Lesson.created_by == user_id)
            .order_by(Lesson.order_index, Lesson.id)
            .offset(skip)
            .limit(limit)
        )
        if not include_deleted:
            stmt = stmt.where(Lesson.is_deleted == False)
        
        result = await self.session.exec(stmt)
        return result.all()

    # --- Update ---
    async def update_lesson(self, lesson_id: int, form: LessonUpdate) -> Lesson:
        """Update an existing lesson.

        Args:
            lesson_id: Lesson ID to update
            form: LessonUpdate schema with updated fields

        Returns:
            Updated Lesson object
            
        Raises:
            HTTPException: If lesson not found
        """
        lesson = await self.get_lesson_by_id(lesson_id)
        
        update_data = form.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(lesson, key, value)
        
        self.session.add(lesson)
        await self.session.commit()
        await self.session.refresh(lesson)
        return lesson

    # --- Delete ---
    async def delete_lesson(self, lesson_id: int) -> Lesson:
        """Soft-delete a lesson (marks is_deleted = True).

        Args:
            lesson_id: Lesson ID to delete

        Returns:
            Updated Lesson object with is_deleted=True
            
        Raises:
            HTTPException: If lesson not found or already deleted
        """
        lesson = await self.get_lesson_by_id(lesson_id, include_deleted=False)
        
        if lesson.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail=f"Lesson {lesson_id} is already deleted"
            )
        
        lesson.is_deleted = True
        self.session.add(lesson)
        await self.session.commit()
        await self.session.refresh(lesson)
        return lesson

    async def restore_lesson(self, lesson_id: int) -> Lesson:
        """Restore a soft-deleted lesson.

        Args:
            lesson_id: Lesson ID to restore

        Returns:
            Updated Lesson object with is_deleted=False
            
        Raises:
            HTTPException: If lesson not found or not deleted
        """
        stmt = select(Lesson).where(Lesson.id == lesson_id)
        result = await self.session.exec(stmt)
        lesson = result.first()
        
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson {lesson_id} not found"
            )
        
        if not lesson.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lesson {lesson_id} is not deleted"
            )
        
        lesson.is_deleted = False
        self.session.add(lesson)
        await self.session.commit()
        await self.session.refresh(lesson)
        return lesson

    # --- Helper ---
    async def _get_topic_by_id(self, topic_id: int) -> Optional[Topic]:
        """Internal helper to check if topic exists."""
        stmt = select(Topic).where(Topic.id == topic_id)
        result = await self.session.exec(stmt)
        return result.first()
