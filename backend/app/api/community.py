from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.auth import get_current_user, get_current_user_optional
from app.models.models import (
    CommunityPost, PostComment, PostLike, SavedPost, ContentReport,
    CommunityGroup, GroupMember, GroupAnnouncement, User, Crop, Location
)
from app.schemas.schemas import (
    CommunityPostCreate, CommunityPostUpdate, CommunityPostResponse,
    PostCommentCreate, PostCommentResponse,
    CommunityGroupCreate, CommunityGroupResponse,
    GroupMemberResponse, GroupAnnouncementCreate, GroupAnnouncementResponse,
    ContentReportCreate, ContentReportResponse, GroupMemberRoleUpdate
)

router = APIRouter(prefix="/community", tags=["Farmer Community"])


# ----------------------------------------------------------------------
# 1. COMMUNITY FORUM POSTS
# ----------------------------------------------------------------------

@router.get("/posts", response_model=List[CommunityPostResponse], summary="List community forum posts with search & filters")
def get_community_posts(
    search: Optional[str] = Query(None, description="Search post title and content"),
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    taluk: Optional[str] = Query(None, description="Filter by author taluk"),
    village: Optional[str] = Query(None, description="Filter by author village"),
    group_id: Optional[int] = Query(None, description="Filter by group ID"),
    filter_type: Optional[str] = Query(None, description="Filter type: 'all', 'my', 'saved'"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    # Safety checks for direct test calls where default is Query object
    if isinstance(search, Session):
        db = search
        search = None
    if not isinstance(search, str): search = None
    if not isinstance(crop_id, int): crop_id = None
    if not isinstance(topic, str): topic = None
    if not isinstance(taluk, str): taluk = None
    if not isinstance(village, str): village = None
    if not isinstance(group_id, int): group_id = None
    if not isinstance(filter_type, str): filter_type = None
    if not isinstance(page, int): page = 1
    if not isinstance(limit, int): limit = 20

    user_id = current_user.id if current_user else None

    query = db.query(CommunityPost)

    if group_id:
        query = query.filter(CommunityPost.group_id == group_id)
    
    if crop_id:
        query = query.filter(CommunityPost.crop_id == crop_id)

    if topic and topic != "all":
        query = query.filter(CommunityPost.topic == topic)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                CommunityPost.title.ilike(s),
                CommunityPost.content.ilike(s)
            )
        )

    if taluk or village:
        query = query.join(User, CommunityPost.author_id == User.id).join(Location, User.location_id == Location.id, isouter=True)
        if taluk:
            query = query.filter(Location.taluk.ilike(f"%{taluk}%"))
        if village:
            query = query.filter(Location.village.ilike(f"%{village}%"))

    # My Posts filter
    if filter_type == "my":
        if not user_id:
            return []
        query = query.filter(CommunityPost.author_id == user_id)

    # Saved Posts filter
    if filter_type == "saved":
        if not user_id:
            return []
        saved_post_ids = db.query(SavedPost.post_id).filter(SavedPost.user_id == user_id)
        query = query.filter(CommunityPost.id.in_(saved_post_ids))

    query = query.order_by(CommunityPost.is_pinned.desc(), CommunityPost.created_at.desc())
    offset = (page - 1) * limit
    posts = query.offset(offset).limit(limit).all()

    # Pre-fetch user's likes and saves
    user_liked_post_ids = set()
    user_saved_post_ids = set()
    if user_id:
        user_liked_post_ids = set(r[0] for r in db.query(PostLike.post_id).filter(PostLike.user_id == user_id).all())
        user_saved_post_ids = set(r[0] for r in db.query(SavedPost.post_id).filter(SavedPost.user_id == user_id).all())

    result = []
    for p in posts:
        resp = CommunityPostResponse.model_validate(p)
        if p.author:
            resp.author_name = p.author.full_name
            resp.author_role = p.author.role
            if p.author.location:
                resp.author_village = p.author.location.village
                resp.author_taluk = p.author.location.taluk
        if p.crop:
            resp.crop_name_en = p.crop.name_en
            resp.crop_name_kn = p.crop.name_kn
        
        resp.is_liked = p.id in user_liked_post_ids
        resp.is_saved = p.id in user_saved_post_ids
        result.append(resp)

    return result


@router.post("/posts", response_model=CommunityPostResponse, summary="Create a new community discussion post")
def create_community_post(
    payload: CommunityPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = CommunityPost(
        title=payload.title,
        content=payload.content,
        topic=payload.topic or "general",
        crop_id=payload.crop_id,
        group_id=payload.group_id,
        image_url=payload.image_url,
        language=payload.language or current_user.preferred_language,
        author_id=current_user.id,
        location_id=current_user.location_id
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    resp = CommunityPostResponse.model_validate(post)
    resp.author_name = current_user.full_name
    resp.author_role = current_user.role
    if current_user.location:
        resp.author_village = current_user.location.village
        resp.author_taluk = current_user.location.taluk
    if post.crop:
        resp.crop_name_en = post.crop.name_en
        resp.crop_name_kn = post.crop.name_kn
    resp.is_liked = False
    resp.is_saved = False
    return resp


@router.get("/posts/{post_id}", response_model=CommunityPostResponse, summary="Get post detail by ID")
def get_community_post_detail(
    post_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    is_liked = False
    is_saved = False
    if current_user:
        is_liked = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == current_user.id).first() is not None
        is_saved = db.query(SavedPost).filter(SavedPost.post_id == post_id, SavedPost.user_id == current_user.id).first() is not None

    resp = CommunityPostResponse.model_validate(post)
    if post.author:
        resp.author_name = post.author.full_name
        resp.author_role = post.author.role
        if post.author.location:
            resp.author_village = post.author.location.village
            resp.author_taluk = post.author.location.taluk
    if post.crop:
        resp.crop_name_en = post.crop.name_en
        resp.crop_name_kn = post.crop.name_kn
    
    resp.is_liked = is_liked
    resp.is_saved = is_saved
    return resp


@router.put("/posts/{post_id}", response_model=CommunityPostResponse, summary="Update an existing community post")
def update_community_post(
    post_id: int,
    payload: CommunityPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify another user's post."
        )

    if payload.title is not None: post.title = payload.title
    if payload.content is not None: post.content = payload.content
    if payload.topic is not None: post.topic = payload.topic
    if payload.crop_id is not None: post.crop_id = payload.crop_id
    if payload.image_url is not None: post.image_url = payload.image_url

    db.commit()
    db.refresh(post)

    resp = CommunityPostResponse.model_validate(post)
    resp.author_name = post.author.full_name if post.author else current_user.full_name
    return resp


@router.delete("/posts/{post_id}", summary="Delete community post")
def delete_community_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete another user's post."
        )

    db.delete(post)
    db.commit()
    return {"status": "success", "message": "Post deleted successfully"}


@router.post("/posts/{post_id}/like", summary="Toggle like on a discussion post")
def toggle_post_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    existing = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"is_liked": False, "likes_count": post.likes_count}
    else:
        new_like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes_count += 1
        db.commit()
        return {"is_liked": True, "likes_count": post.likes_count}


@router.post("/posts/{post_id}/save", summary="Toggle bookmark / save post")
def toggle_post_save(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    existing = db.query(SavedPost).filter(SavedPost.post_id == post_id, SavedPost.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"is_saved": False, "message": "Post removed from saved bookmarks"}
    else:
        new_save = SavedPost(post_id=post_id, user_id=current_user.id)
        db.add(new_save)
        db.commit()
        return {"is_saved": True, "message": "Post saved to your bookmarks"}


@router.post("/posts/{post_id}/report", response_model=ContentReportResponse, summary="Report inappropriate discussion content")
def report_post(
    post_id: int,
    payload: ContentReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    report = ContentReport(
        user_id=current_user.id,
        post_id=post_id,
        comment_id=payload.comment_id,
        reason=payload.reason,
        details=payload.details,
        status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


# ----------------------------------------------------------------------
# 2. COMMENTS & REPLIES
# ----------------------------------------------------------------------

@router.get("/posts/{post_id}/comments", response_model=List[PostCommentResponse], summary="List comments for a post")
def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    comments = db.query(PostComment).filter(PostComment.post_id == post_id).order_by(PostComment.created_at.asc()).all()
    result = []
    for c in comments:
        resp = PostCommentResponse.model_validate(c)
        if c.author:
            resp.author_name = c.author.full_name
            if c.author.location:
                resp.author_village = c.author.location.village
        result.append(resp)
    return result


@router.post("/posts/{post_id}/comments", response_model=PostCommentResponse, summary="Add a comment or reply to a post")
def create_post_comment(
    post_id: int,
    payload: PostCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    comment = PostComment(
        post_id=post_id,
        author_id=current_user.id,
        parent_id=payload.parent_id,
        content=payload.content
    )
    db.add(comment)
    post.comments_count += 1
    db.commit()
    db.refresh(comment)

    resp = PostCommentResponse.model_validate(comment)
    resp.author_name = current_user.full_name
    if current_user.location:
        resp.author_village = current_user.location.village
    return resp


@router.delete("/comments/{comment_id}", summary="Delete comment with ownership check")
def delete_post_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(PostComment).filter(PostComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")

    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete another user's comment."
        )

    post = db.query(CommunityPost).filter(CommunityPost.id == comment.post_id).first()
    if post and post.comments_count > 0:
        post.comments_count -= 1

    db.delete(comment)
    db.commit()
    return {"status": "success", "message": "Comment deleted successfully"}


# ----------------------------------------------------------------------
# 3. VILLAGE-BASED FARMER GROUPS
# ----------------------------------------------------------------------

@router.get("/groups", response_model=List[CommunityGroupResponse], summary="Discover village-based farmer groups")
def get_community_groups(
    taluk: Optional[str] = Query(None, description="Filter by taluk"),
    village: Optional[str] = Query(None, description="Filter by village"),
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    search: Optional[str] = Query(None, description="Search group name or description"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if isinstance(taluk, Session):
        db = taluk
        taluk = None
    if not isinstance(current_user, User):
        current_user = None
    if not isinstance(taluk, str): taluk = None
    if not isinstance(village, str): village = None
    if not isinstance(crop_id, int): crop_id = None
    if not isinstance(search, str): search = None

    query = db.query(CommunityGroup)
    if taluk:
        query = query.filter(CommunityGroup.taluk.ilike(f"%{taluk}%"))
    if village:
        query = query.filter(CommunityGroup.village.ilike(f"%{village}%"))
    if crop_id:
        query = query.filter(CommunityGroup.crop_id == crop_id)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                CommunityGroup.name_en.ilike(s),
                CommunityGroup.name_kn.ilike(s),
                CommunityGroup.description_en.ilike(s),
                CommunityGroup.description_kn.ilike(s)
            )
        )

    groups = query.order_by(CommunityGroup.created_at.desc()).all()

    # Pre-fetch membership status for authenticated user
    user_memberships = {}
    if current_user:
        for m in db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all():
            user_memberships[m.group_id] = m.status

    result = []
    for g in groups:
        resp = CommunityGroupResponse.model_validate(g)
        if g.crop:
            resp.crop_name_en = g.crop.name_en
            resp.crop_name_kn = g.crop.name_kn
        resp.membership_status = user_memberships.get(g.id, None)
        result.append(resp)

    return result


@router.post("/groups", response_model=CommunityGroupResponse, summary="Create a new village farmer group")
def create_community_group(
    payload: CommunityGroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = CommunityGroup(
        name_en=payload.name_en,
        name_kn=payload.name_kn,
        taluk=payload.taluk,
        village=payload.village,
        district=payload.district or "Mandya",
        crop_id=payload.crop_id,
        description_en=payload.description_en,
        description_kn=payload.description_kn,
        rules_en=payload.rules_en,
        rules_kn=payload.rules_kn,
        image_url=payload.image_url,
        creator_id=current_user.id,
        member_count=1
    )
    db.add(group)
    db.commit()
    db.refresh(group)

    # Automatically enroll creator as group admin
    creator_member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        role="admin",
        status="approved"
    )
    db.add(creator_member)
    db.commit()

    resp = CommunityGroupResponse.model_validate(group)
    resp.membership_status = "approved"
    return resp


@router.get("/groups/{group_id}", response_model=CommunityGroupResponse, summary="Get group detail")
def get_community_group_detail(
    group_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    membership_status = None
    if current_user:
        member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id
        ).first()
        if member:
            membership_status = member.status

    resp = CommunityGroupResponse.model_validate(group)
    if group.crop:
        resp.crop_name_en = group.crop.name_en
        resp.crop_name_kn = group.crop.name_kn
    resp.membership_status = membership_status
    return resp


@router.post("/groups/{group_id}/join", summary="Request to join a village group")
def join_community_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    existing = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first()
    if existing:
        if existing.status == "approved":
            return {"status": "approved", "message": "You are already a member of this group."}
        elif existing.status == "pending":
            return {"status": "pending", "message": "Your join request is pending moderator approval."}

    join_req = GroupMember(
        group_id=group_id,
        user_id=current_user.id,
        role="member",
        status="pending"
    )
    db.add(join_req)
    db.commit()
    return {"status": "pending", "message": "Join request submitted. A group administrator will review your request."}


@router.get("/groups/{group_id}/requests", response_model=List[GroupMemberResponse], summary="List pending join requests for a group")
def get_group_join_requests(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    # Check permission: admin, creator, or platform admin
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
        GroupMember.role == "admin"
    ).first()
    if not member and group.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only group administrators can view join requests.")

    requests = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.status == "pending").all()
    result = []
    for r in requests:
        resp = GroupMemberResponse.model_validate(r)
        if r.user:
            resp.user_name = r.user.full_name
            resp.user_phone = r.user.phone_number
            if r.user.location:
                resp.user_village = r.user.location.village
        result.append(resp)
    return result


@router.post("/groups/{group_id}/requests/{request_id}/approve", response_model=GroupMemberResponse, summary="Approve a member join request")
def approve_join_request(
    group_id: int,
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
        GroupMember.role == "admin"
    ).first()
    if not member and group.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only group administrators can approve members.")

    req = db.query(GroupMember).filter(GroupMember.id == request_id, GroupMember.group_id == group_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Join request not found.")

    req.status = "approved"
    group.member_count += 1

    db.commit()
    db.refresh(req)

    resp = GroupMemberResponse.model_validate(req)
    if req.user:
        resp.user_name = req.user.full_name
        resp.user_phone = req.user.phone_number
        if req.user.location:
            resp.user_village = req.user.location.village
    return resp


@router.post("/groups/{group_id}/requests/{request_id}/reject", response_model=GroupMemberResponse, summary="Reject a member join request")
def reject_join_request(
    group_id: int,
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
        GroupMember.role == "admin"
    ).first()
    if not member and group.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only group administrators can reject members.")

    req = db.query(GroupMember).filter(GroupMember.id == request_id, GroupMember.group_id == group_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Join request not found.")

    req.status = "rejected"
    db.commit()
    db.refresh(req)

    resp = GroupMemberResponse.model_validate(req)
    if req.user:
        resp.user_name = req.user.full_name
    return resp


@router.get("/groups/{group_id}/members", response_model=List[GroupMemberResponse], summary="List approved group members")
def get_group_members(group_id: int, db: Session = Depends(get_db)):
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    members = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.status == "approved").all()
    result = []
    for m in members:
        resp = GroupMemberResponse.model_validate(m)
        if m.user:
            resp.user_name = m.user.full_name
            resp.user_phone = m.user.phone_number
            if m.user.location:
                resp.user_village = m.user.location.village
        result.append(resp)
    return result


@router.delete("/groups/{group_id}/members/{user_id}", summary="Remove member from group or leave group")
def remove_group_member(
    group_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    # A user can leave themselves, or a group admin/platform admin can remove them
    is_self = current_user.id == user_id
    is_admin = current_user.is_admin
    is_group_admin = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
        GroupMember.role == "admin"
    ).first() is not None or group.creator_id == current_user.id

    if not (is_self or is_admin or is_group_admin):
        raise HTTPException(status_code=403, detail="Not authorized to remove this member.")

    member = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in this group.")

    db.delete(member)
    if group.member_count > 0:
        group.member_count -= 1
    db.commit()
    return {"status": "success", "message": "Member removed successfully"}


@router.put("/groups/{group_id}/members/{user_id}/role", response_model=GroupMemberResponse, summary="Update member role in group (Admin only)")
def update_group_member_role(
    group_id: int,
    user_id: int,
    payload: GroupMemberRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    is_group_admin = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
        GroupMember.role == "admin"
    ).first() is not None or group.creator_id == current_user.id

    if not (current_user.is_admin or is_group_admin):
        raise HTTPException(status_code=403, detail="Only group or platform administrators can update member roles.")

    if payload.role not in ["admin", "moderator", "member"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin', 'moderator', or 'member'.")

    member = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in this group.")

    member.role = payload.role
    db.commit()
    db.refresh(member)

    resp = GroupMemberResponse.model_validate(member)
    if member.user:
        resp.user_name = member.user.full_name
        resp.user_phone = member.user.phone_number
        if member.user.location:
            resp.user_village = member.user.location.village
    return resp


# ----------------------------------------------------------------------
# 4. GROUP ANNOUNCEMENTS
# ----------------------------------------------------------------------

@router.get("/groups/{group_id}/announcements", response_model=List[GroupAnnouncementResponse], summary="List announcements for a group")
def get_group_announcements(group_id: int, db: Session = Depends(get_db)):
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    announcements = db.query(GroupAnnouncement).filter(GroupAnnouncement.group_id == group_id).order_by(GroupAnnouncement.created_at.desc()).all()
    result = []
    for a in announcements:
        resp = GroupAnnouncementResponse.model_validate(a)
        if a.author:
            resp.author_name = a.author.full_name
        result.append(resp)
    return result


@router.post("/groups/{group_id}/announcements", response_model=GroupAnnouncementResponse, summary="Publish announcement in group (Admin/Moderator)")
def create_group_announcement(
    group_id: int,
    payload: GroupAnnouncementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
        GroupMember.role.in_(["admin", "moderator"])
    ).first()
    if not member and group.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only group administrators or moderators can publish announcements.")

    announcement = GroupAnnouncement(
        group_id=group_id,
        author_id=current_user.id,
        title=payload.title,
        content=payload.content,
        priority=payload.priority
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    resp = GroupAnnouncementResponse.model_validate(announcement)
    resp.author_name = current_user.full_name
    return resp
