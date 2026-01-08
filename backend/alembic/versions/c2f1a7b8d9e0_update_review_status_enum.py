"""Update review_status_enum values

Revision ID: c2f1a7b8d9e0
Revises: 197988cb6dcc
Create Date: 2026-01-08 00:00:00

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "c2f1a7b8d9e0"
down_revision: Union[str, Sequence[str], None] = "197988cb6dcc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE review_status_enum_new AS ENUM ('NEWBIE', 'LEARNING', 'MASTERED')")

    op.execute("ALTER TABLE user_words ALTER COLUMN review_status DROP DEFAULT")
    op.execute(
        """
        ALTER TABLE user_words
        ALTER COLUMN review_status
        TYPE review_status_enum_new
        USING (
            CASE
                WHEN review_status IS NULL THEN NULL
                WHEN review_status::text = 'NEWBIE' THEN 'NEWBIE'
                WHEN review_status::text = 'SPECIALIST' THEN 'LEARNING'
                WHEN review_status::text = 'EXPERT' THEN 'LEARNING'
                WHEN review_status::text = 'MASTER' THEN 'MASTERED'
                ELSE 'NEWBIE'
            END
        )::review_status_enum_new
        """
    )

    op.execute("DROP TYPE review_status_enum")
    op.execute("ALTER TYPE review_status_enum_new RENAME TO review_status_enum")

    op.execute("ALTER TABLE user_words ALTER COLUMN review_status SET DEFAULT 'NEWBIE'::review_status_enum")


def downgrade() -> None:
    op.execute("CREATE TYPE review_status_enum_old AS ENUM ('NEWBIE', 'SPECIALIST', 'EXPERT', 'MASTER')")

    op.execute("ALTER TABLE user_words ALTER COLUMN review_status DROP DEFAULT")
    op.execute(
        """
        ALTER TABLE user_words
        ALTER COLUMN review_status
        TYPE review_status_enum_old
        USING (
            CASE
                WHEN review_status IS NULL THEN NULL
                WHEN review_status::text = 'NEWBIE' THEN 'NEWBIE'
                WHEN review_status::text = 'LEARNING' THEN 'SPECIALIST'
                WHEN review_status::text = 'MASTERED' THEN 'MASTER'
                ELSE 'NEWBIE'
            END
        )::review_status_enum_old
        """
    )

    op.execute("DROP TYPE review_status_enum")
    op.execute("ALTER TYPE review_status_enum_old RENAME TO review_status_enum")

    op.execute("ALTER TABLE user_words ALTER COLUMN review_status SET DEFAULT 'NEWBIE'::review_status_enum")
