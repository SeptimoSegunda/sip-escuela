"""Add fecha_devolucion, turno, id_copia to prestamo

Revision ID: 2_add_prestamo_campos
Revises: c42b265544a3
Create Date: 2026-10-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2_add_prestamo_campos'
down_revision: Union[str, Sequence[str], None] = 'c42b265544a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('prestamo', sa.Column('fecha_devolucion', sa.String(length=20), nullable=True))
    op.add_column('prestamo', sa.Column('turno', sa.String(length=20), nullable=False, server_default='mañana'))
    op.add_column('prestamo', sa.Column('copia_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'prestamo', 'copias', ['copia_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, 'prestamo', type_='foreignkey')
    op.drop_column('prestamo', 'copia_id')
    op.drop_column('prestamo', 'turno')
    op.drop_column('prestamo', 'fecha_devolucion')
