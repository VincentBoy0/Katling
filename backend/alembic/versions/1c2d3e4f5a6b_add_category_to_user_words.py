"""add category to user_words

Revision ID: 1c2d3e4f5a6b
Revises: 10af35c1a5ac
Create Date: 2025-12-31

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1c2d3e4f5a6b"
down_revision: Union[str, Sequence[str], None] = "10af35c1a5ac"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_words",
        sa.Column("category", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("user_words", "category")
