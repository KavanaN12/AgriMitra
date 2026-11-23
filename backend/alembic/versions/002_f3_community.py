"""F3 Community Forums, Village Groups, Announcements, Comments, Likes, and Moderation

Revision ID: 002_f3_community
Revises: 001_f2_crop_advisory
Create Date: 2026-11-22 19:50:00

"""
from alembic import op
import sqlalchemy as sa

revision = '002_f3_community'
down_revision = '001_f2_crop_advisory'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Update community_groups table
    with op.batch_alter_table('community_groups', schema=None) as batch_op:
        batch_op.add_column(sa.Column('village', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('district', sa.String(length=100), server_default='Mandya', nullable=False))
        batch_op.add_column(sa.Column('crop_id', sa.Integer(), sa.ForeignKey('crops.id', name='fk_community_groups_crop_id'), nullable=True))
        batch_op.add_column(sa.Column('creator_id', sa.Integer(), sa.ForeignKey('users.id', name='fk_community_groups_creator_id'), nullable=True))
        batch_op.add_column(sa.Column('rules_en', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('rules_kn', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('image_url', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('member_count', sa.Integer(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False))

    # 2. Update community_posts table
    with op.batch_alter_table('community_posts', schema=None) as batch_op:
        batch_op.alter_column('group_id', existing_type=sa.Integer(), nullable=True)
        batch_op.add_column(sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id', name='fk_community_posts_location_id'), nullable=True))
        batch_op.add_column(sa.Column('image_url', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('topic', sa.String(length=50), server_default='general', nullable=False))
        batch_op.add_column(sa.Column('comments_count', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('is_pinned', sa.Boolean(), server_default='0', nullable=False))

    # 3. Create group_members table
    op.create_table(
        'group_members',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('group_id', sa.Integer(), sa.ForeignKey('community_groups.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role', sa.String(length=20), server_default='member', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='approved', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 4. Create group_announcements table
    op.create_table(
        'group_announcements',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('group_id', sa.Integer(), sa.ForeignKey('community_groups.id'), nullable=False),
        sa.Column('author_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(length=20), server_default='normal', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 5. Create post_comments table
    op.create_table(
        'post_comments',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('community_posts.id'), nullable=False),
        sa.Column('author_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('parent_id', sa.Integer(), sa.ForeignKey('post_comments.id'), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('likes_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 6. Create post_likes table
    op.create_table(
        'post_likes',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('community_posts.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 7. Create saved_posts table
    op.create_table(
        'saved_posts',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('community_posts.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 8. Create content_reports table
    op.create_table(
        'content_reports',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('community_posts.id'), nullable=True),
        sa.Column('comment_id', sa.Integer(), sa.ForeignKey('post_comments.id'), nullable=True),
        sa.Column('reason', sa.String(length=100), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

def downgrade() -> None:
    op.drop_table('content_reports')
    op.drop_table('saved_posts')
    op.drop_table('post_likes')
    op.drop_table('post_comments')
    op.drop_table('group_announcements')
    op.drop_table('group_members')
    
    with op.batch_alter_table('community_posts', schema=None) as batch_op:
        batch_op.drop_column('is_pinned')
        batch_op.drop_column('comments_count')
        batch_op.drop_column('topic')
        batch_op.drop_column('image_url')
        batch_op.drop_column('location_id')
        
    with op.batch_alter_table('community_groups', schema=None) as batch_op:
        batch_op.drop_column('created_at')
        batch_op.drop_column('member_count')
        batch_op.drop_column('image_url')
        batch_op.drop_column('rules_kn')
        batch_op.drop_column('rules_en')
        batch_op.drop_column('creator_id')
        batch_op.drop_column('crop_id')
        batch_op.drop_column('district')
        batch_op.drop_column('village')
