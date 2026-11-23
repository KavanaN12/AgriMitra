"""F5 Shared Features, Notifications, User Settings, and Platform Administration

Revision ID: 004_f5_shared_admin
Revises: 003_f4_marketplace
Create Date: 2026-11-22 21:51:00

"""
from alembic import op
import sqlalchemy as sa

revision = '004_f5_shared_admin'
down_revision = '003_f4_marketplace'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Update users table with F5 profile & admin attributes
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_admin', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('is_verified', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('is_expert', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('bio', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('email', sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column('text_size', sa.String(length=20), server_default='normal', nullable=False))
        batch_op.add_column(sa.Column('data_saver', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('phone_visible', sa.Boolean(), server_default='1', nullable=False))

    # 2. Update notifications table with deep link navigation targets
    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.add_column(sa.Column('related_entity_type', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('related_entity_id', sa.Integer(), nullable=True))

    # 3. Create user_notification_preferences table
    op.create_table(
        'user_notification_preferences',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), unique=True, nullable=False),
        sa.Column('advisory_alerts', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('community_updates', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('market_enquiries', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('system_announcements', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False)
    )

    # 4. Create support_tickets table
    op.create_table(
        'support_tickets',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('category', sa.String(length=50), server_default='general', nullable=False),
        sa.Column('subject', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='open', nullable=False),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False)
    )

    # 5. Create moderation_audit_logs table
    op.create_table(
        'moderation_audit_logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('admin_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('target_type', sa.String(length=50), nullable=False),
        sa.Column('target_id', sa.Integer(), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )


def downgrade() -> None:
    op.drop_table('moderation_audit_logs')
    op.drop_table('support_tickets')
    op.drop_table('user_notification_preferences')
    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.drop_column('related_entity_id')
        batch_op.drop_column('related_entity_type')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('phone_visible')
        batch_op.drop_column('data_saver')
        batch_op.drop_column('text_size')
        batch_op.drop_column('email')
        batch_op.drop_column('bio')
        batch_op.drop_column('is_expert')
        batch_op.drop_column('is_verified')
        batch_op.drop_column('is_admin')
