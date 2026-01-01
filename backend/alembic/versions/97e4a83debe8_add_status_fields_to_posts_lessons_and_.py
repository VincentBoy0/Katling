"""add status fields to posts, lessons and related tables

Revision ID: 97e4a83debe8
Revises: dbb0fc239768
Create Date: 2026-01-01 13:33:31.543297

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '97e4a83debe8'
down_revision: Union[str, Sequence[str], None] = 'dbb0fc239768'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create ENUM types first
    lesson_status_enum = sa.Enum('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'REJECTED', name='lesson_status_enum', create_type=True)
    post_status_enum = sa.Enum('PENDING', 'ACCEPTED', 'DECLINED', 'FLAGGED', 'ARCHIVED', name='post_status_enum', create_type=True)
    comment_status_enum = sa.Enum('PENDING', 'ACCEPTED', 'DECLINED', 'FLAGGED', name='comment_status_enum', create_type=True)
    
    # Create enum types in database
    lesson_status_enum.create(op.get_bind(), checkfirst=True)
    post_status_enum.create(op.get_bind(), checkfirst=True)
    comment_status_enum.create(op.get_bind(), checkfirst=True)
    
    # Add status columns to lessons
    op.add_column('lessons', sa.Column('status', lesson_status_enum, nullable=False, server_default='DRAFT'))
    op.add_column('lessons', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add status columns to posts
    op.add_column('posts', sa.Column('status', post_status_enum, nullable=False, server_default='PENDING'))
    op.add_column('posts', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add status columns to post_comments
    op.add_column('post_comments', sa.Column('status', comment_status_enum, nullable=False, server_default='PENDING'))
    op.add_column('post_comments', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add updated_at to lesson_sections and questions
    op.add_column('lesson_sections', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('questions', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Create indexes on status columns for fast queries
    op.create_index(op.f('ix_posts_status'), 'posts', ['status'])
    op.create_index(op.f('ix_lessons_status'), 'lessons', ['status'])
    op.create_index(op.f('ix_post_comments_status'), 'post_comments', ['status'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index(op.f('ix_post_comments_status'), table_name='post_comments')
    op.drop_index(op.f('ix_lessons_status'), table_name='lessons')
    op.drop_index(op.f('ix_posts_status'), table_name='posts')
    
    # Drop columns
    op.drop_column('questions', 'updated_at')
    op.drop_column('lesson_sections', 'updated_at')
    op.drop_column('post_comments', 'updated_at')
    op.drop_column('post_comments', 'status')
    op.drop_column('posts', 'updated_at')
    op.drop_column('posts', 'status')
    op.drop_column('lessons', 'updated_at')
    op.drop_column('lessons', 'status')
    
    # Drop ENUM types
    sa.Enum(name='comment_status_enum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='post_status_enum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='lesson_status_enum').drop(op.get_bind(), checkfirst=True)
