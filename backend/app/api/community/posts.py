from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from models.user import User
from repositories.postRepository import PostRepository
from schemas.post import (
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


@router.post("/posts", response_model=PostCreateResponse)
async def create_post(
	payload: PostCreate,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	post = await repo.create_post(
		user_id=current_user.id,
		content={"title": payload.title, "body": payload.body},
	)
	return {"id": post.id}


@router.delete("/posts/{post_id}")
async def delete_post(
	post_id: int,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	post = await repo.get_post_by_id(post_id)
	if not post or post.is_deleted:
		raise HTTPException(status_code=404, detail="Post not found")

	if post.user_id != current_user.id:
		raise HTTPException(status_code=403, detail="Not allowed")

	await repo.soft_delete_post(post, archive=True)
	return {"message": "Post deleted"}


@router.post("/posts/{post_id}/like")
async def like_post(
	post_id: int,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	repo = PostRepository(session)
	try:
		like = await repo.like_post(post_id=post_id, user_id=current_user.id)
	except ValueError as exc:
		msg = str(exc)
		if msg == "Post not found":
			raise HTTPException(status_code=404, detail="Post not found") from exc
		if msg == "Already liked":
			raise HTTPException(status_code=400, detail="Already liked") from exc
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
	except ValueError as exc:
		if str(exc) == "Not liked":
			raise HTTPException(status_code=400, detail="Not liked") from exc
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
	except ValueError as exc:
		if str(exc) == "Post not found":
			raise HTTPException(status_code=404, detail="Post not found") from exc
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
	comment = await repo.get_comment_by_id(comment_id)
	if not comment or comment.post_id != post_id:
		raise HTTPException(status_code=404, detail="Comment not found")

	if comment.user_id != current_user.id:
		raise HTTPException(status_code=403, detail="Not allowed")

	if comment.is_deleted:
		raise HTTPException(status_code=400, detail="Comment already deleted")

	try:
		await repo.soft_delete_comment(post_id=post_id, comment=comment)
	except ValueError as exc:
		if str(exc) == "Post not found":
			raise HTTPException(status_code=404, detail="Post not found") from exc
		raise

	return {"message": "Comment deleted"}
