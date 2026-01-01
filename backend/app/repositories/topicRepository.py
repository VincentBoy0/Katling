from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.lesson import Lesson, LessonSection, Topic
from models.progress import ProgressStatus, UserProgress


class TopicRepository:
    """Repository for Topic-related queries."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_topics_progress(self, *, user_id: int) -> List[Dict[str, Any]]:
        """Return topics with aggregated section counts for a user.

        Each item contains: id, name, description, total_sections, completed_sections, progress.
        Ordered by topic.order_index then id.
        """

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
            .join(Lesson, Lesson.topic_id == Topic.id, isouter=True)
            .join(LessonSection, LessonSection.lesson_id == Lesson.id, isouter=True)
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
