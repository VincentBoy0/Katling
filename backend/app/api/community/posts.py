from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from models.user import User
from repositories.postRepository import PostRepository
from schemas.post import (
	PostCommentResponse,
	PostCreate,
	PostCreateResponse,
	PostCommentCreate,
	PostCommentCreateResponse,
)


router = APIRouter(tags=["Posts"])


@router.get("/posts/feed")
async def get_feed(
	limit: int = 20,
	offset: int = 0,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	return await repo.list_feed(
		current_user_id=current_user.id,
		limit=limit,
		offset=offset,
	)


@router.get("/users/me/posts")
async def get_my_posts(
	limit: int = 20,
	offset: int = 0,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	return await repo.list_posts_by_user(
		user_id=current_user.id,
		current_user_id=current_user.id,
		limit=limit,
		offset=offset,
	)


@router.get("/posts/{post_id}/comments", response_model=list[PostCommentResponse])
async def get_post_comments(
    post_id: int,
    limit: int = 20,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
):
    """
    Get all comments for a specific post.
    
    Args:
        post_id: ID of the post to get comments for
        limit: Maximum number of comments to return (default: 20)
        offset: Number of comments to skip (default: 0)
    
    Returns:
        List of comments with author information
    """
    repo = PostRepository(session)
    
    # Verify post exists
    post = await repo.get_post_by_id(post_id)
    if not post or post.is_deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = await repo.list_comments_by_post(
        post_id=post_id,
        limit=limit,
        offset=offset,
    )
    
    return comments


@router.post("/posts", response_model=PostCreateResponse)
async def create_post(
	payload: PostCreate,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	try:
		post = await repo.create_post(
			user_id=current_user.id,
			content={"title": payload.title, "body": payload.body},
		)
		await session.commit()
		return {"id": post.id}
	except Exception:
		await session.rollback()
		raise


@router.delete("/posts/{post_id}")
async def delete_post(
	post_id: int,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	try:
		post = await repo.get_post_by_id(post_id)
		if not post or post.is_deleted:
			raise HTTPException(status_code=404, detail="Post not found")

		if post.user_id != current_user.id:
			raise HTTPException(status_code=403, detail="Not allowed")

		await repo.soft_delete_post(post, archive=True)
		await session.commit()
		return {"message": "Post deleted"}
	except HTTPException:
		await session.rollback()
		raise
	except Exception:
		await session.rollback()
		raise


@router.post("/posts/{post_id}/like")
async def like_post(
	post_id: int,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	try:
		like = await repo.like_post(post_id=post_id, user_id=current_user.id)
		await session.commit()
	except ValueError as exc:
		await session.rollback()
		msg = str(exc)
		if msg == "Post not found":
			raise HTTPException(status_code=404, detail="Post not found") from exc
		if msg == "Already liked":
			raise HTTPException(status_code=400, detail="Already liked") from exc
		raise
	except Exception:
		await session.rollback()
		raise

	return {"id": like.id}


@router.delete("/posts/{post_id}/like")
async def unlike_post(
	post_id: int,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	try:
		await repo.unlike_post(post_id=post_id, user_id=current_user.id)
		await session.commit()
	except ValueError as exc:
		await session.rollback()
		if str(exc) == "Not liked":
			raise HTTPException(status_code=400, detail="Not liked") from exc
		raise
	except Exception:
		await session.rollback()
		raise

	return {"message": "Unliked"}


@router.post("/posts/{post_id}/comments", response_model=PostCommentCreateResponse)
async def create_comment(
	post_id: int,
	payload: PostCommentCreate,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	try:
		comment = await repo.create_comment(
			post_id=post_id,
			user_id=current_user.id,
			content=payload.content,
		)
		await session.commit()
	except ValueError as exc:
		await session.rollback()
		if str(exc) == "Post not found":
			raise HTTPException(status_code=404, detail="Post not found") from exc
		raise
	except Exception:
		await session.rollback()
		raise

	return {"id": comment.id}


@router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(
	post_id: int,
	comment_id: int,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	try:
		comment = await repo.get_comment_by_id(comment_id)
		if not comment or comment.post_id != post_id:
			raise HTTPException(status_code=404, detail="Comment not found")

		if comment.user_id != current_user.id:
			raise HTTPException(status_code=403, detail="Not allowed")

		if comment.is_deleted:
			raise HTTPException(status_code=400, detail="Comment already deleted")

		await repo.soft_delete_comment(post_id=post_id, comment=comment)
		await session.commit()
		return {"message": "Comment deleted"}
	except ValueError as exc:
		await session.rollback()
		if str(exc) == "Post not found":
			raise HTTPException(status_code=404, detail="Post not found") from exc
		raise
	except HTTPException:
		await session.rollback()
		raise
	except Exception:
		await session.rollback()
		raise
