from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Treino
from .schemas import TreinoCriar


def criar(db: Session, dados: TreinoCriar) -> Treino:
    treino = Treino(**dados.model_dump())
    db.add(treino)
    db.flush()
    return treino


def listar(db: Session) -> list[Treino]:
    return list(db.scalars(select(Treino).order_by(Treino.data_treino.desc())))


def buscar_por_id(db: Session, treino_id: str) -> Treino | None:
    return db.get(Treino, treino_id)


def excluir(db: Session, treino: Treino) -> None:
    db.delete(treino)