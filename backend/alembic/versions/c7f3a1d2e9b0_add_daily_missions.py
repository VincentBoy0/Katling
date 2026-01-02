"""add daily missions

Revision ID: c7f3a1d2e9b0
Revises: 8c1e2a9f4b7d
Create Date: 2026-01-02 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM


# revision identifiers, used by Alembic.
revision: str = "c7f3a1d2e9b0"
down_revision: Union[str, Sequence[str], None] = "8c1e2a9f4b7d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Ensure user XP log enum has DAILY_MISSION
    op.execute("ALTER TYPE activity_type_enum ADD VALUE IF NOT EXISTS 'DAILY_MISSION'")

    # Create enums using raw SQL (PostgreSQL)
    # Use DO blocks to avoid errors if the type already exists.
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE mission_type_enum AS ENUM (
                'COMPLETE_SECTION',
                'COMPLETE_SECTION_SCORE_80',
                'COMPLETE_SECTION_SCORE_90',
                'SAVE_WORD',
                'REVIEW_FLASHCARD',
                'COMPLETE_LISTENING',
                'COMPLETE_WRITING',
                'COMPLETE_SPEAKING',
                'COMPLETE_READING',
                'COMPLETE_VOCABULARY',
                'COMPLETE_GRAMMAR'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE mission_status_enum AS ENUM (
                'IN_PROGRESS',
                'COMPLETED'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )

    mission_type_enum = ENUM(
        name="mission_type_enum",
        create_type=False,
    )
    mission_status_enum = ENUM(
        name="mission_status_enum",
        create_type=False,
    )


    op.create_table(
        "daily_missions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("type", mission_type_enum, nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("target_value", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("xp_reward", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("lesson_type", sa.Enum(name="lesson_type_enum", create_type=False), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "user_daily_missions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("mission_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("target_value", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("status", mission_status_enum, nullable=False, server_default=sa.text("'IN_PROGRESS'")),
        sa.Column("is_claimed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("claimed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["mission_id"], ["daily_missions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "mission_id", "date", name="uix_user_mission_date"),
    )

    op.create_index(op.f("ix_user_daily_missions_user_id"), "user_daily_missions", ["user_id"], unique=False)
    op.create_index(op.f("ix_user_daily_missions_mission_id"), "user_daily_missions", ["mission_id"], unique=False)
    op.create_index(op.f("ix_user_daily_missions_date"), "user_daily_missions", ["date"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f("ix_user_daily_missions_date"), table_name="user_daily_missions")
    op.drop_index(op.f("ix_user_daily_missions_mission_id"), table_name="user_daily_missions")
    op.drop_index(op.f("ix_user_daily_missions_user_id"), table_name="user_daily_missions")

    op.drop_table("user_daily_missions")
    op.drop_table("daily_missions")

    # Dropping enum types is safe only after all dependent columns are removed.
    op.execute("DROP TYPE IF EXISTS mission_status_enum")
    op.execute("DROP TYPE IF EXISTS mission_type_enum")

    # Note: removing a value from Postgres enum (activity_type_enum) is non-trivial.
    # We intentionally leave DAILY_MISSION in place on downgrade.
