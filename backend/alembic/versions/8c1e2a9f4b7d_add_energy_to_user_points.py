"""add energy system to user_points

Revision ID: 8c1e2a9f4b7d
Revises: 533f84dac765
Create Date: 2026-01-02 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8c1e2a9f4b7d"
down_revision: Union[str, Sequence[str], None] = "533f84dac765"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "user_points",
        sa.Column("energy", sa.Integer(), server_default=sa.text("30"), nullable=False),
    )
    op.add_column(
        "user_points",
        sa.Column(
            "last_energy_update",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("user_points", "last_energy_update")
    op.drop_column("user_points", "energy")
