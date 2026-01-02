from __future__ import annotations

from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from models.friend import StatusRequestType, utc_now
from repositories.friendRepository import FriendRepository


class FriendService:
    """Business logic for Friend Requests."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.friend_repo = FriendRepository(session)

    async def accept_request(self, *, request_id: int, receiver_id: int) -> None:
        now = utc_now()

        async with self.session.begin():
            friend_request = await self.friend_repo.get_friend_request_by_id(request_id)
            if not friend_request:
                raise HTTPException(status_code=404, detail="Friend request not found")

            if friend_request.receiver_id != receiver_id:
                raise HTTPException(status_code=403, detail="Not allowed")

            if friend_request.status != StatusRequestType.PENDING:
                raise HTTPException(status_code=400, detail="Friend request is not pending")

            # Prevent duplicates in case of race / manual DB edits
            if await self.friend_repo.are_friends(friend_request.sender_id, friend_request.receiver_id):
                raise HTTPException(status_code=400, detail="Users are already friends")

            await self.friend_repo.update_friend_request_status(
                friend_request,
                status=StatusRequestType.ACCEPTED,
                responded_at=now,
                commit=False,
            )
            await self.friend_repo.create_friendship_pair(
                user_id=friend_request.sender_id,
                friend_id=friend_request.receiver_id,
                commit=False,
            )
