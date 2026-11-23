"""Real Multi-User Authentication and Credential Security

Revision ID: 005_real_auth_multiuser
Revises: 004_f5_shared_admin
Create Date: 2026-11-23 01:05:00

"""
from alembic import op
import sqlalchemy as sa

revision = '005_real_auth_multiuser'
down_revision = '004_f5_shared_admin'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Add reset_token and reset_token_expires_at to users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('reset_token', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('reset_token_expires_at', sa.DateTime(), nullable=True))

    # 2. Create unique index on users(email) and index on users(reset_token)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_reset_token', 'users', ['reset_token'], unique=False)

    # 3. Upgrade existing seeded demonstration accounts with secure bcrypt password hashes
    op.execute(
        "UPDATE users SET password_hash = '$2b$12$649atpzB3yf6aSj0mRdrPejRbR3LdseWAVN4QnP2lKI8ZLRCZlkbu' "
        "WHERE is_admin = true OR email = 'admin@agrimitra.gov.in';"
    )
    op.execute(
        "UPDATE users SET password_hash = '$2b$12$FI5thEDGKWg2/L9GVP3fguPB99PdxrpuLPDfH8hEsB.pPJoVedK/W' "
        "WHERE (password_hash IS NULL OR password_hash LIKE 'mock_%') AND (is_admin = false AND email != 'admin@agrimitra.gov.in');"
    )

def downgrade() -> None:
    op.drop_index('ix_users_reset_token', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('reset_token_expires_at')
        batch_op.drop_column('reset_token')
