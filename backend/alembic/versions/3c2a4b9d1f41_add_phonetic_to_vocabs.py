"""add phonetic to vocabs

Revision ID: 3c2a4b9d1f41
Revises: 10af35c1a5ac
Create Date: 2026-01-01 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3c2a4b9d1f41"
down_revision: Union[str, Sequence[str], None] = "10af35c1a5ac"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("vocabs", sa.Column("phonetic", sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("vocabs", "phonetic")
