from sqlalchemy.orm import Session

from ..usuarios.models import Usuario
from . import repository
from .erros import TreinoNaoEncontradoError
from .models import Treino
from .schemas import TreinoAtualizar, TreinoCriar


def criar_treino(db: Session, dados: TreinoCriar, usuario: Usuario) -> Treino:
    valores = dados.model_dump()

    # O dono sai do token, nunca do corpo da requisicao: se viesse do JSON,
    # qualquer um poderia cadastrar treino no nome de outra pessoa.
    valores["dono_id"] = usuario.id

    treino = repository.criar(db, valores)
    db.commit()
    return treino


def listar_treinos(
    db: Session,
    usuario: Usuario,
    nome: str | None = None,
    tipo_treino: str | None = None,
) -> list[Treino]:
    return repository.listar(db, usuario.id, nome=nome, tipo_treino=tipo_treino)


def buscar_treino(db: Session, treino_id: str, usuario: Usuario) -> Treino:
    treino = repository.buscar_por_id(db, treino_id)

    # 404 e nao 403 de proposito: um 403 ("existe, mas voce nao pode") ja
    # confirmaria que aquele id existe no sistema, e daria para mapear o
    # acervo alheio so testando ids. Para quem nao e dono, o treino
    # simplesmente nao existe — e a mensagem e a mesma dos ids inventados.
    if treino is None or treino.dono_id != usuario.id:
        raise TreinoNaoEncontradoError
    return treino


def atualizar_treino(
    db: Session, treino_id: str, dados: TreinoAtualizar, usuario: Usuario
) -> Treino:
    treino = buscar_treino(db, treino_id, usuario)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(treino, campo, valor)
    db.commit()
    return treino


def excluir_treino(db: Session, treino_id: str, usuario: Usuario) -> None:
    treino = buscar_treino(db, treino_id, usuario)
    repository.excluir(db, treino)
    db.commit()
