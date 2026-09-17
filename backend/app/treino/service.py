from sqlalchemy.orm import Session

from . import repository
from .erros import TreinoNaoEncontradoError
from .models import Treino
from .schemas import TreinoAtualizar, TreinoCriar


def criar_treino(db: Session, dados: TreinoCriar) -> Treino:
    treino = repository.criar(db, dados)
    db.commit()
    return treino


def listar_treinos(db: Session) -> list[Treino]:
    return repository.listar(db)


def buscar_treino(db: Session, treino_id: str) -> Treino:
    treino = repository.buscar_por_id(db, treino_id)
    if treino is None:
        raise TreinoNaoEncontradoError
    return treino


def atualizar_treino(
    db: Session, treino_id: str, dados: TreinoAtualizar
) -> Treino:
    treino = buscar_treino(db, treino_id)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(treino, campo, valor)
    db.commit()
    return treino


def excluir_treino(db: Session, treino_id: str) -> None:
    treino = buscar_treino(db, treino_id)
    repository.excluir(db, treino)
    db.commit()