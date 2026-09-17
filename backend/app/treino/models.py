from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Treino(Base):
    __tablename__ = "treinos"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    nome: Mapped[str] = mapped_column(String(100))
    tipo_treino: Mapped[str] = mapped_column(String(50))
    data_treino: Mapped[datetime] = mapped_column(DateTime)
    duracao_min: Mapped[int] = mapped_column(Integer)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # nullable=True porque a coluna nasce em um banco que pode ja ter treinos
    # sem dono: se fosse NOT NULL a migracao quebraria nas linhas antigas, que
    # nao teriam valor para preencher. O service e que garante que todo treino
    # novo nasce com dono.
    # O name= na ForeignKey e obrigatorio para o SQLite: sem nome explicito a
    # constraint fica anonima e o modo batch nao consegue recria-la depois.
    dono_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("usuarios.id", name="fk_treinos_dono"), nullable=True
    )
    dono = relationship("Usuario", back_populates="treinos")
