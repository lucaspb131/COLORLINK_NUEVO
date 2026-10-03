"""initial colorlink schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-26 18:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('email', sa.String(180), unique=True, nullable=False, index=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, default='Asesor_Comercial'),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('avatar_url', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )

    # Clients Table
    op.create_table(
        'clients',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tax_id', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('company_name', sa.String(200), nullable=False),
        sa.Column('contact_name', sa.String(150), nullable=False),
        sa.Column('email', sa.String(180), nullable=False),
        sa.Column('phone', sa.String(50), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('address', sa.String(255), nullable=True),
        sa.Column('industry_sector', sa.String(100), nullable=False),
        sa.Column('status', sa.String(50), default='Activo'),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )

    # Projects Table
    op.create_table(
        'projects',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('code', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('project_type', sa.String(50), nullable=False),
        sa.Column('priority', sa.String(50), default='Media'),
        sa.Column('budget_estimated', sa.Numeric(14, 2), default=0.0),
        sa.Column('status', sa.String(50), default='Borrador'),
        sa.Column('total_sqm', sa.Numeric(10, 2), default=0.0),
        sa.Column('deadline', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # Project Areas Table
    op.create_table(
        'project_areas',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('substrate', sa.String(100), nullable=False),
        sa.Column('sqm', sa.Numeric(10, 2), nullable=False),
        sa.Column('location', sa.String(50), default='Exterior'),
        sa.Column('height_meters', sa.Numeric(6, 2), default=0.0),
        sa.Column('initial_condition', sa.String(100), default='Nuevo sin pintar')
    )

    # Operational Conditions Table
    op.create_table(
        'operational_conditions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('humidity', sa.Numeric(5, 2), nullable=False),
        sa.Column('ambient_temp', sa.Numeric(5, 2), nullable=False),
        sa.Column('surface_temp', sa.Numeric(5, 2), nullable=False),
        sa.Column('corrosivity', sa.String(20), nullable=False),
        sa.Column('chemical_exposure', sa.JSON(), nullable=True),
        sa.Column('traffic_type', sa.String(50), default='Peatonal Ligero'),
        sa.Column('uv_exposure', sa.String(50), default='Alta Radiación Solar'),
        sa.Column('special_requirements', sa.Text(), nullable=True)
    )

    # Photographic Evidences Table
    op.create_table(
        'photographic_evidences',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('uploaded_by_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.Column('thumbnail_url', sa.Text(), nullable=True),
        sa.Column('caption', sa.String(255), nullable=False),
        sa.Column('anomaly_detected', sa.String(150), nullable=False),
        sa.Column('sha256_hash', sa.String(64), nullable=False),
        sa.Column('file_size_kb', sa.Integer(), default=0),
        sa.Column('status', sa.String(50), default='Verificada'),
        sa.Column('technical_notes', sa.Text(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False)
    )

    # Gemini Classifications Table
    op.create_table(
        'gemini_classifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('category', sa.String(150), nullable=False),
        sa.Column('coating_type', sa.String(150), nullable=False),
        sa.Column('confidence_score', sa.Numeric(5, 2), nullable=False),
        sa.Column('complexity', sa.String(50), nullable=False),
        sa.Column('recommended_system', sa.JSON(), nullable=False),
        sa.Column('detected_conditions', sa.JSON(), nullable=False),
        sa.Column('missing_data', sa.JSON(), nullable=True),
        sa.Column('observations', sa.Text(), nullable=False),
        sa.Column('estimated_yield_gallons', sa.Integer(), nullable=False),
        sa.Column('voc_compliance', sa.String(100), nullable=False),
        sa.Column('model_used', sa.String(50), default='gemini-3.8-flash'),
        sa.Column('classified_at', sa.DateTime(), nullable=False)
    )

    # Timeline Events Table
    op.create_table(
        'timeline_events',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('label', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('author_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('author_name', sa.String(150), nullable=True),
        sa.Column('author_role', sa.String(100), nullable=True),
        sa.Column('completed', sa.Boolean(), default=True),
        sa.Column('event_timestamp', sa.DateTime(), nullable=False)
    )

    # Inventory Table
    op.create_table(
        'inventory_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('sku', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('product_name', sa.String(180), nullable=False),
        sa.Column('family', sa.String(100), nullable=False),
        sa.Column('solids_volume_percent', sa.Numeric(5, 2), nullable=False),
        sa.Column('theoretical_yield_sqm_gal', sa.Numeric(6, 2), nullable=False),
        sa.Column('dry_to_touch_hours', sa.Numeric(4, 2), nullable=False),
        sa.Column('recoat_min_hours', sa.Numeric(4, 2), nullable=False),
        sa.Column('color_options', sa.JSON(), nullable=True),
        sa.Column('stock_gallons', sa.Integer(), default=0),
        sa.Column('unit_price_usd', sa.Numeric(10, 2), default=0.0),
        sa.Column('voc_g_l', sa.Numeric(6, 2), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )

def downgrade() -> None:
    op.drop_table('inventory_items')
    op.drop_table('timeline_events')
    op.drop_table('gemini_classifications')
    op.drop_table('photographic_evidences')
    op.drop_table('operational_conditions')
    op.drop_table('project_areas')
    op.drop_table('projects')
    op.drop_table('clients')
    op.drop_table('users')
