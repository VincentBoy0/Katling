from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.lesson import LessonSection, Question


class QuestionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_question_by_id(self, question_id: int) -> Question | None:
        statement = select(Question).where(Question.id == question_id)
        result = await self.session.exec(statement)
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
