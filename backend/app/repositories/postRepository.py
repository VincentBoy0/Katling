from __future__ import annotations

from typing import Any

from sqlalchemy import exists
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.post import Post, PostComment, PostLike, PostStatus
from models.user import User, UserInfo


class PostRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _normalize_pagination(limit: int | None, offset: int | None) -> tuple[int, int]:
        l = 20 if limit is None else int(limit)
        o = 0 if offset is None else int(offset)
        if l <= 0:
            l = 20
        if o < 0:
            o = 0
        return l, o

    async def get_post_by_id(self, post_id: int) -> Post | None:
        stmt = select(Post).where(Post.id == post_id)
        result = await self.session.exec(stmt)
        return result.first()

    async def list_feed(
        self,
        *,
        current_user_id: int,
        limit: int | None = 20,
        offset: int | None = 0,
    ) -> list[dict]:
        limit, offset = self._normalize_pagination(limit, offset)

        is_liked_by_me = exists(
            select(PostLike.id).where(
                (PostLike.post_id == Post.id) & (PostLike.user_id == current_user_id)
            )
        ).label("is_liked_by_me")

        stmt = (
            select(
                Post.id.label("post_id"),
                User.id.label("author_id"),
                UserInfo.username.label("author_username"),
                Post.content.label("content"),
                Post.like_count.label("like_count"),
                Post.comment_count.label("comment_count"),
                is_liked_by_me,
                Post.created_at.label("created_at"),
            )
            .select_from(Post)
            .join(User, User.id == Post.user_id)
            .outerjoin(UserInfo, UserInfo.user_id == User.id)
            .where(Post.is_deleted == False)
            .where(Post.status == PostStatus.ACCEPTED)
            .order_by(Post.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.exec(stmt)
        rows = result.all()
        return [
            {
                "post_id": int(r.post_id),
                "author_id": int(r.author_id),
                "author_username": r.author_username,
                "content": r.content,
                "like_count": int(r.like_count or 0),
                "comment_count": int(r.comment_count or 0),
                "is_liked_by_me": bool(r.is_liked_by_me),
                "created_at": r.created_at,
            }
            for r in rows
        ]

    async def list_posts_by_user(
        self,
        *,
        user_id: int,
        current_user_id: int,
        limit: int | None = 20,
        offset: int | None = 0,
    ) -> list[dict]:
        limit, offset = self._normalize_pagination(limit, offset)

        is_liked_by_me = exists(
            select(PostLike.id).where(
                (PostLike.post_id == Post.id) & (PostLike.user_id == current_user_id)
            )
        ).label("is_liked_by_me")

        stmt = (
            select(
                Post.id.label("post_id"),
                Post.content.label("content"),
                Post.like_count.label("like_count"),
                Post.comment_count.label("comment_count"),
                is_liked_by_me,
                Post.created_at.label("created_at"),
            )
            .select_from(Post)
            .where(Post.user_id == user_id)
            .where(Post.is_deleted == False)
            .order_by(Post.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.exec(stmt)
        rows = result.all()
        return [
            {
                "post_id": int(r.post_id),
                "content": r.content,
                "like_count": int(r.like_count or 0),
                "comment_count": int(r.comment_count or 0),
                "is_liked_by_me": bool(r.is_liked_by_me),
                "created_at": r.created_at,
            }
            for r in rows
        ]

    async def create_post(self, *, user_id: int, content: dict[str, Any]) -> Post:
        post = Post(
            user_id=user_id,
            content=content,
            status=PostStatus.ACCEPTED,
            like_count=0,
            comment_count=0,
            is_deleted=False,
        )
        self.session.add(post)
        await self.session.flush()
        await self.session.refresh(post)
        return post

    async def soft_delete_post(self, post: Post, *, archive: bool = True) -> Post:
        post.is_deleted = True
        if archive:
            post.status = PostStatus.ARCHIVED
        self.session.add(post)
        await self.session.flush()
        await self.session.refresh(post)
        return post

    async def get_like(self, *, post_id: int, user_id: int) -> PostLike | None:
        stmt = select(PostLike).where(
            (PostLike.post_id == post_id) & (PostLike.user_id == user_id)
        )
        result = await self.session.exec(stmt)
        return result.first()

    async def like_post(self, *, post_id: int, user_id: int) -> PostLike:
        """Like a post and increment counter atomically.

        Raises:
            ValueError: for domain validation errors.
        """
        post = await self.get_post_by_id(post_id)
        if not post or post.is_deleted:
            raise ValueError("Post not found")

        existing = await self.get_like(post_id=post_id, user_id=user_id)
        if existing is not None:
            raise ValueError("Already liked")

        like = PostLike(post_id=post_id, user_id=user_id)
        self.session.add(like)

        post.like_count = max(int(post.like_count or 0) + 1, 0)
        self.session.add(post)

        try:
            await self.session.flush()
        except IntegrityError as exc:
            # UniqueConstraint(post_id, user_id) – handle race conditions.
            raise ValueError("Already liked") from exc

        await self.session.refresh(like)
        return like

    async def unlike_post(self, *, post_id: int, user_id: int) -> None:
        """Unlike a post and decrement counter atomically.

        Raises:
            ValueError: if the user hasn't liked the post.
        """
        like = await self.get_like(post_id=post_id, user_id=user_id)
        if like is None:
            raise ValueError("Not liked")

        post = await self.get_post_by_id(post_id)
        # If post is missing (shouldn't happen due to FK), still allow deleting like.
        if post is not None:
            post.like_count = max(int(post.like_count or 0) - 1, 0)
            self.session.add(post)

        await self.session.delete(like)
        await self.session.flush()

    async def create_comment(self, *, post_id: int, user_id: int, content: str) -> PostComment:
        """Create a comment and increment counter atomically.

        Raises:
            ValueError: for domain validation errors.
        """
        post = await self.get_post_by_id(post_id)
        if not post or post.is_deleted:
            raise ValueError("Post not found")

        comment = PostComment(post_id=post_id, user_id=user_id, content=content)
        self.session.add(comment)

        post.comment_count = max(int(post.comment_count or 0) + 1, 0)
        self.session.add(post)

        await self.session.flush()

        await self.session.refresh(comment)
        return comment

    async def get_comment_by_id(self, comment_id: int) -> PostComment | None:
        stmt = select(PostComment).where(PostComment.id == comment_id)
        result = await self.session.exec(stmt)
        return result.first()

    async def soft_delete_comment(
        self,
        *,
        post_id: int,
        comment: PostComment,
    ) -> None:
        """Soft delete a comment and decrement post counter atomically.

        Raises:
            ValueError: if post not found.
        """
        post = await self.get_post_by_id(post_id)
        if not post:
            raise ValueError("Post not found")

        comment.is_deleted = True
        self.session.add(comment)

        post.comment_count = max(int(post.comment_count or 0) - 1, 0)
        self.session.add(post)
        await self.session.flush()
