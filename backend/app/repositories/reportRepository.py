"""
Repository for Report/Issue database operations.
"""

from fastapi import HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from models.report import Report, ReportCategory, ReportSeverity, ReportStatus
from schemas.report import ReportCreate, ReportUpdate
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ReportRepository:
    """Repository for Report database operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    # --- Create ---
    async def create_report(self, user_id: int, report_data: ReportCreate) -> Report:
        """Create a new report.
        
        Args:
            user_id: ID of the user filing the report
            report_data: ReportCreate schema with report details
            
        Returns:
            Created Report instance
            
        Raises:
            HTTPException: If creation fails
        """
        try:
            report = Report(
                user_id=user_id,
                **report_data.dict()
            )
            self.session.add(report)
            await self.session.commit()
            await self.session.refresh(report)
            logger.info(f"Report {report.id} created by user {user_id}")
            return report
        except Exception as e:
            logger.exception("Failed to create report: %s", e)
            raise HTTPException(status_code=500, detail="Failed to create report")
    
    # --- Read ---
    async def get_report_by_id(self, report_id: int) -> Report:
        """Get report by ID.
        
        Args:
            report_id: Report ID
            
        Returns:
            Report instance or None if not found
        """
        stmt = select(Report).where(Report.id == report_id)
        result = await self.session.exec(stmt)
        report = result.first()
        return report 
    
    async def get_user_reports(self, user_id: int, skip: int = 0, limit: int = 50) -> list[Report]:
        """Get all reports filed by a user.
        
        Args:
            user_id: ID of the user
            skip: Number of reports to skip
            limit: Maximum number of reports to return
            
        Returns:
            List of Report instances
        """
        stmt = select(Report).where(Report.user_id == user_id).offset(skip).limit(limit)
        result = await self.session.exec(stmt)
        return result.all()
    
    async def get_all_reports(
        self,
        skip: int = 0,
        limit: int = 50,
        status: ReportStatus = None,
        severity: ReportSeverity = None,
        category: ReportCategory = None,
    ) -> list[Report]:
        """Get all reports for moderation, with optional filtering.
        
        Args:
            skip: Number of reports to skip
            limit: Maximum number of reports to return
            status: Filter by status (optional)
            severity: Filter by severity (optional)
            category: Filter by category (optional)
            
        Returns:
            List of Report instances
        """
        stmt = select(Report)
        
        if status:
            stmt = stmt.where(Report.status == status)
        if severity:
            stmt = stmt.where(Report.severity == severity)
        if category:
            stmt = stmt.where(Report.category == category)
        
        stmt = stmt.order_by(Report.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.exec(stmt)
        return result.all()
    
    async def get_report_count(
        self,
        status: ReportStatus = None,
    ) -> int:
        """Get count of reports, optionally filtered by status.
        
        Args:
            status: Filter by status (optional)
            
        Returns:
            Number of reports
        """
        stmt = select(Report)
        if status:
            stmt = stmt.where(Report.status == status)
        
        result = await self.session.exec(stmt)
        return len(result.all())
    
    # --- Update ---
    async def update_report(
        self,
        report_id: int,
        update_data: ReportUpdate,
        resolved_by_user_id: int = None,
    ) -> Report:
        """Update a report.
        
        Args:
            report_id: ID of the report to update
            update_data: ReportUpdate schema with fields to update
            resolved_by_user_id: ID of admin/moderator resolving the report
            
        Returns:
            Updated Report instance
            
        Raises:
            HTTPException: If report not found or update fails
        """
        try:
            report = await self.get_report_by_id(report_id)
            if not report:
                raise HTTPException(status_code=404, detail="Report not found")
            
            update_dict = update_data.dict(exclude_unset=True)
            
            # If status is being updated to a resolved state, set timestamps
            if "status" in update_dict:
                new_status = update_dict["status"]
                if new_status in [ReportStatus.RESOLVED, ReportStatus.CLOSED, ReportStatus.WONT_FIX]:
                    if resolved_by_user_id:
                        report.resolved_by = resolved_by_user_id
                    from datetime import datetime, timezone
                    report.resolved_at = datetime.now(timezone.utc)
            
            for field, value in update_dict.items():
                if value is not None:
                    setattr(report, field, value)
            
            self.session.add(report)
            await self.session.commit()
            await self.session.refresh(report)
            logger.info(f"Report {report_id} updated")
            return report
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Failed to update report: %s", e)
            raise HTTPException(status_code=500, detail="Failed to update report")
    
    # --- Statistics ---
    async def get_reports_by_status(self) -> dict:
        """Get count of reports grouped by status.
        
        Returns:
            Dictionary with status counts
        """
        try:
            reports = await self.get_all_reports(skip=0, limit=10000)
            counts = {}
            for status in ReportStatus:
                counts[status.value] = sum(1 for r in reports if r.status == status)
            return counts
        except Exception as e:
            logger.exception("Failed to get report statistics: %s", e)
            raise HTTPException(status_code=500, detail="Failed to get report statistics")
