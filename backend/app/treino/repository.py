from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Treino


def criar(db: Session, dados: dict) -> Treino:
    treino = Treino(**dados)
    db.add(treino)
    db.flush()
    return treino


def listar(
    db: Session,
    dono_id: str,
    nome: str | None = None,
    tipo_treino: str | None = None,
) -> list[Treino]:
    """Monta a query aos poucos, so com os filtros que vieram preenchidos."""
    # O filtro do dono entra sempre e nao e opcional: e ele que garante que
    # nenhuma combinacao de query params consiga listar treino dos outros.
    query = select(Treino).where(Treino.dono_id == dono_id)

    if nome:
        # ilike ignora maiusculas/minusculas; os % em volta fazem "busca
        # contem", e nao comparacao exata.
        query = query.where(Treino.nome.ilike(f"%{nome}%"))

    # Comparacao com None, e nao "if tipo_treino:", porque aqui o que importa
    # e se o parametro foi enviado.
    if tipo_treino is not None:
        query = query.where(Treino.tipo_treino == tipo_treino)

    return list(db.scalars(query.order_by(Treino.nome)))


def buscar_por_id(db: Session, treino_id: str) -> Treino | None:
    return db.get(Treino, treino_id)


def excluir(db: Session, treino: Treino) -> None:
    db.delete(treino)
