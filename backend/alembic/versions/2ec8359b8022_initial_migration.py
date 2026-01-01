"""initial migration

Revision ID: 2ec8359b8022
Revises: 
Create Date: 2025-12-29 23:40:56.657278

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2ec8359b8022'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create Role enum and roles table
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column(
            "type",
            sa.Enum("ADMIN", "MODERATOR", "LEARNER", name="roletype"),
            nullable=False,
        ),
        sa.Column("description", sa.Text(), nullable=True),
    )

    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("firebase_uid", sa.String(length=255), nullable=False, unique=True),
        sa.Column("email", sa.String(length=320), nullable=True, unique=True),
        sa.Column("username", sa.String(length=150), nullable=True, unique=True),
        sa.Column("xp", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("streak", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("is_banned", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("last_active_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # NOTE:
    # `topics` and `lessons` are created later in revision 6231d684203c.
    # Keeping them out of the initial migration avoids duplicate-table errors
    # when running `alembic upgrade head` from scratch.

    # Create user_roles table (FKs to users and roles)
    op.create_table(
        "user_roles",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("role_id", "user_id", name="uix_role_user"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse dependency order
    op.drop_table("user_roles")
    op.drop_table("users")
    op.drop_table("roles")

    # Drop ENUM types if they exist (PostgreSQL)
    try:
        op.execute("DROP TYPE IF EXISTS roletype")
    except Exception:
        pass
