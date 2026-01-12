from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy import func, desc
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status

from models.lesson import Lesson, LessonSection, Topic, LessonStatus
from models.progress import ProgressStatus, UserProgress
from schemas.topic import TopicCreate, TopicUpdate


class TopicRepository:
    """Repository for Topic-related queries."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_topics_progress(
        self,
        *,
        user_id: int,
        include_deleted: bool = True,
        published_only: bool = False,
    ) -> List[Dict[str, Any]]:
        """Return topics with aggregated section counts for a user.

        Each item contains: id, name, description, total_sections, completed_sections, progress.
        Ordered by topic.order_index then id.
        """

        lesson_on = Lesson.topic_id == Topic.id
        if not include_deleted:
            lesson_on = lesson_on & (Lesson.is_deleted == False)
        if published_only:
            lesson_on = lesson_on & (Lesson.status == LessonStatus.PUBLISHED)

        section_on = LessonSection.lesson_id == Lesson.id
        if not include_deleted:
            section_on = section_on & (LessonSection.is_deleted == False)

        statement = (
            select(
                Topic.id.label("topic_id"),
                Topic.name.label("name"),
                Topic.description.label("description"),
                Topic.order_index.label("order_index"),
                func.count(func.distinct(LessonSection.id)).label("total_sections"),
                func.count(func.distinct(UserProgress.section_id)).label("completed_sections"),
            )
            .select_from(Topic)
            .join(Lesson, lesson_on, isouter=True)
            .join(LessonSection, section_on, isouter=True)
            .join(
                UserProgress,
                (UserProgress.section_id == LessonSection.id)
                & (UserProgress.user_id == user_id)
                & (UserProgress.status == ProgressStatus.COMPLETED),
                isouter=True,
            )
            .group_by(Topic.id, Topic.name, Topic.description, Topic.order_index)
            .order_by(Topic.order_index, Topic.id)
        )

        if not include_deleted:
            statement = statement.where(Topic.is_deleted == False)
        if published_only:
            statement = statement.where(Topic.status == LessonStatus.PUBLISHED)

        result = await self.session.exec(statement)
        rows = result.all()

        topics_raw: List[Dict[str, Any]] = []
        for row in rows:
            total_sections = int(row.total_sections or 0)
            completed_sections = int(row.completed_sections or 0)
            progress = int((completed_sections * 100) / total_sections) if total_sections > 0 else 0
            topics_raw.append(
                {
                    "id": int(row.topic_id),
                    "name": row.name,
                    "description": row.description,
                    "total_sections": total_sections,
                    "completed_sections": completed_sections,
                    "progress": max(0, min(100, progress)),
                }
            )

        return topics_raw

    async def create_topic(self, user_id: int, form: TopicCreate) -> Topic:
        """Create a new topic.
        
        Args:
            user_id: ID of the user creating the topic
            form: TopicCreate schema with topic details
            
        Returns:
            Created Topic object
        """
        # topic = Topic(
        #     name=form.name,
        #     description=form.description,
        #     order_index=form.order_index,
        #     created_by=user_id
        # )
        topic_data = form.dict(exclude_unset=True)
        topic = Topic(**topic_data, created_by=user_id)
        self.session.add(topic)
        await self.session.commit()
        await self.session.refresh(topic)
        return topic

    async def get_topic_by_id(
        self,
        topic_id: int,
        *,
        include_deleted: bool = True,
        published_only: bool = False,
    ) -> Topic:
        """Get topic by ID.
        
        Args:
            topic_id: Topic ID to retrieve
            
        Returns:
            Topic object
            
        Raises:
            HTTPException: If topic not found
        """
        stmt = select(Topic).where(Topic.id == topic_id)
        if not include_deleted:
            stmt = stmt.where(Topic.is_deleted == False)
        if published_only:
            stmt = stmt.where(Topic.status == LessonStatus.PUBLISHED)
        result = await self.session.exec(stmt)
        topic = result.first()
        
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Topic {topic_id} not found"
            )
        return topic

    async def list_all_topics(self, skip: int = 0, limit: int = 100) -> List[Topic]:
        """List all topics with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum records to return
            
        Returns:
            List of Topic objects
        """
        stmt = (
            select(Topic)
            .order_by(Topic.order_index, Topic.id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.exec(stmt)
        return result.all()

    async def get_topics_by_creator(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Topic]:
        """Get topics created by a specific user.
        
        Args:
            user_id: Creator user ID
            skip: Number of records to skip
            limit: Maximum records to return
            
        Returns:
            List of Topic objects
        """
        stmt = (
            select(Topic)
            .where(Topic.created_by == user_id)
            .order_by(Topic.order_index, Topic.id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.exec(stmt)
        return result.all()

    async def update_topic(self, topic_id: int, form: TopicUpdate) -> Topic:
        """Update an existing topic.
        
        Args:
            topic_id: Topic ID to update
            form: TopicUpdate schema with updated fields
            
        Returns:
            Updated Topic object
            
        Raises:
            HTTPException: If topic not found
        """
        topic = await self.get_topic_by_id(topic_id)
        
        update_data = form.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(topic, key, value)
        
        self.session.add(topic)
        await self.session.commit()
        await self.session.refresh(topic)
        return topic

    async def delete_topic(self, topic_id: int) -> Topic:
        """Delete a topic (set is_deleted = True).
        
        Args:
            topic_id: Topic ID to delete
            
        Raises:
            HTTPException: If topic not found
        """
        topic = await self.get_topic_by_id(topic_id)
        topic.is_deleted = True
        # setattr(topic, topic.is_deleted, True)
        self.session.add(topic)
        await self.session.commit()
        await self.session.refresh(topic)
        return topic

    async def get_topic_lesson_count(self, topic_id: int) -> int:
        """Get count of lessons in a topic.
        
        Args:
            topic_id: Topic ID
            
        Returns:
            Number of lessons
        """
        stmt = select(func.count(Lesson.id)).where(Lesson.topic_id == topic_id)
        result = await self.session.exec(stmt)
        count = result.first()
        return int(count or 0)

    async def search_topics(self, search_query: str, skip: int = 0, limit: int = 100) -> List[Topic]:
        """Search topics by name or description.
        
        Args:
            search_query: Text to search for
            skip: Number of records to skip
            limit: Maximum records to return
            
        Returns:
            List of matching Topic objects
        """
        query = f"%{search_query}%"
        stmt = (
            select(Topic)
            .where(
                (Topic.name.ilike(query)) | (Topic.description.ilike(query))
            )
            .order_by(Topic.order_index, Topic.id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.exec(stmt)
        return result.all()
