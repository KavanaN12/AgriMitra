"""F2 Crop Advisory and Weather columns

Revision ID: 001_f2_crop_advisory
Revises: 
Create Date: 2026-11-22 18:49:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_f2_crop_advisory'
down_revision = '000_f0_f1_initial'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Add columns to crops
    with op.batch_alter_table('crops', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description_en', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('description_kn', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('soil_requirements_en', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('soil_requirements_kn', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('water_requirements_en', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('water_requirements_kn', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('growth_stages_json', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('irrigation_guidance_en', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('irrigation_guidance_kn', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('pests_diseases_json', sa.Text(), nullable=True))

    # 2. Add columns to user_crops
    with op.batch_alter_table('user_crops', schema=None) as batch_op:
        batch_op.add_column(sa.Column('soil_type', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('irrigation_type', sa.String(length=50), nullable=True))

    # 3. Add columns to weather_records
    with op.batch_alter_table('weather_records', schema=None) as batch_op:
        batch_op.add_column(sa.Column('uv_index', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('precipitation_probability', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('source', sa.String(length=100), nullable=True))

    # 4. Add columns to advisories
    with op.batch_alter_table('advisories', schema=None) as batch_op:
        batch_op.add_column(sa.Column('action_items_en', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('action_items_kn', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('explanation_en', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('explanation_kn', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('source_reference', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('trigger_condition', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('is_personalized', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('valid_until', sa.DateTime(), nullable=True))

def downgrade() -> None:
    with op.batch_alter_table('advisories', schema=None) as batch_op:
        batch_op.drop_column('valid_until')
        batch_op.drop_column('is_personalized')
        batch_op.drop_column('trigger_condition')
        batch_op.drop_column('source_reference')
        batch_op.drop_column('explanation_kn')
        batch_op.drop_column('explanation_en')
        batch_op.drop_column('action_items_kn')
        batch_op.drop_column('action_items_en')

    with op.batch_alter_table('weather_records', schema=None) as batch_op:
        batch_op.drop_column('source')
        batch_op.drop_column('precipitation_probability')
        batch_op.drop_column('uv_index')

    with op.batch_alter_table('user_crops', schema=None) as batch_op:
        batch_op.drop_column('irrigation_type')
        batch_op.drop_column('soil_type')

    with op.batch_alter_table('crops', schema=None) as batch_op:
        batch_op.drop_column('pests_diseases_json')
        batch_op.drop_column('irrigation_guidance_kn')
        batch_op.drop_column('irrigation_guidance_en')
        batch_op.drop_column('growth_stages_json')
        batch_op.drop_column('water_requirements_kn')
        batch_op.drop_column('water_requirements_en')
        batch_op.drop_column('soil_requirements_kn')
        batch_op.drop_column('soil_requirements_en')
        batch_op.drop_column('description_kn')
        batch_op.drop_column('description_en')
