"""
Safe Cleanup Script for Seeded Demonstration Personas
Removes ONLY demo personas (Users 1, 2, 3, 5, 6) and their dependent records.
PRESERVES:
- Database schema and all Alembic migrations
- Platform Administrator (User 4: Mandya Krishi Admin)
- All Genuine Registered User accounts (User 7: Ananya Rao, User 8: Arjun Traders, User 9: Kavya Gowda, and any newly registered users)
- Locations hierarchy and Crops catalogue
"""
import sys
from app.core.database import SessionLocal
from app.models.models import (
    User, UserCrop, CommunityPost, PostComment, PostLike, SavedPost,
    CommunityGroup, GroupMember, GroupAnnouncement, MarketListing, SavedListing,
    GroupListingContribution, MarketEnquiry, EnquiryMessage, Notification,
    UserNotificationPreference, SupportTicket, ContentReport
)

DEMO_USER_IDS = [1, 2, 3, 5, 6]

def preview_cleanup():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.id.in_(DEMO_USER_IDS)).all()
        print(f"Identified {len(users)} demonstration users:")
        for u in users:
            print(f"  - ID {u.id}: {u.full_name} ({u.email}, {u.phone_number}, role={u.role})")
        
        post_ids = [p.id for p in db.query(CommunityPost.id).filter(CommunityPost.author_id.in_(DEMO_USER_IDS)).all()]
        listing_ids = [l.id for l in db.query(MarketListing.id).filter(MarketListing.farmer_id.in_(DEMO_USER_IDS)).all()]
        enquiry_ids = [e.id for e in db.query(MarketEnquiry.id).filter(
            (MarketEnquiry.buyer_id.in_(DEMO_USER_IDS)) | (MarketEnquiry.listing_id.in_(listing_ids))
        ).all()]
        
        print("\nDependent records identified for removal:")
        print(f"  - user_crops: {db.query(UserCrop).filter(UserCrop.user_id.in_(DEMO_USER_IDS)).count()}")
        print(f"  - community_posts: {len(post_ids)}")
        print(f"  - post_comments: {db.query(PostComment).filter((PostComment.author_id.in_(DEMO_USER_IDS)) | (PostComment.post_id.in_(post_ids))).count()}")
        print(f"  - post_likes: {db.query(PostLike).filter((PostLike.user_id.in_(DEMO_USER_IDS)) | (PostLike.post_id.in_(post_ids))).count()}")
        print(f"  - saved_posts: {db.query(SavedPost).filter((SavedPost.user_id.in_(DEMO_USER_IDS)) | (SavedPost.post_id.in_(post_ids))).count()}")
        print(f"  - market_listings: {len(listing_ids)}")
        print(f"  - saved_listings: {db.query(SavedListing).filter((SavedListing.user_id.in_(DEMO_USER_IDS)) | (SavedListing.listing_id.in_(listing_ids))).count()}")
        print(f"  - market_enquiries: {len(enquiry_ids)}")
        print(f"  - enquiry_messages: {db.query(EnquiryMessage).filter((EnquiryMessage.sender_id.in_(DEMO_USER_IDS)) | (EnquiryMessage.enquiry_id.in_(enquiry_ids))).count()}")
        print(f"  - notifications: {db.query(Notification).filter(Notification.user_id.in_(DEMO_USER_IDS)).count()}")
        print(f"  - support_tickets: {db.query(SupportTicket).filter(SupportTicket.user_id.in_(DEMO_USER_IDS)).count()}")
        print(f"  - user_notification_preferences: {db.query(UserNotificationPreference).filter(UserNotificationPreference.user_id.in_(DEMO_USER_IDS)).count()}")
        print(f"  - group_members: {db.query(GroupMember).filter(GroupMember.user_id.in_(DEMO_USER_IDS)).count()}")
        print(f"  - group_announcements: {db.query(GroupAnnouncement).filter(GroupAnnouncement.author_id.in_(DEMO_USER_IDS)).count()}")
        print(f"  - community_groups to be reassigned to Admin (User 4): {db.query(CommunityGroup).filter(CommunityGroup.creator_id.in_(DEMO_USER_IDS)).count()}")
    finally:
        db.close()

def execute_cleanup():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.id.in_(DEMO_USER_IDS)).all()
        post_ids = [p.id for p in db.query(CommunityPost.id).filter(CommunityPost.author_id.in_(DEMO_USER_IDS)).all()]
        listing_ids = [l.id for l in db.query(MarketListing.id).filter(MarketListing.farmer_id.in_(DEMO_USER_IDS)).all()]
        enquiry_ids = [e.id for e in db.query(MarketEnquiry.id).filter(
            (MarketEnquiry.buyer_id.in_(DEMO_USER_IDS)) | (MarketEnquiry.listing_id.in_(listing_ids))
        ).all()]

        # 1. Enquiry messages & enquiries
        db.query(EnquiryMessage).filter((EnquiryMessage.sender_id.in_(DEMO_USER_IDS)) | (EnquiryMessage.enquiry_id.in_(enquiry_ids))).delete(synchronize_session=False)
        db.query(MarketEnquiry).filter(MarketEnquiry.id.in_(enquiry_ids)).delete(synchronize_session=False)

        # 2. Listing contributions & saved listings & market listings
        db.query(GroupListingContribution).filter(GroupListingContribution.listing_id.in_(listing_ids)).delete(synchronize_session=False)
        db.query(SavedListing).filter((SavedListing.user_id.in_(DEMO_USER_IDS)) | (SavedListing.listing_id.in_(listing_ids))).delete(synchronize_session=False)
        db.query(MarketListing).filter(MarketListing.id.in_(listing_ids)).delete(synchronize_session=False)

        # 3. Community posts, comments, likes, saves
        db.query(PostComment).filter((PostComment.author_id.in_(DEMO_USER_IDS)) | (PostComment.post_id.in_(post_ids))).delete(synchronize_session=False)
        db.query(PostLike).filter((PostLike.user_id.in_(DEMO_USER_IDS)) | (PostLike.post_id.in_(post_ids))).delete(synchronize_session=False)
        db.query(SavedPost).filter((SavedPost.user_id.in_(DEMO_USER_IDS)) | (SavedPost.post_id.in_(post_ids))).delete(synchronize_session=False)
        db.query(ContentReport).filter((ContentReport.user_id.in_(DEMO_USER_IDS)) | (ContentReport.post_id.in_(post_ids))).delete(synchronize_session=False)
        db.query(CommunityPost).filter(CommunityPost.id.in_(post_ids)).delete(synchronize_session=False)

        # 4. Group memberships & announcements & community groups preservation under Admin
        ann_count = db.query(GroupAnnouncement).filter(GroupAnnouncement.author_id.in_(DEMO_USER_IDS)).delete(synchronize_session=False)
        mem_count = db.query(GroupMember).filter(GroupMember.user_id.in_(DEMO_USER_IDS)).delete(synchronize_session=False)
        # Reassign community groups created by demo personas to Administrator (User 4: Mandya Krishi Admin)
        reassigned_groups = db.query(CommunityGroup).filter(CommunityGroup.creator_id.in_(DEMO_USER_IDS)).update(
            {CommunityGroup.creator_id: 4}, synchronize_session=False
        )
        # Ensure Admin is recorded as approved admin member of each group
        for grp in db.query(CommunityGroup).all():
            existing = db.query(GroupMember).filter(GroupMember.group_id == grp.id, GroupMember.user_id == 4).first()
            if not existing:
                db.add(GroupMember(group_id=grp.id, user_id=4, role="admin", status="approved"))

        # 5. User crops, tickets, notifications, preferences
        db.query(UserCrop).filter(UserCrop.user_id.in_(DEMO_USER_IDS)).delete(synchronize_session=False)
        db.query(SupportTicket).filter(SupportTicket.user_id.in_(DEMO_USER_IDS)).delete(synchronize_session=False)
        db.query(Notification).filter(Notification.user_id.in_(DEMO_USER_IDS)).delete(synchronize_session=False)
        db.query(UserNotificationPreference).filter(UserNotificationPreference.user_id.in_(DEMO_USER_IDS)).delete(synchronize_session=False)

        # 6. Delete the demo users
        deleted_count = db.query(User).filter(User.id.in_(DEMO_USER_IDS)).delete(synchronize_session=False)
        db.commit()
        print(f"Cleanup successfully executed: {deleted_count} demonstration user accounts and all related records removed.")
    except Exception as e:
        db.rollback()
        print(f"Cleanup failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--execute":
        execute_cleanup()
    else:
        preview_cleanup()
