"""merge heads a486-d650

Revision ID: 533f84dac765
Revises: a48640d82c3f, d6d508180d96
Create Date: 2026-01-01 16:40:06.983125

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '533f84dac765'
down_revision: Union[str, Sequence[str], None] = ('a48640d82c3f', 'd6d508180d96')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
