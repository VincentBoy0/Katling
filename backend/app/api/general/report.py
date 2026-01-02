"""
User-facing endpoints for reporting issues/errors.
Users can create reports and view their own reports.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from database.session import get_session
from core.security import get_current_user
from repositories.reportRepository import ReportRepository
from schemas.report import ReportCreate, ReportResponse, ReportListResponse
from models.user import User

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new error/issue report.
    
    Users can report bugs, feature requests, content errors, etc.
    
    Args:
        report_data: Report details
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        Created report details
    """
    try:
        repo = ReportRepository(session)
        report = await repo.create_report(current_user.id, report_data)
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to create report: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create report")


@router.get("", response_model=list[ReportListResponse])
async def get_my_reports(
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get all reports filed by the current user.
    
    Args:
        skip: Number of reports to skip
        limit: Maximum number of reports to return
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        List of user's reports
    """
    try:
        repo = ReportRepository(session)
        reports = await repo.get_user_reports(current_user.id, skip=skip, limit=limit)
        return reports
    except Exception as e:
        logger.exception("Failed to get user reports: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve reports")


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific report by ID.
    
    Users can only view their own reports (except admins/moderators).
    
    Args:
        report_id: ID of the report
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        Report details
    """
    try:
        repo = ReportRepository(session)
        report = await repo.get_report_by_id(report_id)
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Users can only view their own reports
        if report.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own reports"
            )
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get report: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve report")


@router.get("/{report_id}/status")
async def get_report_status(
    report_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get the status of a report.
    
    Quick endpoint to check the current status of a report.
    
    Args:
        report_id: ID of the report
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        Report status information
    """
    try:
        repo = ReportRepository(session)
        report = await repo.get_report_by_id(report_id)
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        if report.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own reports"
            )
        
        return {
            "report_id": report.id,
            "status": report.status,
            "severity": report.severity,
            "created_at": report.created_at,
            "resolved_at": report.resolved_at,
            "resolution_notes": report.resolution_notes,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get report status: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve report status")
