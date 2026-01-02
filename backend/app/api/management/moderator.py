from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession

from schemas.lessson_section import LessonSectionCreate, LessonSectionResponse, LessonSectionUpdate
from schemas.topic import TopicCreate, TopicUpdate
from schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from repositories.topicRepository import TopicRepository
from repositories.lessonRepository import LessonRepository
from repositories.lessonSectionRepository import LessonSectionRepository
from database.session import get_session
from core.security import get_current_user, required_roles

from models.user import RoleType, User

router = APIRouter(
    tags=["Moderator"],
    prefix="/moderator",
    dependencies=[Depends(required_roles(RoleType.MODERATOR))]
)


# ============ Topic Management ============

@router.post("/topics", response_model=dict, status_code=status.HTTP_201_CREATED)
async def add_topic(
    form: TopicCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    Create a new topic.
    
    **Role:** MODERATOR
    
    Args:
        form: TopicCreate schema
        session: Database session
        user: Currently authenticated user
        
    Returns:
        Created Topic object
    """
    topic_repo = TopicRepository(session)
    topic = await topic_repo.create_topic(user.id, form)
    return topic

@router.patch("/topics/{topic_id:int}", response_model=dict)
async def update_topic(
    topic_id: int,
    form: TopicUpdate,
    session: AsyncSession = Depends(get_session),
):
    """
    Update an existing topic.
    
    **Role:** MODERATOR
    
    Args:
        topic_id: Topic ID to update
        form: TopicUpdate schema with updated fields
        session: Database session
        user: Currently authenticated user
        
    Returns:
        Updated Topic object
        
    Raises:
        HTTPException: 404 if topic not found
    """
    topic_repo = TopicRepository(session)
    topic = await topic_repo.update_topic(topic_id, form)
    return topic
    
@router.delete("/topics/{topic_id:int}")
async def delete_topic(
    topic_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    Delete a topic (soft delete).
    
    **Role:** MODERATOR
    
    Args:
        topic_id: Topic ID to delete
        session: Database session
        user: Currently authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if topic not found
    """
    topic_repo = TopicRepository(session)
    await topic_repo.delete_topic(topic_id)
    return {"message": f"Topic {topic_id} deleted successfully"}


# ============ Lesson Management ============

@router.post("/lessons", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    form: LessonCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    Create a new lesson.
    
    **Role:** MODERATOR
    
    Args:
        form: LessonCreate schema with lesson details
        session: Database session
        user: Currently authenticated user (lesson creator)
        
    Returns:
        Created Lesson object
        
    Raises:
        HTTPException: 404 if topic not found
    """
    lesson_repo = LessonRepository(session)
    lesson = await lesson_repo.create_lesson(user.id, form)
    return lesson

@router.patch("/lessons/{lesson_id:int}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: int,
    form: LessonUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    Update an existing lesson.
    
    **Role:** MODERATOR
    
    Args:
        lesson_id: Lesson ID to update
        form: LessonUpdate schema with updated fields
        session: Database session
        user: Currently authenticated user
        
    Returns:
        Updated Lesson object
        
    Raises:
        HTTPException: 404 if lesson not found
    """
    lesson_repo = LessonRepository(session)
    lesson = await lesson_repo.update_lesson(lesson_id, form)
    return lesson

@router.delete("/lessons/{lesson_id:int}")
async def delete_lesson(
    lesson_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    Delete a lesson (soft delete).
    
    **Role:** MODERATOR
    
    Args:
        lesson_id: Lesson ID to delete
        session: Database session
        user: Currently authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if lesson not found or 410 if already deleted
    """
    lesson_repo = LessonRepository(session)
    await lesson_repo.delete_lesson(lesson_id)
    return {"message": f"Lesson {lesson_id} deleted successfully"}


# ============ Lesson Section Management ============

@router.post("/lesson-sections", response_model=LessonSectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    form: LessonSectionCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    Create a new lesson section.
    
    **Role:** MODERATOR
    
    Args:
        form: LessonSectionCreate schema with section details
        session: Database session
        user: Currently authenticated user (section creator)
        
    Returns:
        Created LessonSection object
        
    Raises:
        HTTPException: 404 if lesson not found
    """
    lesson_section_repo = LessonSectionRepository(session)
    section = await lesson_section_repo.create_section(user.id, form)
    return section

@router.patch("/lesson-sections/{section_id:int}", response_model=LessonSectionResponse)
async def update_section(
    section_id: int,
    form: LessonSectionUpdate,
    session: AsyncSession = Depends(get_session),
):
    """
    Update an existing lesson section.
    
    **Role:** MODERATOR
    
    Args:
        section_id: Lesson section ID to update
        form: LessonSectionUpdate schema with updated fields
        session: Database session
        user: Currently authenticated user
        
    Returns:
        Updated LessonSection object
        
    Raises:
        HTTPException: 404 if section not found
    """
    lesson_section_repo = LessonSectionRepository(session)
    section = await lesson_section_repo.update_section(section_id, form)
    return section

@router.delete("/lesson-sections/{section_id:int}")
async def delete_section(
    section_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Delete a lesson section (soft delete).
    
    **Role:** MODERATOR
    
    Args:
        section_id: Lesson section ID to delete
        session: Database session
        user: Currently authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if section not found or 410 if already deleted
    """
    lesson_section_repo = LessonSectionRepository(session)
    await lesson_section_repo.delete_section(section_id)
    return {"message": f"Lesson section {section_id} deleted successfully"}

