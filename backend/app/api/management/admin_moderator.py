from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.lesson import Lesson
from schemas.topic import TopicCreate, TopicUpdate
from schemas.lesson import LessonListResponse
from repositories.topicRepository import TopicRepository
from repositories.lessonRepository import LessonRepository
from database.session import get_session
from core.security import get_current_user, required_roles

from models.user import RoleType, User

router = APIRouter(
    tags=["Admin & Moderator"],
    prefix="/admod",
    dependencies=[Depends(required_roles(RoleType.MODERATOR, RoleType.ADMIN))]
)


# ============ Endpoints related with topics ============
@router.get("/topics/creator/{user_id}")
async def get_topics_by_creator(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all topics created by a specific user.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        user_id: ID of the creator user
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        session: Database session
        
    Returns:
        List of Topic objects created by the user
    """
    topic_repo = TopicRepository(session)
    return await topic_repo.get_topics_by_creator(user_id, skip, limit)

@router.get("/topics")
async def get_all_topics(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all topics with pagination.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        session: Database session
        
    Returns:
        List of Topic objects
    """
    topic_repo = TopicRepository(session)
    return await topic_repo.list_all_topics(skip, limit)

@router.get("/topics/{topic_id}")
async def get_topic_by_id(
    topic_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Get a specific topic by ID.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        topic_id: Topic ID to retrieve
        session: Database session
        
    Returns:
        Topic object
        
    Raises:
        HTTPException: 404 if topic not found
    """
    topic_repo = TopicRepository(session)
    return await topic_repo.get_topic_by_id(topic_id)


# ============ Endpoints related with lessons ============

@router.get("/lessons")
async def get_all_lessons(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    include_deleted: bool = Query(False, description="Include soft-deleted lessons"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all lessons with pagination.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        include_deleted: Whether to include soft-deleted lessons (default: False)
        session: Database session
        
    Returns:
        List of Lesson objects
    """
    
    stmt = select(Lesson).order_by(Lesson.order_index, Lesson.id).offset(skip).limit(limit)
    if not include_deleted:
        stmt = stmt.where(Lesson.is_deleted == False)
    
    result = await session.exec(stmt)
    return result.all()

@router.get("/lessons/topic/{topic_id}")
async def get_lessons_by_topic(
    topic_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    include_deleted: bool = Query(False, description="Include soft-deleted lessons"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all lessons in a specific topic.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        topic_id: Topic ID to filter lessons
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        include_deleted: Whether to include soft-deleted lessons (default: False)
        session: Database session
        
    Returns:
        List of Lesson objects for the topic
    """
    lesson_repo = LessonRepository(session)
    return await lesson_repo.get_lessons_by_topic(topic_id, skip, limit, include_deleted)

@router.get("/lessons/creator/{user_id}")
async def get_lessons_by_creator(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    include_deleted: bool = Query(False, description="Include soft-deleted lessons"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all lessons created by a specific user.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        user_id: ID of the lesson creator
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        include_deleted: Whether to include soft-deleted lessons (default: False)
        session: Database session
        
    Returns:
        List of Lesson objects created by the user
    """
    lesson_repo = LessonRepository(session)
    return await lesson_repo.get_lessons_by_creator(user_id, skip, limit, include_deleted)

@router.get("/lessons/{lesson_id}")
async def get_lesson_by_id(
    lesson_id: int,
    include_deleted: bool = Query(False, description="Include if lesson is soft-deleted"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get a specific lesson by ID.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        lesson_id: Lesson ID to retrieve
        include_deleted: Whether to include if lesson is soft-deleted (default: False)
        session: Database session
        
    Returns:
        Lesson object
        
    Raises:
        HTTPException: 404 if lesson not found
    """
    lesson_repo = LessonRepository(session)
    return await lesson_repo.get_lesson_by_id(lesson_id, include_deleted)
