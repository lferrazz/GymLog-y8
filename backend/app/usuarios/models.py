from uuid import uuid4

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    nome: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Guardamos o hash, nunca a senha: se o banco vazar, o atacante leva
    # hashes bcrypt e nao as senhas dos usuarios.
    senha_hash: Mapped[str] = mapped_column(String(60))

    # back_populates nos dois lados faz o SQLAlchemy manter as duas pontas
    # sincronizadas na memoria, sem precisar de um novo SELECT.
    treinos = relationship("Treino", back_populates="dono")
