from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.lesson import Lesson, LessonSection, Question
from models.user import RoleType, User

from schemas.question import QuestionResponse, QuestionUpdate
from schemas.lessson_section import LessonSectionListResponse

from repositories.postRepository import PostRepository
from repositories.questionRepository import QuestionRepository
from repositories.topicRepository import TopicRepository
from repositories.lessonRepository import LessonRepository
from repositories.lessonSectionRepository import LessonSectionRepository
from database.session import get_session
from core.security import get_current_user, required_roles


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

# ============ Endpoints related with lesson sections ============

@router.get("/lesson-sections")
async def get_all_sections(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    include_deleted: bool = Query(False, description="Include soft-deleted sections"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all lesson sections with pagination.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        include_deleted: Whether to include soft-deleted sections (default: False)
        session: Database session
        
    Returns:
        List of LessonSection objects
    """
    stmt = select(LessonSection).order_by(LessonSection.order_index, LessonSection.id).offset(skip).limit(limit)
    if not include_deleted:
        stmt = stmt.where(LessonSection.is_deleted == False)
    
    result = await session.exec(stmt)
    return result.all()

@router.get("/lesson-sections/lesson/{lesson_id}")
async def get_sections_by_lesson(
    lesson_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    include_deleted: bool = Query(False, description="Include soft-deleted sections"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all sections in a specific lesson.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        lesson_id: Lesson ID to filter sections
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        include_deleted: Whether to include soft-deleted sections (default: False)
        session: Database session
        
    Returns:
        List of LessonSection objects for the lesson
    """
    section_repo = LessonSectionRepository(session)
    return await section_repo.get_sections_by_lesson(lesson_id, skip, limit, include_deleted)

@router.get("/lesson-sections/creator/{user_id}")
async def get_sections_by_creator(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    include_deleted: bool = Query(False, description="Include soft-deleted sections"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all sections created by a specific user.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        user_id: ID of the section creator
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        include_deleted: Whether to include soft-deleted sections (default: False)
        session: Database session
        
    Returns:
        List of LessonSection objects created by the user
    """
    section_repo = LessonSectionRepository(session)
    return await section_repo.get_sections_by_creator(user_id, skip, limit, include_deleted)

@router.get("/lesson-sections/{section_id}")
async def get_section_by_id(
    section_id: int,
    include_deleted: bool = Query(False, description="Include if section is soft-deleted"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get a specific lesson section by ID.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        section_id: Lesson section ID to retrieve
        include_deleted: Whether to include if section is soft-deleted (default: False)
        session: Database session
        
    Returns:
        LessonSection object
        
    Raises:
        HTTPException: 404 if section not found
    """
    section_repo = LessonSectionRepository(session)
    return await section_repo.get_section_by_id(section_id, include_deleted)


# ============ Endpoints related with questions ============
@router.get("/questions/{question_id:int}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Retrieve a single question by ID.

    **Role:** MODERATOR

    Args:
        question_id: Question ID to retrieve
        session: Database session

    Returns:
        Question object

    Raises:
        HTTPException: 404 if question not found
    """
    question_repo = QuestionRepository(session)
    question = await question_repo.get_question_by_id(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question {question_id} not found",
        )
    return question


@router.get("/lesson-sections/{section_id:int}/questions")
async def get_questions_by_section(
    section_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Retrieve all questions in a lesson section.

    **Roles:** ADMIN, MODERATOR

    Args:
        section_id: Lesson section ID
        session: Database session

    Returns:
        List of Question objects, ordered by order_index and id
    """
    question_repo = QuestionRepository(session)
    questions = await question_repo.get_questions_by_section(section_id)
    return questions


@router.delete("/questions/{question_id:int}")
async def delete_question(
    question_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Delete a question (soft delete).

    **Roles:** ADMIN, MODERATOR

    Args:
        question_id: Question ID to delete
        session: Database session
        user: Currently authenticated user

    Returns:
        Success message

    Raises:
        HTTPException: 404 if question not found
    """
    question_repo = QuestionRepository(session)
    await question_repo.delete_question(question_id)
    return {"message": f"Question {question_id} deleted successfully"}

@router.post("/questions/{question_id:int}/restore", response_model=QuestionResponse)
async def restore_question(
    question_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Restore a soft-deleted question.

    **Roles:** ADMIN, MODERATOR

    Args:
        question_id: Question ID to restore
        session: Database session
        user: Currently authenticated user

    Returns:
        Restored Question object

    Raises:
        HTTPException: 404 if question not found
    """
    question_repo = QuestionRepository(session)
    question = await question_repo.restore_question(question_id)
    return question

@router.get("/questions")
async def get_all_questions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    include_deleted: bool = Query(False, description="Include soft-deleted questions"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all questions with pagination.

    **Roles:** ADMIN, MODERATOR

    Args:
        skip: Pagination offset (default: 0)
        limit: Pagination limit (default: 100, max: 1000)
        include_deleted: Whether to include soft-deleted questions (default: False)
        session: Database session

    Returns:
        List of Question objects
    """
    stmt = select(Question).order_by(Question.order_index, Question.id).offset(skip).limit(limit)
    if not include_deleted:
        stmt = stmt.where(Question.is_deleted == False)
    
    result = await session.exec(stmt)
    return result.all()


# ============ Endpoints related with community ============
@router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment_by_moderator(
    post_id: int,
    comment_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Delete a comment by moderator or admin.
    
    Only users with MODERATOR or ADMIN roles can delete comments.
    
    Args:
        post_id: ID of the post containing the comment
        comment_id: ID of the comment to delete
    
    Returns:
        Success message
    """
    repo = PostRepository(session)
    
    try:
        # Get the comment
        comment = await repo.get_comment_by_id(comment_id)
        if not comment or comment.post_id != post_id:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        if comment.is_deleted:
            raise HTTPException(status_code=400, detail="Comment already deleted")
        
        # Soft delete the comment
        await repo.soft_delete_comment(post_id=post_id, comment=comment)
        await session.commit()
        
        return {"message": "Comment deleted successfully"}
        
    except ValueError as exc:
        await session.rollback()
        if str(exc) == "Post not found":
            raise HTTPException(status_code=404, detail="Post not found") from exc
        raise
    except HTTPException:
        await session.rollback()
        raise
    except Exception:
        await session.rollback()
        raise
