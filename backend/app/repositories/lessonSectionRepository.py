from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status
from typing import List, Optional

from models.lesson import LessonSection, Lesson
from schemas.lessson_section import LessonSectionCreate, LessonSectionUpdate


class LessonSectionRepository:
    """Repository for LessonSection database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    # --- Create ---
    async def create_section(self, user_id: int, form: LessonSectionCreate) -> LessonSection:
        """Create a new lesson section.
        
        Args:
            user_id: ID of the user creating the section
            form: LessonSectionCreate schema with section details
            
        Returns:
            Created LessonSection object
            
        Raises:
            HTTPException: If lesson not found
        """
        # Verify lesson exists
        lesson = await self._get_lesson_by_id(form.lesson_id)
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson {form.lesson_id} not found"
            )
        
        section_data = form.dict(exclude_unset=True)
        section = LessonSection(**section_data, created_by=user_id)
        self.session.add(section)
        await self.session.commit()
        await self.session.refresh(section)
        return section

    # --- Read ---
    async def get_section_by_id(self, section_id: int, include_deleted: bool = False) -> LessonSection:
        """Get lesson section by ID.

        Args:
            section_id: Section ID
            include_deleted: Whether to include soft-deleted sections

        Returns:
            LessonSection instance
            
        Raises:
            HTTPException: If section not found
        """
        stmt = select(LessonSection).where(LessonSection.id == section_id)
        if not include_deleted:
            stmt = stmt.where(LessonSection.is_deleted == False)
        
        result = await self.session.exec(stmt)
        section = result.first()
        
        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson section {section_id} not found"
            )
        return section

    async def get_sections_by_lesson(
        self, 
        lesson_id: int, 
        skip: int = 0, 
        limit: int = 100,
        include_deleted: bool = False
    ) -> List[LessonSection]:
        """Get all sections in a lesson.

        Args:
            lesson_id: Lesson ID
            skip: Number of records to skip
            limit: Maximum records to return
            include_deleted: Whether to include soft-deleted sections

        Returns:
            List of LessonSection objects
        """
        stmt = (
            select(LessonSection)
            .where(LessonSection.lesson_id == lesson_id)
            .order_by(LessonSection.order_index, LessonSection.id)
            .offset(skip)
            .limit(limit)
        )
        if not include_deleted:
            stmt = stmt.where(LessonSection.is_deleted == False)
        
        result = await self.session.exec(stmt)
        return result.all()

    async def get_sections_by_creator(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        include_deleted: bool = False
    ) -> List[LessonSection]:
        """Get all sections created by a user.

        Args:
            user_id: Creator user ID
            skip: Number of records to skip
            limit: Maximum records to return
            include_deleted: Whether to include soft-deleted sections

        Returns:
            List of LessonSection objects
        """
        stmt = (
            select(LessonSection)
            .where(LessonSection.created_by == user_id)
            .order_by(LessonSection.order_index, LessonSection.id)
            .offset(skip)
            .limit(limit)
        )
        if not include_deleted:
            stmt = stmt.where(LessonSection.is_deleted == False)
        
        result = await self.session.exec(stmt)
        return result.all()

    # --- Update ---
    async def update_section(self, section_id: int, form: LessonSectionUpdate) -> LessonSection:
        """Update an existing lesson section.

        Args:
            section_id: Section ID to update
            form: LessonSectionUpdate schema with updated fields

        Returns:
            Updated LessonSection object
            
        Raises:
            HTTPException: If section not found
        """
        section = await self.get_section_by_id(section_id)
        
        update_data = form.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(section, key, value)
        
        self.session.add(section)
        await self.session.commit()
        await self.session.refresh(section)
        return section

    # --- Delete ---
    async def delete_section(self, section_id: int) -> LessonSection:
        """Soft-delete a lesson section (marks is_deleted = True).

        Args:
            section_id: Section ID to delete

        Returns:
            Updated LessonSection object with is_deleted=True
            
        Raises:
            HTTPException: If section not found or already deleted
        """
        section = await self.get_section_by_id(section_id, include_deleted=False)
        
        if section.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail=f"Lesson section {section_id} is already deleted"
            )
        
        section.is_deleted = True
        self.session.add(section)
        await self.session.commit()
        await self.session.refresh(section)
        return section

    async def restore_section(self, section_id: int) -> LessonSection:
        """Restore a soft-deleted lesson section.

        Args:
            section_id: Section ID to restore

        Returns:
            Updated LessonSection object with is_deleted=False
            
        Raises:
            HTTPException: If section not found or not deleted
        """
        stmt = select(LessonSection).where(LessonSection.id == section_id)
        result = await self.session.exec(stmt)
        section = result.first()
        
        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson section {section_id} not found"
            )
        
        if not section.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lesson section {section_id} is not deleted"
            )
        
        section.is_deleted = False
        self.session.add(section)
        await self.session.commit()
        await self.session.refresh(section)
        return section

    async def get_section_count_by_lesson(self, lesson_id: int, include_deleted: bool = False) -> int:
        """Get count of sections in a lesson.

        Args:
            lesson_id: Lesson ID
            include_deleted: Whether to include soft-deleted sections

        Returns:
            Number of sections
        """
        from sqlalchemy import func
        
        stmt = select(func.count(LessonSection.id)).where(LessonSection.lesson_id == lesson_id)
        if not include_deleted:
            stmt = stmt.where(LessonSection.is_deleted == False)
        
        result = await self.session.exec(stmt)
        count = result.first()
        return int(count or 0)

    # --- Helper ---
    async def _get_lesson_by_id(self, lesson_id: int) -> Optional[Lesson]:
        """Internal helper to check if lesson exists."""
        stmt = select(Lesson).where(Lesson.id == lesson_id)
        result = await self.session.exec(stmt)
        return result.first()
