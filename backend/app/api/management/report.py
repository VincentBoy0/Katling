"""
Admin/Moderator endpoints for managing reports/issues.
Admins and moderators can view, update status, and resolve reports.

ROLE PERMISSIONS:
- ADMIN: Full access to all endpoints
  * View all reports
  * Update report status, severity, category
  * Resolve and close reports
  * View statistics
  * Delete/archive reports (if implemented)

- MODERATOR: Moderate access
  * View all reports
  * Update report status to IN_PROGRESS
  * Resolve reports (mark as RESOLVED)
  * Close reports with resolution notes
  * View statistics
  * Cannot delete or change severity/category (admin-only)

- LEARNER: No access (use /reports endpoints instead)
"""
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import APIRouter, Depends, HTTPException
from core.security import get_current_user, required_roles
from database.session import get_session
from repositories.reportRepository import ReportRepository
from schemas.report import ReportUpdate, ReportResponse, ReportListResponse
from models.user import RoleType, User
from models.report import ReportStatus

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/management/reports",
    tags=["Reports Management (Admin/Moderator)"],
    dependencies=[Depends(required_roles(RoleType.ADMIN, RoleType.MODERATOR))]
)


@router.get("", response_model=list[ReportListResponse])
async def list_reports(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    severity: str = None,
    category: str = None,
    session: AsyncSession = Depends(get_session),
    # current_user: User = Depends(get_current_user),
):
    """
    Get all reports for moderation/management.
    
    **Roles:** ADMIN, MODERATOR
    
    Can filter by status, severity, and category.
    
    Args:
        skip: Number of reports to skip
        limit: Maximum number of reports to return
        status: Filter by status (optional)
        severity: Filter by severity (optional)
        category: Filter by category (optional)
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        List of reports
        current_user: Currently authenticated user
        
    Returns:
        List of reports
    """
    try:
        repo = ReportRepository(session)
        reports = await repo.get_all_reports(
            skip=skip,
            limit=limit,
            status=status,
            severity=severity,
            category=category,
        )
        return reports
    except Exception as e:
        logger.exception("Failed to list reports: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve reports")


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report_details(
    report_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Get detailed information about a specific report.
    
    **Roles:** ADMIN, MODERATOR
    
    Args:
        report_id: ID of the report
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        Report details
    """
    repo = ReportRepository(session)
    try:
        report = await repo.get_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get report: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve report")


@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    update_data: ReportUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Update a report's status, severity, or resolution notes.
    
    Admin and moderator only. Updates are logged with the moderator's ID.
    
    Args:
        report_id: ID of the report
        update_data: Fields to update
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        Updated report
    """
    try:
        repo = ReportRepository(session)
        report = await repo.update_report(
            report_id,
            update_data,
            resolved_by_user_id=current_user.id,
        )
        logger.info(f"Report {report_id} updated by user {current_user.id}")
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to update report: %s", e)
        raise HTTPException(status_code=500, detail="Failed to update report")


@router.patch("/{report_id}/resolve")
async def resolve_report(
    report_id: int,
    resolution_notes: str = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a report as resolved with optional resolution notes.
    
    Admin and moderator only. Automatically sets status to RESOLVED.
    
    Args:
        report_id: ID of the report
        resolution_notes: Notes about how the issue was resolved
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        Resolved report
    """
    try:
        repo = ReportRepository(session)
        update_data = ReportUpdate(
            status=ReportStatus.RESOLVED,
            resolution_notes=resolution_notes,
        )
        report = await repo.update_report(
            report_id,
            update_data,
            resolved_by_user_id=current_user.id,
        )
        logger.info(f"Report {report_id} marked as resolved by user {current_user.id}")
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to resolve report: %s", e)
        raise HTTPException(status_code=500, detail="Failed to resolve report")


@router.patch("/{report_id}/close")
async def close_report(
    report_id: int,
    resolution_notes: str = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a report as closed (resolved or won't fix).
    
    Admin and moderator only.
    
    Args:
        report_id: ID of the report
        resolution_notes: Notes about why the report was closed
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        Closed report
    """
    try:
        repo = ReportRepository(session)
        update_data = ReportUpdate(
            status=ReportStatus.CLOSED,
            resolution_notes=resolution_notes,
        )
        report = await repo.update_report(
            report_id,
            update_data,
            resolved_by_user_id=current_user.id,
        )
        logger.info(f"Report {report_id} closed by user {current_user.id}")
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to close report: %s", e)
        raise HTTPException(status_code=500, detail="Failed to close report")


@router.get("/stats/summary")
async def get_reports_summary(
    session: AsyncSession = Depends(get_session),
):
    """
    Get a summary of all reports grouped by status.
    
    Admin and moderator only.
    
    Args:
        session: Database session
        current_user: Currently authenticated user
        
    Returns:
        Summary statistics
    """
    try:
        repo = ReportRepository(session)
        stats = await repo.get_reports_by_status()
        total = sum(stats.values())
        pending = stats.get("PENDING", 0)
        in_progress = stats.get("IN_PROGRESS", 0)
        
        return {
            "total_reports": total,
            "by_status": stats,
            "pending_count": pending,
            "in_progress_count": in_progress,
        }
    except Exception as e:
        logger.exception("Failed to get report statistics: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get report statistics")
