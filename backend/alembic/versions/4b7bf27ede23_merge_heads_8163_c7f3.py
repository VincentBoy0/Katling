"""merge heads 8163-c7f3

Revision ID: 4b7bf27ede23
Revises: 81633b7bea3d, c7f3a1d2e9b0
Create Date: 2026-01-02 16:40:27.786978

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b7bf27ede23'
down_revision: Union[str, Sequence[str], None] = ('81633b7bea3d', 'c7f3a1d2e9b0')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
