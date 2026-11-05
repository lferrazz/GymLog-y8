from datetime import date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import Treino


def criar(db: Session, dados: dict) -> Treino:
    treino = Treino(**dados)
    db.add(treino)
    db.commit()
    return treino


def listar(
    db: Session,
    dono_id: str,
    nome: str | None = None,
    tipo_treino: str | None = None,
) -> list[Treino]:
    # monta a consulta aos poucos: o dono sempre, o nome e o tipo so quando vierem
    query = select(Treino).where(Treino.dono_id == dono_id)

    if nome:
        query = query.where(Treino.nome.ilike(f"%{nome}%"))

    if tipo_treino is not None:
        query = query.where(Treino.tipo_treino == tipo_treino)

    return list(db.scalars(query.order_by(Treino.nome)))


def buscar_por_id(db: Session, treino_id: str) -> Treino | None:
    return db.get(Treino, treino_id)


def _do_dia(dono_id: str, dia: date, ignorar_id: str | None):
    # os treinos da pessoa entre 00:00 e 23:59 do dia, sem o que esta sendo editado
    inicio = datetime.combine(dia, time.min)
    filtros = [
        Treino.dono_id == dono_id,
        Treino.data_treino >= inicio,
        Treino.data_treino < inicio + timedelta(days=1),
    ]
    if ignorar_id is not None:
        filtros.append(Treino.id != ignorar_id)
    return filtros


def buscar_por_nome_no_dia(
    db: Session, dono_id: str, nome: str, dia: date, ignorar_id: str | None = None
) -> Treino | None:
    query = select(Treino).where(
        *_do_dia(dono_id, dia, ignorar_id),
        func.lower(Treino.nome) == nome.lower(),
    )
    return db.scalars(query).first()


def minutos_no_dia(
    db: Session, dono_id: str, dia: date, ignorar_id: str | None = None
) -> int:
    # soma a duracao dos treinos do dia; o coalesce devolve 0 quando nao ha nenhum
    query = select(func.coalesce(func.sum(Treino.duracao_min), 0)).where(
        *_do_dia(dono_id, dia, ignorar_id)
    )
    return db.scalar(query)


def atualizar(db: Session, treino: Treino, mudancas: dict) -> Treino:
    for campo, valor in mudancas.items():
        setattr(treino, campo, valor)
    db.commit()
    return treino


def excluir(db: Session, treino: Treino) -> None:
    db.delete(treino)
    db.commit()
