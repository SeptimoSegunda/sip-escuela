"""init: socios, libros, prestamos, usuarios, auditoria

Revision ID: c42b265544a3
Revises: 
Create Date: 2026-10-01 19:17:40.454197

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c42b265544a3'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Primero: quitar FK vieja de prestamo -> usuario
    op.drop_constraint('prestamo_id_usuario_fkey', 'prestamo', type_='foreignkey')
    
    # 2. Crear nueva tabla usuarios
    op.create_table('usuarios',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('nombre', sa.String(length=100), nullable=False),
    sa.Column('turno', sa.String(length=20), nullable=False),
    sa.Column('activo', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('turno')
    )
    
    # 3. Crear tabla auditoria
    op.create_table('auditoria',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('endpoint', sa.String(length=500), nullable=False),
    sa.Column('metodo', sa.String(length=10), nullable=False),
    sa.Column('turno', sa.String(length=20), nullable=False),
    sa.Column('status_code', sa.Integer(), nullable=False),
    sa.Column('duracion_ms', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('id_usuario', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['id_usuario'], ['usuarios.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # 4. Ahora sí, borrar tabla usuario vieja
    op.drop_table('usuario')
    
    # 5. Crear nueva FK prestamo -> usuarios
    op.create_foreign_key(None, 'prestamo', 'usuarios', ['id_usuario'], ['id'])
    
    # 6. Cambios en libros - solo añadir columnas nuevas y FKs
    op.add_column('libros', sa.Column('subtitulo', sa.String(length=300), nullable=True))
    op.add_column('libros', sa.Column('libristica', sa.String(length=50), nullable=True))
    op.add_column('libros', sa.Column('numero_de_inventario', sa.String(length=50), nullable=True))
    op.add_column('libros', sa.Column('ubicacion', sa.String(length=100), nullable=True))
    op.add_column('libros', sa.Column('publicacion', sa.String(length=100), nullable=True))
    op.add_column('libros', sa.Column('colleccion', sa.String(length=100), nullable=True))
    op.add_column('libros', sa.Column('edicion', sa.String(length=50), nullable=True))
    op.add_column('libros', sa.Column('lugar_publicacion', sa.String(length=100), nullable=True))
    op.add_column('libros', sa.Column('temas', sa.String(length=200), nullable=True))
    op.add_column('libros', sa.Column('numero', sa.String(length=50), nullable=True))
    op.add_column('libros', sa.Column('termino_material', sa.String(length=100), nullable=True))
    op.add_column('libros', sa.Column('clasificacion', sa.String(length=100), nullable=True))
    op.add_column('libros', sa.Column('extension', sa.Integer(), nullable=True))
    op.add_column('libros', sa.Column('nota_general', sa.Text(), nullable=True))
    op.add_column('libros', sa.Column('nota_contenido', sa.Text(), nullable=True))
    op.add_column('libros', sa.Column('id_editorial', sa.Integer(), nullable=True))
    op.add_column('libros', sa.Column('id_autor', sa.Integer(), nullable=True))
    op.alter_column('libros', 'autor',
               existing_type=sa.VARCHAR(length=150),
               type_=sa.String(length=200),
               nullable=True)
    op.alter_column('libros', 'editorial',
               existing_type=sa.VARCHAR(length=150),
               type_=sa.String(length=200),
               existing_nullable=True)
    op.drop_constraint('libros_isbn_key', 'libros', type_='unique')
    op.create_foreign_key(None, 'libros', 'editorial', ['id_editorial'], ['id'])
    op.create_foreign_key(None, 'libros', 'autor', ['id_autor'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    # Revertir cambios en libros
    op.drop_constraint(None, 'libros', type_='foreignkey')
    op.drop_constraint(None, 'libros', type_='foreignkey')
    op.create_unique_constraint('libros_isbn_key', 'libros', ['isbn'])
    op.alter_column('libros', 'editorial',
               existing_type=sa.String(length=200),
               type_=sa.VARCHAR(length=150),
               existing_nullable=True)
    op.alter_column('libros', 'autor',
               existing_type=sa.String(length=200),
               type_=sa.VARCHAR(length=150),
               nullable=False)
    op.drop_column('libros', 'id_autor')
    op.drop_column('libros', 'id_editorial')
    op.drop_column('libros', 'nota_contenido')
    op.drop_column('libros', 'nota_general')
    op.drop_column('libros', 'extension')
    op.drop_column('libros', 'clasificacion')
    op.drop_column('libros', 'termino_material')
    op.drop_column('libros', 'numero')
    op.drop_column('libros', 'temas')
    op.drop_column('libros', 'lugar_publicacion')
    op.drop_column('libros', 'edicion')
    op.drop_column('libros', 'colleccion')
    op.drop_column('libros', 'publicacion')
    op.drop_column('libros', 'ubicacion')
    op.drop_column('libros', 'numero_de_inventario')
    op.drop_column('libros', 'libristica')
    op.drop_column('libros', 'subtitulo')
    
    # Revertir FK prestamo
    op.drop_constraint(None, 'prestamo', type_='foreignkey')
    
    # Recrear tabla usuario vieja
    op.create_table('usuario',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('nombre', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('apellido', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('id_usuario', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('ano', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('turno', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('tipo_usuario', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('email', sa.VARCHAR(length=150), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='usuario_pkey'),
    sa.UniqueConstraint('email', name='usuario_email_key'),
    sa.UniqueConstraint('id_usuario', name='usuario_id_usuario_key')
    )
    
    # Recrear FK vieja
    op.create_foreign_key('prestamo_id_usuario_fkey', 'prestamo', 'usuario', ['id_usuario'], ['id'])
    
    # Borrar tablas nuevas
    op.drop_table('auditoria')
    op.drop_table('usuarios')