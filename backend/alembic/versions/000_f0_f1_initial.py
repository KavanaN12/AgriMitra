"""F0 and F1 Initial Schema: Locations, Users, Crops, Weather, Advisories, Groups, Posts

Revision ID: 000_f0_f1_initial
Revises: 
Create Date: 2026-11-22 17:00:00

"""
from alembic import op
import sqlalchemy as sa

revision = '000_f0_f1_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Locations
    op.create_table(
        'locations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('state', sa.String(length=100), server_default='Karnataka', nullable=False),
        sa.Column('district', sa.String(length=100), server_default='Mandya', nullable=False),
        sa.Column('taluk', sa.String(length=100), nullable=False),
        sa.Column('hobli', sa.String(length=100), nullable=True),
        sa.Column('village', sa.String(length=100), nullable=False),
        sa.Column('pincode', sa.String(length=10), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True)
    )

    # 2. Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('phone_number', sa.String(length=20), unique=True, index=True, nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('preferred_language', sa.String(length=5), server_default='kn', nullable=False),
        sa.Column('role', sa.String(length=20), server_default='farmer', nullable=False),
        sa.Column('roles', sa.String(length=50), server_default='farmer', nullable=False),
        sa.Column('active_role', sa.String(length=20), server_default='farmer', nullable=False),
        sa.Column('is_onboarded', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('onboarding_step', sa.Integer(), server_default='1', nullable=False),
        sa.Column('farm_size_acres', sa.Float(), nullable=True),
        sa.Column('farming_type', sa.String(length=50), nullable=True),
        sa.Column('irrigation_source', sa.String(length=50), nullable=True),
        sa.Column('profile_photo_url', sa.String(length=255), nullable=True),
        sa.Column('buyer_business_name', sa.String(length=150), nullable=True),
        sa.Column('buyer_type', sa.String(length=50), nullable=True),
        sa.Column('buyer_license_no', sa.String(length=100), nullable=True),
        sa.Column('interested_crops', sa.Text(), nullable=True),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 3. Crops
    op.create_table(
        'crops',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('code', sa.String(length=50), unique=True, index=True, nullable=False),
        sa.Column('name_en', sa.String(length=100), nullable=False),
        sa.Column('name_kn', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('seasonality', sa.String(length=100), nullable=True),
        sa.Column('typical_duration_days', sa.Integer(), nullable=True)
    )

    # 4. User Crops
    op.create_table(
        'user_crops',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('crop_id', sa.Integer(), sa.ForeignKey('crops.id'), nullable=False),
        sa.Column('acreage', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('sowing_date', sa.DateTime(), nullable=True),
        sa.Column('stage', sa.String(length=50), server_default='vegetative', nullable=False)
    )

    # 5. Weather Records
    op.create_table(
        'weather_records',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=False),
        sa.Column('temperature_c', sa.Float(), nullable=False),
        sa.Column('humidity_percent', sa.Float(), nullable=False),
        sa.Column('rainfall_mm', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('wind_speed_kmh', sa.Float(), nullable=True),
        sa.Column('forecast_summary_en', sa.String(length=255), nullable=True),
        sa.Column('forecast_summary_kn', sa.String(length=255), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 6. Advisories
    op.create_table(
        'advisories',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('crop_id', sa.Integer(), sa.ForeignKey('crops.id'), nullable=True),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('severity', sa.String(length=20), server_default='info', nullable=False),
        sa.Column('title_en', sa.String(length=200), nullable=False),
        sa.Column('title_kn', sa.String(length=200), nullable=False),
        sa.Column('message_en', sa.Text(), nullable=False),
        sa.Column('message_kn', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), server_default='general', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 7. Notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title_en', sa.String(length=200), nullable=False),
        sa.Column('title_kn', sa.String(length=200), nullable=False),
        sa.Column('message_en', sa.Text(), nullable=False),
        sa.Column('message_kn', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=50), server_default='advisory', nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 8. Community Groups (Initial)
    op.create_table(
        'community_groups',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name_en', sa.String(length=150), nullable=False),
        sa.Column('name_kn', sa.String(length=150), nullable=False),
        sa.Column('taluk', sa.String(length=100), nullable=False),
        sa.Column('description_en', sa.Text(), nullable=True),
        sa.Column('description_kn', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False)
    )

    # 9. Community Posts (Initial)
    op.create_table(
        'community_posts',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('group_id', sa.Integer(), sa.ForeignKey('community_groups.id'), nullable=True),
        sa.Column('author_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('crop_id', sa.Integer(), sa.ForeignKey('crops.id'), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=5), server_default='kn', nullable=False),
        sa.Column('likes_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 10. Market Listings (Initial)
    op.create_table(
        'market_listings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('farmer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('crop_id', sa.Integer(), sa.ForeignKey('crops.id'), nullable=False),
        sa.Column('variety', sa.String(length=100), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=20), server_default='quintal', nullable=False),
        sa.Column('price_per_unit', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='active', nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

    # 11. Market Enquiries (Initial)
    op.create_table(
        'market_enquiries',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('listing_id', sa.Integer(), sa.ForeignKey('market_listings.id'), nullable=False),
        sa.Column('buyer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('quantity_requested', sa.Float(), nullable=False),
        sa.Column('offered_price', sa.Float(), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

def downgrade() -> None:
    op.drop_table('market_enquiries')
    op.drop_table('market_listings')
    op.drop_table('community_posts')
    op.drop_table('community_groups')
    op.drop_table('notifications')
    op.drop_table('advisories')
    op.drop_table('weather_records')
    op.drop_table('user_crops')
    op.drop_table('crops')
    op.drop_table('users')
    op.drop_table('locations')
