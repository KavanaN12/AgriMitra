"""F4 Marketplace, Listings, Saved Listings, Collective Produce, and Enquiry Threads

Revision ID: 003_f4_marketplace
Revises: 002_f3_community
Create Date: 2026-11-22 21:05:00

"""
from alembic import op
import sqlalchemy as sa

revision = '003_f4_marketplace'
down_revision = '002_f3_community'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Update market_listings table
    with op.batch_alter_table('market_listings', schema=None) as batch_op:
        batch_op.add_column(sa.Column('group_id', sa.Integer(), sa.ForeignKey('community_groups.id', name='fk_market_listings_group_id'), nullable=True))
        batch_op.add_column(sa.Column('harvest_date', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('available_from', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('available_until', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('village', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('taluk', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('district', sa.String(length=100), server_default='Mandya', nullable=False))
        batch_op.add_column(sa.Column('pickup_address', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('image_url', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('is_collective', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False))

    # 2. Update market_enquiries table
    with op.batch_alter_table('market_enquiries', schema=None) as batch_op:
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False))

    # 3. Create saved_listings table
    op.create_table(
        'saved_listings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('listing_id', sa.Integer(), sa.ForeignKey('market_listings.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 4. Create group_listing_contributions table
    op.create_table(
        'group_listing_contributions',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('listing_id', sa.Integer(), sa.ForeignKey('market_listings.id'), nullable=False),
        sa.Column('farmer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('farmer_name', sa.String(length=150), nullable=True),
        sa.Column('farmer_phone', sa.String(length=20), nullable=True),
        sa.Column('farmer_village', sa.String(length=100), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=20), server_default='quintal', nullable=False),
        sa.Column('notes', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 5. Create enquiry_messages table
    op.create_table(
        'enquiry_messages',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('enquiry_id', sa.Integer(), sa.ForeignKey('market_enquiries.id'), nullable=False),
        sa.Column('sender_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('proposed_price', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )


def downgrade() -> None:
    op.drop_table('enquiry_messages')
    op.drop_table('group_listing_contributions')
    op.drop_table('saved_listings')
    with op.batch_alter_table('market_enquiries', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
    with op.batch_alter_table('market_listings', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('is_collective')
        batch_op.drop_column('image_url')
        batch_op.drop_column('pickup_address')
        batch_op.drop_column('district')
        batch_op.drop_column('taluk')
        batch_op.drop_column('village')
        batch_op.drop_column('available_until')
        batch_op.drop_column('available_from')
        batch_op.drop_column('harvest_date')
        batch_op.drop_column('group_id')
