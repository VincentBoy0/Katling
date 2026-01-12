from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select, func, col
from sqlmodel.ext.asyncio.session import AsyncSession

from database.session import get_session
from core.security import required_roles, get_current_user

from repositories.userRepository import UserRepository

from schemas.user import TraditionalSignUp, UserCreate, UserProfileUpdate
from schemas.role import RoleAssign, RoleRemove, UserRolesListResponse
from schemas.post import (
    AdminPostListResponse,
    AdminPostResponse,
    AdminUserPostsResponse,
    PostStatusUpdate,
    PostBulkDeleteRequest,
    PostStatsResponse,
    AdminPostCommentsResponse,
    AdminPostListItem,
    AdminCommentItem
)

from models.lesson import Lesson, LessonStatus, Topic, LessonSection, Question
from models.user import RoleType, User, UserInfo
from models.post import Post, PostComment, PostStatus


router = APIRouter(
	prefix="/admin", 
	tags=["Admin"],
	dependencies=[Depends(required_roles(RoleType.ADMIN))]
)

# ============ User Management ============

@router.get("/users", response_model=list[User])
async def list_users(
	skip: int = 0,
	limit: int = 50,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	users = await repo.get_all_users(skip=skip, limit=limit)
	return users


@router.get(
    "/users/{user_id:int}", 
    response_model=User
)
async def get_user(
	user_id: int,
	session: AsyncSession = Depends(get_session)
):
	repo = UserRepository(session)
	user = await repo.get_user_by_id(user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	return user


@router.get("/users/{user_id:int}/profile", response_model=UserInfo)
async def get_user_profile(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	profile = await repo.get_user_info_by_user_id(user_id)
	if not profile:
		raise HTTPException(status_code=404, detail="User profile not found")
	return profile


@router.patch("/users/{user_id:int}", response_model=User)
async def admin_update_user(
	user_id: int,
	data: dict,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	user = await repo.get_user_by_id(user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	# apply only provided fields
	update_fields = {k: v for k, v in data.items() if v is not None}
	if update_fields:
		# reuse update_user which expects UserUpdate schema, so set attributes directly
		for field, value in update_fields.items():
			setattr(user, field, value)
		session.add(user)
		await session.commit()
		await session.refresh(user)
	return user


@router.patch("/users/{user_id:int}/profile", response_model=UserInfo)
async def admin_update_profile(
	user_id: int,
	form: UserProfileUpdate,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	profile = await repo.update_user_info(user_id, form)
	return profile


@router.post("/users/{user_id:int}/ban", status_code=204)
async def admin_ban_user(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	await repo.ban_user(user_id)
	return None


@router.post("/users/{user_id:int}/unban", status_code=204)
async def admin_unban_user(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	await repo.unban_user(user_id)
	return None


@router.delete("/users/{user_id:int}", status_code=204)
async def admin_delete_user(
	user_id: int,
	session: AsyncSession = Depends(get_session)
):
	repo = UserRepository(session)
	await repo.delete_user(user_id)
	return None

# ============ Role Management ============

@router.post("/users/{user_id:int}/roles", status_code=status.HTTP_201_CREATED)
async def assign_role_to_user(
	user_id: int,
	form: RoleAssign,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	"""
	Assign a role to a user.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID to assign role to
		form: RoleAssign schema with role_type
		session: Database session
		current_user: Currently authenticated admin user
		
		Returns:
		Created UserRole object
		
	Raises:
		HTTPException: If user not found or role already assigned
	"""
	repo = UserRepository(session)
	user_role = await repo.assign_role_to_user(user_id, form.role_type)
	return user_role


@router.delete("/users/{user_id:int}/roles/{role_type}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_role_from_user(
	user_id: int,
	role_type: RoleType,
	session: AsyncSession = Depends(get_session),
):
	"""
	Remove a role from a user.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID to remove role from
		role_type: RoleType to remove (ADMIN, MODERATOR, LEARNER)
		session: Database session
		current_user: Currently authenticated admin user
		
	Returns:
		No content (204)
		
	Raises:
		HTTPException: If user or role not found
	"""
	repo = UserRepository(session)
	await repo.remove_role_from_user(user_id, role_type)
	return None


@router.get("/users/{user_id:int}/roles", response_model=UserRolesListResponse)
async def get_user_roles(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	"""
	Get all roles assigned to a user.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID
		session: Database session
		
	Returns:
		UserRolesListResponse with list of role types
		
	Raises:
		HTTPException: If user not found
	"""
	repo = UserRepository(session)
	roles_data = await repo.get_user_roles(user_id)
	role_types = [role["role_type"] for role in roles_data]
	return UserRolesListResponse(user_id=user_id, roles=role_types)


@router.get("/users/{user_id:int}/roles/{role_type}", response_model=dict)
async def check_user_role(
	user_id: int,
	role_type: RoleType,
	session: AsyncSession = Depends(get_session),
):
	"""
	Check if a user has a specific role.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID
		role_type: RoleType to check (ADMIN, MODERATOR, LEARNER)
		session: Database session
		
	Returns:
		Dict with user_id, role_type, and has_role boolean
	"""
	repo = UserRepository(session)
	has_role = await repo.has_role(user_id, role_type)
	return {
		"user_id": user_id,
		"role_type": role_type,
		"has_role": has_role,
	}

# ============ Lesson Management ============

@router.patch("/lesson/{lesson_id:int}", response_model=Lesson)
async def update_status_lesson(
	lesson_id: int,
	status: LessonStatus,
	session: AsyncSession = Depends(get_session)
):
	lesson = await session.get(Lesson, lesson_id)
	if not lesson:
		raise HTTPException(status_code=404, detail="Lesson not found")
	lesson.status = status
	session.add(lesson)
	await session.commit() 
	await session.refresh(lesson)
	return lesson


@router.patch("/topic/{topic_id:int}", response_model=Topic)
async def update_status_topic(
	topic_id: int,
	status: LessonStatus,
	session: AsyncSession = Depends(get_session)
):
	"""Update the status of a topic."""
	topic = await session.get(Topic, topic_id)
	if not topic:
		raise HTTPException(status_code=404, detail="Topic not found")
	topic.status = status
	session.add(topic)
	await session.commit()
	await session.refresh(topic)
	return topic


@router.patch("/section/{section_id:int}", response_model=LessonSection)
async def update_status_section(
	section_id: int,
	status: LessonStatus,
	session: AsyncSession = Depends(get_session)
):
	"""Update the status of a lesson section."""
	section = await session.get(LessonSection, section_id)
	if not section:
		raise HTTPException(status_code=404, detail="Section not found")
	section.status = status
	session.add(section)
	await session.commit()
	await session.refresh(section)
	return section


@router.patch("/question/{question_id:int}", response_model=Question)
async def update_status_question(
	question_id: int,
	status: LessonStatus,
	session: AsyncSession = Depends(get_session)
):
	"""Update the status of a question."""
	question = await session.get(Question, question_id)
	if not question:
		raise HTTPException(status_code=404, detail="Question not found")
	question.status = status
	session.add(question)
	await session.commit()
	await session.refresh(question)
	return question 


# ============ Post Management ============

@router.get("/posts", response_model=AdminPostListResponse)
async def list_all_posts(
	skip: int = Query(0, ge=0),
	limit: int = Query(50, ge=1, le=100),
	status: Optional[PostStatus] = None,
	user_id: Optional[int] = None,
	session: AsyncSession = Depends(get_session),
):
	"""
	List all posts with pagination and filtering.
	
	**Role:** ADMIN only
	
	Args:
		skip: Number of records to skip (pagination)
		limit: Maximum number of records to return
		status: Filter by post status (PENDING, ACCEPTED, DECLINED, FLAGGED, ARCHIVED)
		user_id: Filter by user ID
		
	Returns:
		List of posts with user information and total count
	"""
	stmt = (
		select(
			Post.id,
			Post.user_id,
			Post.content,
			Post.status,
			Post.like_count,
			Post.comment_count,
			Post.created_at,
			Post.is_deleted,
			UserInfo.username,
			UserInfo.full_name,
			User.email
		)
		.join(User, User.id == Post.user_id)
		.outerjoin(UserInfo, UserInfo.user_id == User.id)
		.where(Post.is_deleted == False)
	)
	
	# Apply filters
	if status:
		stmt = stmt.where(Post.status == status)
	if user_id:
		stmt = stmt.where(Post.user_id == user_id)
	
	# Get total count
	count_stmt = select(func.count()).select_from(Post).where(Post.is_deleted == False)
	if status:
		count_stmt = count_stmt.where(Post.status == status)
	if user_id:
		count_stmt = count_stmt.where(Post.user_id == user_id)
	
	total_result = await session.exec(count_stmt)
	total = total_result.one()
	
	# Get paginated results
	stmt = stmt.order_by(Post.created_at.desc()).offset(skip).limit(limit)
	result = await session.exec(stmt)
	posts = result.all()
	
	return AdminPostListResponse(
		total=total,
		skip=skip,
		limit=limit,
		posts=[
			AdminPostListItem(
				id=p.id,
				user_id=p.user_id,
				username=p.username,
				full_name=p.full_name,
				email=p.email,
				content=p.content,
				status=p.status,
				like_count=p.like_count,
				comment_count=p.comment_count,
				created_at=p.created_at,
			)
			for p in posts
		]
	)


@router.get("/posts/{post_id:int}", response_model=AdminPostResponse)
async def get_post_detail(
	post_id: int,
	session: AsyncSession = Depends(get_session),
):
	"""
	Get detailed information about a specific post.
	
	**Role:** ADMIN only
	
	Args:
		post_id: Post ID
		
	Returns:
		Post details with user information and comments
		
	Raises:
		HTTPException: If post not found
	"""
	stmt = (
		select(
			Post.id,
			Post.user_id,
			Post.content,
			Post.status,
			Post.like_count,
			Post.comment_count,
			Post.created_at,
			Post.is_deleted,
			UserInfo.username,
			UserInfo.full_name,
			User.email
		)
		.join(User, User.id == Post.user_id)
		.outerjoin(UserInfo, UserInfo.user_id == User.id)
		.where(Post.id == post_id)
	)
	
	result = await session.exec(stmt)
	post = result.first()
	
	if not post:
		raise HTTPException(status_code=404, detail="Post not found")
	
	# Get comments count
	comment_stmt = select(func.count()).select_from(PostComment).where(
		PostComment.post_id == post_id,
		PostComment.is_deleted == False
	)
	comment_result = await session.exec(comment_stmt)
	comment_count = comment_result.one()
	
	return AdminPostResponse(
		id=post.id,
		user_id=post.user_id,
		username=post.username,
		full_name=post.full_name,
		email=post.email,
		content=post.content,
		status=post.status,
		like_count=post.like_count,
		comment_count=comment_count,
		created_at=post.created_at,
		is_deleted=post.is_deleted,
	)


@router.get("/users/{user_id:int}/posts", response_model=AdminUserPostsResponse)
async def get_user_posts(
	user_id: int,
	skip: int = Query(0, ge=0),
	limit: int = Query(50, ge=1, le=100),
	session: AsyncSession = Depends(get_session),
):
	"""
	Get all posts by a specific user.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID
		skip: Number of records to skip
		limit: Maximum number of records to return
		
	Returns:
		List of user's posts with total count
		
	Raises:
		HTTPException: If user not found
	"""
	# Check if user exists
	user = await session.get(User, user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	
	# Get total count
	count_stmt = select(func.count()).select_from(Post).where(
		Post.user_id == user_id,
		Post.is_deleted == False
	)
	total_result = await session.exec(count_stmt)
	total = total_result.one()
	
	# Get posts
	stmt = (
		select(Post)
		.where(Post.user_id == user_id, Post.is_deleted == False)
		.order_by(Post.created_at.desc())
		.offset(skip)
		.limit(limit)
	)
	
	result = await session.exec(stmt)
	posts = result.all()
	
	return AdminUserPostsResponse(
		user_id=user_id,
		total=total,
		skip=skip,
		limit=limit,
		posts=[post.model_dump() for post in posts]
	)


@router.patch("/posts/{post_id:int}/status", response_model=Post)
async def update_post_status(
	post_id: int,
	data: PostStatusUpdate,
	session: AsyncSession = Depends(get_session),
):
	"""
	Update the status of a post.
	
	**Role:** ADMIN only
	
	Args:
		post_id: Post ID
		data: PostStatusUpdate with new status
		
	Returns:
		Updated post
		
	Raises:
		HTTPException: If post not found
	"""
	post = await session.get(Post, post_id)
	if not post:
		raise HTTPException(status_code=404, detail="Post not found")
	
	post.status = data.status
	session.add(post)
	await session.commit()
	await session.refresh(post)
	return post


@router.delete("/posts/{post_id:int}", status_code=204)
async def delete_post(
	post_id: int,
	hard_delete: bool = Query(False, description="Permanently delete instead of soft delete"),
	session: AsyncSession = Depends(get_session),
):
	"""
	Delete a post (soft delete by default, hard delete optional).
	
	**Role:** ADMIN only
	
	Args:
		post_id: Post ID
		hard_delete: If True, permanently delete. If False, soft delete (mark as deleted)
		
	Returns:
		No content (204)
		
	Raises:
		HTTPException: If post not found
	"""
	post = await session.get(Post, post_id)
	if not post:
		raise HTTPException(status_code=404, detail="Post not found")
	
	if hard_delete:
		# Permanently delete
		await session.delete(post)
	else:
		# Soft delete
		post.is_deleted = True
		session.add(post)
	
	await session.commit()
	return None


@router.post("/posts/bulk-delete", status_code=204)
async def bulk_delete_posts(
	data: PostBulkDeleteRequest,
	hard_delete: bool = Query(False, description="Permanently delete instead of soft delete"),
	session: AsyncSession = Depends(get_session),
):
	"""
	Delete multiple posts at once.
	
	**Role:** ADMIN only
	
	Args:
		data: PostBulkDeleteRequest with list of post IDs
		hard_delete: If True, permanently delete. If False, soft delete
		
	Returns:
		No content (204)
	"""
	stmt = select(Post).where(Post.id.in_(data.post_ids))
	result = await session.exec(stmt)
	posts = result.all()
	
	if hard_delete:
		for post in posts:
			await session.delete(post)
	else:
		for post in posts:
			post.is_deleted = True
			session.add(post)
	
	await session.commit()
	return None


@router.get("/posts/stats", response_model=PostStatsResponse)
async def get_posts_stats(
	session: AsyncSession = Depends(get_session),
):
	"""
	Get statistics about posts.
	
	**Role:** ADMIN only
	
	Returns:
		Statistics including total posts, posts by status, etc.
	"""
	# Total posts
	total_stmt = select(func.count()).select_from(Post).where(Post.is_deleted == False)
	total_result = await session.exec(total_stmt)
	total = total_result.one()
	
	# Posts by status
	stats_by_status = {}
	for status in PostStatus:
		stmt = select(func.count()).select_from(Post).where(
			Post.status == status,
			Post.is_deleted == False
		)
		result = await session.exec(stmt)
		stats_by_status[status.value] = result.one()
	
	# Deleted posts
	deleted_stmt = select(func.count()).select_from(Post).where(Post.is_deleted == True)
	deleted_result = await session.exec(deleted_stmt)
	deleted = deleted_result.one()
	
	return PostStatsResponse(
		total_posts=total,
		deleted_posts=deleted,
		by_status=stats_by_status,
	)


@router.get("/posts/{post_id:int}/comments", response_model=AdminPostCommentsResponse)
async def get_post_comments(
	post_id: int,
	skip: int = Query(0, ge=0),
	limit: int = Query(50, ge=1, le=100),
	session: AsyncSession = Depends(get_session),
):
	"""
	Get all comments for a specific post.
	
	**Role:** ADMIN only
	
	Args:
		post_id: Post ID
		skip: Number of records to skip
		limit: Maximum number of records to return
		
	Returns:
		List of comments with user information
		
	Raises:
		HTTPException: If post not found
	"""
	# Check if post exists
	post = await session.get(Post, post_id)
	if not post:
		raise HTTPException(status_code=404, detail="Post not found")
	
	# Get comments
	stmt = (
		select(
			PostComment.id,
			PostComment.post_id,
			PostComment.user_id,
			PostComment.content,
			PostComment.created_at,
			PostComment.is_deleted,
			UserInfo.username,
			UserInfo.full_name
		)
		.join(User, User.id == PostComment.user_id)
		.outerjoin(UserInfo, UserInfo.user_id == User.id)
		.where(PostComment.post_id == post_id, PostComment.is_deleted == False)
		.order_by(PostComment.created_at.desc())
		.offset(skip)
		.limit(limit)
	)
	
	result = await session.exec(stmt)
	comments = result.all()
	
	return AdminPostCommentsResponse(
		post_id=post_id,
		comments=[
			AdminCommentItem(
				id=c.id,
				user_id=c.user_id,
				username=c.username,
				full_name=c.full_name,
				content=c.content,
				created_at=c.created_at,
			)
			for c in comments
		]
	)


@router.delete("/comments/{comment_id:int}", status_code=204)
async def delete_comment(
	comment_id: int,
	hard_delete: bool = Query(False, description="Permanently delete instead of soft delete"),
	session: AsyncSession = Depends(get_session),
):
	"""
	Delete a comment.
	
	**Role:** ADMIN only
	
	Args:
		comment_id: Comment ID
		hard_delete: If True, permanently delete. If False, soft delete
		
	Returns:
		No content (204)
		
	Raises:
		HTTPException: If comment not found
	"""
	comment = await session.get(PostComment, comment_id)
	if not comment:
		raise HTTPException(status_code=404, detail="Comment not found")
	
	if hard_delete:
		await session.delete(comment)
	else:
		comment.is_deleted = True
		session.add(comment)
	
	await session.commit()
	return None


