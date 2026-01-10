"""add affected_post_id to reports

Revision ID: e1f2a3b4c5d6
Revises: c2f1a7b8d9e0
Create Date: 2026-01-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, Sequence[str], None] = 'c2f1a7b8d9e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add affected_post_id column to reports table."""
    op.add_column('reports', sa.Column('affected_post_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_reports_affected_post_id_posts',
        'reports',
        'posts',
        ['affected_post_id'],
        ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    """Remove affected_post_id column from reports table."""
    op.drop_constraint('fk_reports_affected_post_id_posts', 'reports', type_='foreignkey')
    op.drop_column('reports', 'affected_post_id')
