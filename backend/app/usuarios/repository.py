from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Usuario


def buscar(db: Session, usuario_id: str) -> Usuario | None:
    return db.get(Usuario, usuario_id)


def buscar_por_email(db: Session, email: str) -> Usuario | None:
    return db.scalar(select(Usuario).where(Usuario.email == email))


def criar(db: Session, dados: dict) -> Usuario:
    usuario = Usuario(**dados)
    db.add(usuario)
    db.flush()
    return usuario
