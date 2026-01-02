from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import get_current_user
from database.session import get_session
from models.friend import StatusRequestType, utc_now
from models.user import User
from repositories.friendRepository import FriendRepository
from repositories.userRepository import UserRepository
from schemas.friend import FriendRequestCreate
from services.friend_service import FriendService


router = APIRouter(tags=["Friends"])


@router.get("/friends")
async def list_friends(
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	friend_repo = FriendRepository(session)
	return await friend_repo.list_friends_for_user(current_user.id)


@router.get("/friends/search")
async def search_users(
	query: str,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	friend_repo = FriendRepository(session)
	return await friend_repo.search_users_with_relationship_status(
		current_user_id=current_user.id,
		query=query,
	)


@router.get("/friend-requests/incoming")
async def list_incoming_friend_requests(
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	friend_repo = FriendRepository(session)
	return await friend_repo.list_incoming_pending_requests(receiver_id=current_user.id)


@router.post("/friend-requests")
async def send_friend_request(
	payload: FriendRequestCreate,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	receiver_id = int(payload.receiver_id)
	if receiver_id == current_user.id:
		raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")

	user_repo = UserRepository(session)
	receiver = await user_repo.get_user_by_id(receiver_id)
	if not receiver:
		raise HTTPException(status_code=404, detail="Receiver not found")

	friend_repo = FriendRepository(session)
	if await friend_repo.are_friends(current_user.id, receiver_id):
		raise HTTPException(status_code=400, detail="Users are already friends")

	if await friend_repo.pending_request_exists_between(current_user.id, receiver_id):
		raise HTTPException(status_code=400, detail="A pending friend request already exists")

	friend_request = await friend_repo.create_friend_request(
		sender_id=current_user.id,
		receiver_id=receiver_id,
		commit=True,
	)

	return {
		"id": friend_request.id,
		"sender_id": friend_request.sender_id,
		"receiver_id": friend_request.receiver_id,
		"status": friend_request.status,
		"created_at": friend_request.created_at,
	}


@router.post("/friend-requests/{request_id}/accept")
async def accept_friend_request(
	request_id: int,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	service = FriendService(session)
	await service.accept_request(request_id=request_id, receiver_id=current_user.id)
	return {"message": "Friend request accepted"}


@router.post("/friend-requests/{request_id}/reject")
async def reject_friend_request(
	request_id: int,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	friend_repo = FriendRepository(session)
	friend_request = await friend_repo.get_friend_request_by_id(request_id)
	if not friend_request:
		raise HTTPException(status_code=404, detail="Friend request not found")

	if friend_request.receiver_id != current_user.id:
		raise HTTPException(status_code=403, detail="Not allowed")

	if friend_request.status != StatusRequestType.PENDING:
		raise HTTPException(status_code=400, detail="Friend request is not pending")

	await friend_repo.update_friend_request_status(
		friend_request,
		status=StatusRequestType.REJECTED,
		responded_at=utc_now(),
		commit=True,
	)

	return {"message": "Friend request rejected"}

