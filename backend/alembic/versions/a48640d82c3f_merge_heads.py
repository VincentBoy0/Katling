"""merge heads

Revision ID: a48640d82c3f
Revises: dbb0fc239768, 1c2d3e4f5a6b
Create Date: 2026-01-01 14:05:17.421545

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a48640d82c3f'
down_revision: Union[str, Sequence[str], None] = ('dbb0fc239768', '1c2d3e4f5a6b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
