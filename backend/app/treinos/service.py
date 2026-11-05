from datetime import datetime

from . import repository
from .erros import (
    LimiteDiarioExcedido,
    TreinoDuplicado,
    TreinoNaoEncontrado,
    TreinoNoFuturo,
)

LIMITE_DIARIO_MIN = 600


def _conferir_regras_do_dia(
    db,
    dono_id: str,
    nome: str,
    data_treino: datetime,
    duracao_min: int,
    ignorar_id: str | None = None,
) -> None:
    # rn02: nao se registra treino que ainda nao aconteceu
    if data_treino > datetime.now(data_treino.tzinfo):
        raise TreinoNoFuturo

    dia = data_treino.date()

    # rn01: a mesma pessoa nao registra dois treinos com o mesmo nome no mesmo dia
    if repository.buscar_por_nome_no_dia(db, dono_id, nome, dia, ignorar_id):
        raise TreinoDuplicado(nome)

    # rn03: ninguem treina mais de 600 minutos somados no mesmo dia
    ja_treinado = repository.minutos_no_dia(db, dono_id, dia, ignorar_id)
    if ja_treinado + duracao_min > LIMITE_DIARIO_MIN:
        raise LimiteDiarioExcedido(LIMITE_DIARIO_MIN)


def listar(db, dono_id: str, nome: str | None = None, tipo_treino: str | None = None):
    return repository.listar(db, dono_id, nome=nome, tipo_treino=tipo_treino)


def buscar(db, treino_id: str, dono_id: str):
    treino = repository.buscar_por_id(db, treino_id)

    # rn04: cada pessoa so ve, altera e apaga os proprios treinos
    if treino is None or treino.dono_id != dono_id:
        raise TreinoNaoEncontrado
    return treino


def criar(db, dados: dict, dono_id: str):
    _conferir_regras_do_dia(
        db, dono_id, dados["nome"], dados["data_treino"], dados["duracao_min"]
    )

    # rn04: o dono do treino e quem esta logado, nunca o que vem no pedido
    return repository.criar(db, {**dados, "dono_id": dono_id})


def atualizar(db, treino_id: str, mudancas: dict, dono_id: str):
    treino = buscar(db, treino_id, dono_id)

    # as regras olham o treino como vai ficar: o pedido por cima do que ja esta gravado
    _conferir_regras_do_dia(
        db,
        dono_id,
        mudancas.get("nome") or treino.nome,
        mudancas.get("data_treino") or treino.data_treino,
        mudancas.get("duracao_min") or treino.duracao_min,
        ignorar_id=treino.id,
    )

    return repository.atualizar(db, treino, mudancas)


def excluir(db, treino_id: str, dono_id: str) -> None:
    treino = buscar(db, treino_id, dono_id)
    repository.excluir(db, treino)
