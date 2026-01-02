"""fix name tables

Revision ID: a76e06a331b8
Revises: b5fe53b43d05
Create Date: 2025-12-30 00:04:51.446534

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a76e06a331b8'
down_revision: Union[str, Sequence[str], None] = 'b5fe53b43d05'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    # NOTE:
    # The initial migration (2ec8359b8022) already creates `roles`, `users`, and `user_roles`.
    # This revision existed as a placeholder/fix-name migration but re-creating the tables
    # would fail with: relation "roles" already exists.
    pass


def downgrade() -> None:
    """Downgrade schema."""
    # No-op: this revision does not apply schema changes.
    pass
