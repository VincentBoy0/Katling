from __future__ import annotations

from datetime import datetime

from sqlalchemy import case, exists, func, literal
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.friend import Friend, FriendRequest, StatusRequestType
from models.user import User, UserPoints, UserInfo


class FriendRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def are_friends(self, user_id: int, other_user_id: int) -> bool:
        stmt = select(Friend.id).where(
            ((Friend.user_id == user_id) & (Friend.friend_id == other_user_id))
            | ((Friend.user_id == other_user_id) & (Friend.friend_id == user_id))
        )
        result = await self.session.exec(stmt)
        return result.first() is not None

    async def pending_request_exists_between(self, user_a: int, user_b: int) -> bool:
        stmt = select(FriendRequest.id).where(
            (
                ((FriendRequest.sender_id == user_a) & (FriendRequest.receiver_id == user_b))
                | ((FriendRequest.sender_id == user_b) & (FriendRequest.receiver_id == user_a))
            )
            & (FriendRequest.status == StatusRequestType.PENDING)
        )
        result = await self.session.exec(stmt)
        return result.first() is not None

    async def get_friend_request_by_id(self, request_id: int) -> FriendRequest | None:
        stmt = select(FriendRequest).where(FriendRequest.id == request_id)
        result = await self.session.exec(stmt)
        return result.first()

    async def create_friend_request(
        self,
        *,
        sender_id: int,
        receiver_id: int,
        commit: bool = True,
    ) -> FriendRequest:
        friend_request = FriendRequest(
            sender_id=sender_id,
            receiver_id=receiver_id,
            status=StatusRequestType.PENDING,
        )
        self.session.add(friend_request)
        if commit:
            await self.session.commit()
            await self.session.refresh(friend_request)
        return friend_request

    async def update_friend_request_status(
        self,
        friend_request: FriendRequest,
        *,
        status: StatusRequestType,
        responded_at: datetime,
        commit: bool = True,
    ) -> FriendRequest:
        friend_request.status = status
        friend_request.responded_at = responded_at
        self.session.add(friend_request)
        if commit:
            await self.session.commit()
            await self.session.refresh(friend_request)
        return friend_request

    async def create_friendship_pair(
        self,
        *,
        user_id: int,
        friend_id: int,
        commit: bool = True,
    ) -> None:
        """Create friend relationship in both directions.

        Assumes validation is already done (not already friends).
        """

        self.session.add(Friend(user_id=user_id, friend_id=friend_id))
        self.session.add(Friend(user_id=friend_id, friend_id=user_id))
        if commit:
            await self.session.commit()

    async def list_friends_for_user(self, user_id: int) -> list[dict]:
        xp_value = func.coalesce(UserPoints.xp, 0)
        streak_value = func.coalesce(UserPoints.streak, 0)

        stmt = (
            select(
                User.id.label("user_id"),
                UserInfo.username.label("username"),
                xp_value.label("xp"),
                streak_value.label("streak"),
            )
            .select_from(Friend)
            .join(User, User.id == Friend.friend_id)
            .outerjoin(UserPoints, UserPoints.user_id == User.id)
            .outerjoin(UserInfo, UserInfo.user_id == User.id)
            .where(Friend.user_id == user_id)
            .order_by(UserInfo.username.asc(), xp_value.desc())
        )

        result = await self.session.exec(stmt)
        rows = result.all()
        return [
            {
                "user_id": int(r.user_id),
                "username": r.username,
                "xp": int(r.xp or 0),
                "streak": int(r.streak or 0),
            }
            for r in rows
        ]

    async def search_users_with_relationship_status(
        self,
        *,
        current_user_id: int,
        query: str,
        limit: int = 20,
    ) -> list[dict]:
        q = (query or "").strip()
        if not q:
            return []

        friend_exists = exists(
            select(Friend.id).where(
                (Friend.user_id == current_user_id) & (Friend.friend_id == User.id)
            )
        )
        sent_pending_exists = exists(
            select(FriendRequest.id).where(
                (FriendRequest.sender_id == current_user_id)
                & (FriendRequest.receiver_id == User.id)
                & (FriendRequest.status == StatusRequestType.PENDING)
            )
        )
        received_pending_exists = exists(
            select(FriendRequest.id).where(
                (FriendRequest.sender_id == User.id)
                & (FriendRequest.receiver_id == current_user_id)
                & (FriendRequest.status == StatusRequestType.PENDING)
            )
        )

        relationship_status = case(
            (friend_exists, literal("FRIENDS")),
            (sent_pending_exists, literal("REQUEST_SENT")),
            (received_pending_exists, literal("REQUEST_RECEIVED")),
            else_=literal("NONE"),
        ).label("relationship_status")

        stmt = (
            select(
                User.id.label("user_id"),
                UserInfo.username.label("username"),
                relationship_status,
            )
            .select_from(User)
            .outerjoin(UserInfo, UserInfo.user_id == User.id)
            .where(User.id != current_user_id)
            # .where(func.lower(UserInfo.username).like(f"%{q.lower()}%"))
            .where(
                (func.lower(UserInfo.username).like(f"%{q.lower()}%"))
                | (func.lower(User.email).like(f"%{q.lower()}%"))
            )
            .order_by(UserInfo.username.asc())
            .limit(limit)
        )

        result = await self.session.exec(stmt)
        rows = result.all()
        return [
            {
                "user_id": int(r.user_id),
                "username": r.username,
                "relationship_status": str(r.relationship_status),
            }
            for r in rows
        ]

    async def list_incoming_pending_requests(self, *, receiver_id: int) -> list[dict]:
        stmt = (
            select(
                FriendRequest.id.label("request_id"),
                FriendRequest.sender_id.label("sender_id"),
                UserInfo.username.label("sender_username"),
                FriendRequest.created_at.label("created_at"),
            )
            .select_from(FriendRequest)
            .join(User, User.id == FriendRequest.sender_id)
            .outerjoin(UserInfo, UserInfo.user_id == User.id)
            .where(FriendRequest.receiver_id == receiver_id)
            .where(FriendRequest.status == StatusRequestType.PENDING)
            .order_by(FriendRequest.created_at.desc())
        )

        result = await self.session.exec(stmt)
        rows = result.all()
        return [
            {
                "request_id": int(r.request_id),
                "sender_id": int(r.sender_id),
                "sender_username": r.sender_username,
                "created_at": r.created_at,
            }
            for r in rows
        ]
