"""add status to topics and questions

Revision ID: f2g3h4i5j6k7
Revises: e1f2a3b4c5d6
Create Date: 2026-01-10 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f2g3h4i5j6k7'
down_revision: Union[str, Sequence[str], None] = 'e1f2a3b4c5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add status column to topics and questions tables."""
    # Add status to topics table
    op.add_column('topics', sa.Column('status', sa.Enum('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'REJECTED', name='lesson_status_enum'), nullable=False, server_default='DRAFT'))
    
    # Add status to questions table
    op.add_column('questions', sa.Column('status', sa.Enum('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'REJECTED', name='lesson_status_enum'), nullable=False, server_default='DRAFT'))


def downgrade() -> None:
    """Remove status column from topics and questions tables."""
    op.drop_column('questions', 'status')
    op.drop_column('topics', 'status')
