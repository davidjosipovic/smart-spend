"""add ml results

Revision ID: add_ml_results
Revises: db92b04e8ed5
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = 'add_ml_results'
down_revision = 'db92b04e8ed5'  # Latest migration
branch_labels = None
depends_on = None

def upgrade():
    # Add category column to transactions table
    op.add_column('transaction', sa.Column('category', sa.String(), nullable=True))
    
    # Create spending_predictions table
    op.create_table(
        'spending_predictions',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('prediction_date', sa.Date(), nullable=False),
        sa.Column('target_period_start', sa.Date(), nullable=False),
        sa.Column('target_period_end', sa.Date(), nullable=False),
        sa.Column('predicted_amount', sa.Float(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(
        'ix_transaction_category',
        'transaction',
        ['category']
    )
    op.create_index(
        'ix_spending_predictions_user_id',
        'spending_predictions',
        ['user_id']
    )
    op.create_index(
        'ix_spending_predictions_prediction_date',
        'spending_predictions',
        ['prediction_date']
    )

def downgrade():
    # Drop indexes
    op.drop_index('ix_spending_predictions_prediction_date')
    op.drop_index('ix_spending_predictions_user_id')
    op.drop_index('ix_transaction_category')
    
    # Drop category column from transactions
    op.drop_column('transaction', 'category')
    
    # Drop spending_predictions table
    op.drop_table('spending_predictions') 