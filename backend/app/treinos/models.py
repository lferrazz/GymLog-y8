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

    dono_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("usuarios.id", name="fk_treinos_dono"), nullable=True
    )
    dono = relationship("Usuario", back_populates="treinos")
