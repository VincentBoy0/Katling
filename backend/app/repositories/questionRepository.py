from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status

from schemas.question import QuestionCreate, QuestionUpdate
from models.lesson import LessonSection, Question


class QuestionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_question_by_id(self, question_id: int) -> Question | None:
        statement = select(Question).where(Question.id == question_id)
        result = await self.session.exec(statement)
        if not result:
            return None
        return result.first()

    async def section_exists(self, section_id: int) -> bool:
        statement = select(LessonSection.id).where(LessonSection.id == section_id)
        result = await self.session.exec(statement)
        return result.first() is not None

    async def get_questions_by_section(self, section_id: int) -> list[Question]:
        statement = (
            select(Question)
            .where(Question.section_id == section_id)
            .order_by(Question.order_index, Question.id)
        )
        result = await self.session.exec(statement)
        return result.all()

    async def create_question(self, user_id: int, form: QuestionCreate) -> Question:
        # validate section exists
        if not await self.section_exists(form.section_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Section {form.section_id} not found",
            )

        question_data = form.dict(exclude_unset=True)
        question = Question(**question_data, created_by=user_id)
        self.session.add(question)
        await self.session.commit()
        await self.session.refresh(question)
        return question
    
    async def update_question(self, question_id: int, form: QuestionUpdate) -> Question:
        question = await self.get_question_by_id(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question {question_id} not found",
            )

        question_data = form.dict(exclude_unset=True)

        # Apply updates (skip immutable fields)
        for field, value in question_data.items():
            if field in {"id", "created_by", "created_at"}:
                continue
            setattr(question, field, value)

        self.session.add(question)
        await self.session.commit()
        await self.session.refresh(question)
        return question

    async def delete_question(self, question_id: int) -> None:
        """Soft delete a question by setting is_deleted = True.
        
        Raises HTTP 404 if question not found.
        """
        question = await self.get_question_by_id(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question {question_id} not found",
            )
        
        question.is_deleted = True
        self.session.add(question)
        await self.session.commit()

    async def restore_question(self, question_id: int) -> Question:
        """Restore a soft-deleted question by setting is_deleted = False.
        
        Raises HTTP 404 if question not found.
        """
        statement = select(Question).where(Question.id == question_id)
        result = await self.session.exec(statement)
        question = result.first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question {question_id} not found",
            )
        
        question.is_deleted = False
        self.session.add(question)
        await self.session.commit()
        await self.session.refresh(question)
        return question